<?php
defined('ABSPATH') || exit;

/**
 * Registrar todos los endpoints REST del juego.
 */
function snd_register_routes(): void {
    $ns = 'sonadle/v1';

    // Canción del día — público (pista 1 para anónimos, pistas desbloqueadas para logueados)
    register_rest_route($ns, '/game/today', [
        'methods'             => 'GET',
        'callback'            => 'snd_endpoint_game_today',
        'permission_callback' => '__return_true',
    ]);

    // Estado de la partida del usuario actual — requiere auth
    register_rest_route($ns, '/game/state', [
        'methods'             => 'GET',
        'callback'            => 'snd_endpoint_game_state',
        'permission_callback' => 'snd_require_auth',
    ]);

    // Registrar un intento — requiere auth
    register_rest_route($ns, '/game/attempt', [
        'methods'             => 'POST',
        'callback'            => 'snd_endpoint_game_attempt',
        'permission_callback' => 'snd_require_auth',
    ]);

    // Autocompletado de canciones — requiere auth (evita abuso)
    register_rest_route($ns, '/songs/search', [
        'methods'             => 'GET',
        'callback'            => 'snd_endpoint_songs_search',
        'permission_callback' => 'snd_require_auth',
    ]);

    // Tabla de clasificación mensual — público
    register_rest_route($ns, '/leaderboard/monthly', [
        'methods'             => 'GET',
        'callback'            => 'snd_endpoint_leaderboard_monthly',
        'permission_callback' => '__return_true',
    ]);

    // Posición del usuario en la clasificación — requiere auth
    register_rest_route($ns, '/leaderboard/my-rank', [
        'methods'             => 'GET',
        'callback'            => 'snd_endpoint_leaderboard_my_rank',
        'permission_callback' => 'snd_require_auth',
    ]);

    // Verificar sesión — público (devuelve datos del usuario o 401)
    register_rest_route($ns, '/user/me', [
        'methods'             => 'GET',
        'callback'            => 'snd_endpoint_user_me',
        'permission_callback' => '__return_true',
    ]);

    // Perfil del usuario — requiere auth
    register_rest_route($ns, '/user/profile', [
        'methods'             => 'GET',
        'callback'            => 'snd_endpoint_user_profile',
        'permission_callback' => 'snd_require_auth',
    ]);
}

// =============================================================================
// Callbacks de los endpoints
// =============================================================================

function snd_endpoint_game_today(WP_REST_Request $request): WP_REST_Response {
    $song = snd_get_today_song();

    if (!$song) {
        return new WP_REST_Response(['error' => 'No hay canción programada para hoy.'], 404);
    }

    $user = snd_get_current_user();

    // Sin login: solo pista 1
    if (!$user) {
        return new WP_REST_Response([
            'game_number'   => snd_get_game_number($song['play_date']),
            'hints'         => [
                ['type' => 'lyric', 'value' => $song['lyric_hint']],
            ],
            'requires_login'=> true,
        ]);
    }

    // Con login: pistas desbloqueadas según los intentos usados
    $state = snd_get_game_state($user['user_id'], (int) $song['id']);

    return new WP_REST_Response([
        'game_number'   => snd_get_game_number($song['play_date']),
        'hints'         => snd_get_unlocked_hints($song, $state['attempts_used']),
        'attempts_used' => $state['attempts_used'],
        'max_attempts'  => 6,
        'finished'      => $state['finished'],
        'solved'        => $state['solved'],
    ]);
}

function snd_endpoint_game_state(WP_REST_Request $request): WP_REST_Response {
    $user = snd_get_current_user();
    $song = snd_get_today_song();

    if (!$song) return new WP_REST_Response(['error' => 'Sin canción hoy.'], 404);

    $state = snd_get_game_state($user['user_id'], (int) $song['id']);

    return new WP_REST_Response($state);
}

function snd_endpoint_game_attempt(WP_REST_Request $request): WP_REST_Response {
    $user   = snd_get_current_user();
    $song   = snd_get_today_song();
    $answer = sanitize_text_field($request->get_param('answer'));

    if (!$song) return new WP_REST_Response(['error' => 'Sin canción hoy.'], 404);
    if (!$answer) return new WP_REST_Response(['error' => 'Respuesta vacía.'], 400);

    $song_id = (int) $song['id'];
    $state   = snd_get_game_state($user['user_id'], $song_id);

    // Validaciones
    if ($state['finished']) {
        return new WP_REST_Response(['error' => 'Ya has terminado la partida de hoy.'], 400);
    }
    if ($state['attempts_used'] >= 6) {
        return new WP_REST_Response(['error' => 'Has agotado los intentos.'], 400);
    }

    $attempt_num = $state['attempts_used'] + 1;
    $is_correct  = snd_check_answer($answer, $song['title']);

    snd_save_attempt($user['user_id'], $song_id, $attempt_num, $answer, $is_correct);

    $response = [
        'attempt_num' => $attempt_num,
        'is_correct'  => $is_correct,
        'finished'    => false,
        'points'      => 0,
    ];

    // Partida terminada
    if ($is_correct || $attempt_num >= 6) {
        $points = snd_save_result($user['user_id'], $song_id, $is_correct, $attempt_num);
        $response['finished'] = true;
        $response['solved']   = $is_correct;
        $response['points']   = $points;
        $response['title']    = $song['title']; // Revelar el título al terminar
        $response['artist']   = $song['artist'];
    }

    // Siguiente pista desbloqueada (si no ha terminado)
    if (!$response['finished']) {
        $response['new_hint'] = snd_get_hint($song, $attempt_num + 1);
    }

    return new WP_REST_Response($response);
}

function snd_endpoint_songs_search(WP_REST_Request $request): WP_REST_Response {
    $query = sanitize_text_field($request->get_param('q'));

    if (strlen($query) < 2) {
        return new WP_REST_Response([], 200);
    }

    $results = snd_search_songs($query);
    return new WP_REST_Response($results);
}

function snd_endpoint_leaderboard_monthly(): WP_REST_Response {
    $leaderboard = snd_get_leaderboard(20);
    // TODO: enriquecer con usernames de Flarum
    return new WP_REST_Response($leaderboard);
}

function snd_endpoint_leaderboard_my_rank(): WP_REST_Response {
    $user = snd_get_current_user();
    $rank = snd_get_user_rank($user['user_id']);
    return new WP_REST_Response(['rank' => $rank]);
}

function snd_endpoint_user_me(): WP_REST_Response {
    $user = snd_get_current_user();
    if (!$user) {
        return new WP_REST_Response(['logged_in' => false], 200);
    }
    return new WP_REST_Response(['logged_in' => true, 'user' => $user]);
}

function snd_endpoint_user_profile(): WP_REST_Response {
    global $wpdb;
    $user       = snd_get_current_user();
    $year_month = current_time('Y-m');

    $streak = $wpdb->get_row($wpdb->prepare(
        "SELECT current_streak, max_streak FROM snd_streaks WHERE user_id = %d",
        $user['user_id']
    ), ARRAY_A);

    $points = $wpdb->get_row($wpdb->prepare(
        "SELECT total_points, games_played, games_solved FROM snd_monthly_points
         WHERE user_id = %d AND year_month = %s",
        $user['user_id'], $year_month
    ), ARRAY_A);

    $rank = snd_get_user_rank($user['user_id']);

    return new WP_REST_Response([
        'user'           => $user,
        'current_streak' => (int) ($streak['current_streak'] ?? 0),
        'max_streak'     => (int) ($streak['max_streak'] ?? 0),
        'monthly_points' => (int) ($points['total_points'] ?? 0),
        'monthly_rank'   => $rank,
        'games_played'   => (int) ($points['games_played'] ?? 0),
        'games_solved'   => (int) ($points['games_solved'] ?? 0),
    ]);
}

// =============================================================================
// Helpers internos
// =============================================================================

/**
 * Calcular el número de partida desde la fecha de inicio del juego.
 */
function snd_get_game_number(string $play_date): int {
    // Fecha de inicio del juego (ajustar cuando se conozca)
    $start_date = new DateTime('2026-04-01');
    $play       = new DateTime($play_date);
    return max(1, $play->diff($start_date)->days + 1);
}

/**
 * Obtener las pistas desbloqueadas según los intentos usados.
 * Pista N se desbloquea antes del intento N+1.
 */
function snd_get_unlocked_hints(array $song, int $attempts_used): array {
    $hints = [];
    for ($i = 1; $i <= min($attempts_used + 1, 6); $i++) {
        $hints[] = snd_get_hint($song, $i);
    }
    return $hints;
}

/**
 * Obtener una pista concreta por número.
 */
function snd_get_hint(array $song, int $hint_number): array {
    return match ($hint_number) {
        1 => ['type' => 'lyric',        'value' => $song['lyric_hint']],
        2 => ['type' => 'year',         'value' => (int) $song['year']],
        3 => ['type' => 'genre',        'value' => $song['genre']],
        4 => ['type' => 'artist',       'value' => $song['artist']],
        5 => ['type' => 'cover_pixel',  'value' => $song['cover_url']],
        6 => ['type' => 'cover_medium', 'value' => $song['cover_url']],
        default => ['type' => 'unknown', 'value' => null],
    };
}
