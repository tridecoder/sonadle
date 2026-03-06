<?php
defined('ABSPATH') || exit;

/**
 * Crear las tablas del juego.
 * Se llama al activar el plugin.
 */
function snd_create_tables(): void {
    global $wpdb;
    $charset = $wpdb->get_charset_collate();

    $sql = "
    CREATE TABLE IF NOT EXISTS snd_songs (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        play_date    DATE NOT NULL,
        title        VARCHAR(255) NOT NULL,
        artist       VARCHAR(255) NOT NULL,
        album        VARCHAR(255),
        year         YEAR,
        genre        VARCHAR(100),
        lyric_hint   TEXT NOT NULL,
        cover_url    VARCHAR(500),
        spotify_id   VARCHAR(50),
        difficulty   TINYINT DEFAULT 3,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by   INT UNSIGNED,
        UNIQUE KEY uq_play_date (play_date),
        INDEX idx_play_date (play_date)
    ) $charset;

    CREATE TABLE IF NOT EXISTS snd_attempts (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id      INT UNSIGNED NOT NULL,
        song_id      INT UNSIGNED NOT NULL,
        play_date    DATE NOT NULL,
        attempt_num  TINYINT NOT NULL,
        answer       VARCHAR(255) NOT NULL,
        is_correct   TINYINT(1) NOT NULL DEFAULT 0,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_attempt (user_id, song_id, attempt_num),
        INDEX idx_user_date (user_id, play_date)
    ) $charset;

    CREATE TABLE IF NOT EXISTS snd_results (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id       INT UNSIGNED NOT NULL,
        song_id       INT UNSIGNED NOT NULL,
        play_date     DATE NOT NULL,
        solved        TINYINT(1) NOT NULL DEFAULT 0,
        attempts_used TINYINT NOT NULL,
        points        TINYINT NOT NULL DEFAULT 0,
        completed_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_day (user_id, play_date),
        INDEX idx_play_date (play_date),
        INDEX idx_user_id (user_id)
    ) $charset;

    CREATE TABLE IF NOT EXISTS snd_streaks (
        user_id        INT UNSIGNED PRIMARY KEY,
        current_streak INT UNSIGNED DEFAULT 0,
        max_streak     INT UNSIGNED DEFAULT 0,
        last_played    DATE,
        updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) $charset;

    CREATE TABLE IF NOT EXISTS snd_monthly_points (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id      INT UNSIGNED NOT NULL,
        year_month   CHAR(7) NOT NULL,
        total_points INT UNSIGNED DEFAULT 0,
        games_played INT UNSIGNED DEFAULT 0,
        games_solved INT UNSIGNED DEFAULT 0,
        UNIQUE KEY uq_user_month (user_id, year_month),
        INDEX idx_month_points (year_month, total_points DESC)
    ) $charset;

    CREATE TABLE IF NOT EXISTS snd_leaderboard_archive (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        year_month    CHAR(7) NOT NULL,
        rank_position INT UNSIGNED NOT NULL,
        user_id       INT UNSIGNED NOT NULL,
        username      VARCHAR(100) NOT NULL,
        total_points  INT UNSIGNED NOT NULL,
        games_played  INT UNSIGNED NOT NULL,
        archived_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_month (year_month)
    ) $charset;
    ";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
}

/**
 * Obtener la canción del día actual.
 */
function snd_get_today_song(): ?array {
    global $wpdb;
    $today = current_time('Y-m-d');

    $song = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM snd_songs WHERE play_date = %s LIMIT 1",
            $today
        ),
        ARRAY_A
    );

    return $song ?: null;
}

/**
 * Obtener el estado de la partida de un usuario para hoy.
 */
function snd_get_game_state(int $user_id, int $song_id): array {
    global $wpdb;
    $today = current_time('Y-m-d');

    $attempts = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT attempt_num, answer, is_correct
             FROM snd_attempts
             WHERE user_id = %d AND song_id = %d
             ORDER BY attempt_num ASC",
            $user_id, $song_id
        ),
        ARRAY_A
    );

    $result = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT solved, attempts_used, points
             FROM snd_results
             WHERE user_id = %d AND play_date = %s",
            $user_id, $today
        ),
        ARRAY_A
    );

    return [
        'attempts'     => $attempts ?: [],
        'attempts_used'=> count($attempts),
        'finished'     => !empty($result),
        'solved'       => !empty($result['solved']),
        'points'       => (int) ($result['points'] ?? 0),
    ];
}

/**
 * Guardar un intento.
 * Devuelve true si el intento es correcto, false si no.
 */
function snd_save_attempt(int $user_id, int $song_id, int $attempt_num, string $answer, bool $is_correct): void {
    global $wpdb;
    $today = current_time('Y-m-d');

    $wpdb->insert('snd_attempts', [
        'user_id'     => $user_id,
        'song_id'     => $song_id,
        'play_date'   => $today,
        'attempt_num' => $attempt_num,
        'answer'      => $answer,
        'is_correct'  => $is_correct ? 1 : 0,
    ]);
}

/**
 * Guardar el resultado final de una partida.
 */
function snd_save_result(int $user_id, int $song_id, bool $solved, int $attempts_used): int {
    global $wpdb;
    $today = current_time('Y-m-d');
    $points = $solved ? max(0, 7 - $attempts_used) : 0;

    $wpdb->insert('snd_results', [
        'user_id'      => $user_id,
        'song_id'      => $song_id,
        'play_date'    => $today,
        'solved'       => $solved ? 1 : 0,
        'attempts_used'=> $attempts_used,
        'points'       => $points,
    ]);

    // Actualizar racha
    snd_update_streak($user_id, $today);

    // Actualizar puntos mensuales
    snd_update_monthly_points($user_id, $points, $solved);

    return $points;
}

/**
 * Actualizar la racha del usuario.
 */
function snd_update_streak(int $user_id, string $today): void {
    global $wpdb;

    $streak = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT current_streak, max_streak, last_played FROM snd_streaks WHERE user_id = %d",
            $user_id
        ),
        ARRAY_A
    );

    $yesterday = date('Y-m-d', strtotime('-1 day', strtotime($today)));

    if (!$streak) {
        $wpdb->insert('snd_streaks', [
            'user_id'        => $user_id,
            'current_streak' => 1,
            'max_streak'     => 1,
            'last_played'    => $today,
        ]);
        return;
    }

    if ($streak['last_played'] === $today) return; // Ya contado hoy

    $current = ($streak['last_played'] === $yesterday)
        ? (int) $streak['current_streak'] + 1
        : 1; // Racha rota

    $max = max($current, (int) $streak['max_streak']);

    $wpdb->update('snd_streaks',
        ['current_streak' => $current, 'max_streak' => $max, 'last_played' => $today],
        ['user_id' => $user_id]
    );
}

/**
 * Actualizar puntos mensuales del usuario.
 */
function snd_update_monthly_points(int $user_id, int $points, bool $solved): void {
    global $wpdb;
    $year_month = current_time('Y-m');

    $existing = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT id FROM snd_monthly_points WHERE user_id = %d AND year_month = %s",
            $user_id, $year_month
        )
    );

    if ($existing) {
        $wpdb->query($wpdb->prepare(
            "UPDATE snd_monthly_points
             SET total_points = total_points + %d,
                 games_played = games_played + 1,
                 games_solved = games_solved + %d
             WHERE user_id = %d AND year_month = %s",
            $points, $solved ? 1 : 0, $user_id, $year_month
        ));
    } else {
        $wpdb->insert('snd_monthly_points', [
            'user_id'      => $user_id,
            'year_month'   => $year_month,
            'total_points' => $points,
            'games_played' => 1,
            'games_solved' => $solved ? 1 : 0,
        ]);
    }
}

/**
 * Obtener tabla de clasificación del mes actual.
 */
function snd_get_leaderboard(int $limit = 20): array {
    global $wpdb;
    $year_month = current_time('Y-m');

    return $wpdb->get_results(
        $wpdb->prepare(
            "SELECT user_id, total_points, games_played, games_solved
             FROM snd_monthly_points
             WHERE year_month = %s
             ORDER BY total_points DESC
             LIMIT %d",
            $year_month, $limit
        ),
        ARRAY_A
    ) ?: [];
}

/**
 * Obtener posición del usuario en la clasificación del mes.
 */
function snd_get_user_rank(int $user_id): int {
    global $wpdb;
    $year_month = current_time('Y-m');

    $user_points = $wpdb->get_var($wpdb->prepare(
        "SELECT total_points FROM snd_monthly_points WHERE user_id = %d AND year_month = %s",
        $user_id, $year_month
    ));

    if ($user_points === null) return 0;

    $rank = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) + 1 FROM snd_monthly_points
         WHERE year_month = %s AND total_points > %d",
        $year_month, $user_points
    ));

    return (int) $rank;
}

/**
 * Normalizar una respuesta del usuario para comparación fuzzy.
 */
function snd_normalize_answer(string $text): string {
    // Minúsculas
    $text = mb_strtolower($text, 'UTF-8');
    // Eliminar contenido entre paréntesis
    $text = preg_replace('/\([^)]*\)/', '', $text);
    // Eliminar acentos y diacríticos
    $text = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
    // Eliminar artículos iniciales (inglés y español)
    $text = preg_replace('/^(the|a|an|el|la|los|las|un|una)\s+/i', '', trim($text));
    // Eliminar puntuación
    $text = preg_replace('/[^\w\s]/', '', $text);
    // Colapsar espacios
    $text = preg_replace('/\s+/', ' ', $text);
    return trim($text);
}

/**
 * Comparar la respuesta del usuario con el título correcto.
 */
function snd_check_answer(string $user_answer, string $correct_title): bool {
    return snd_normalize_answer($user_answer) === snd_normalize_answer($correct_title);
}
