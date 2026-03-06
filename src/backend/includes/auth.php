<?php
/**
 * Sonadle — Autenticación via sesión de Flarum
 *
 * Lee la cookie flarum_session, la valida contra la DB de Flarum
 * y devuelve los datos del usuario. Sin modificar Flarum.
 *
 * Constantes requeridas en wp-config.php:
 *   SND_FLARUM_DB_HOST          — host de la DB de Flarum (normalmente 'localhost')
 *   SND_FLARUM_DB_NAME          — nombre de la base de datos de Flarum
 *   SND_FLARUM_DB_USER          — usuario de MySQL
 *   SND_FLARUM_DB_PASS          — contraseña de MySQL
 *   SND_FLARUM_DB_PREFIX        — prefijo de tablas de Flarum (normalmente 'flarum_')
 *   SND_FLARUM_SESSION_COOKIE   — nombre de la cookie de sesión (normalmente 'flarum_session')
 *
 * IMPORTANTE antes de activar en producción:
 *   1. Verificar en DevTools que la cookie flarum_session tiene Path: / (no /foros)
 *   2. Confirmar que existe la tabla sessions en la DB de Flarum
 *   3. Confirmar el prefijo de tablas de Flarum
 */

declare(strict_types=1);

defined('ABSPATH') || exit;

/**
 * Devuelve una conexión PDO a la base de datos de Flarum.
 * La conexión se crea una sola vez por request (singleton).
 */
function snd_flarum_db(): ?PDO {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    if (
        !defined('SND_FLARUM_DB_HOST') ||
        !defined('SND_FLARUM_DB_NAME') ||
        !defined('SND_FLARUM_DB_USER') ||
        !defined('SND_FLARUM_DB_PASS')
    ) {
        error_log('[Sonadle] Faltan constantes de DB de Flarum en wp-config.php');
        return null;
    }

    try {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=utf8mb4',
            SND_FLARUM_DB_HOST,
            SND_FLARUM_DB_NAME
        );
        $pdo = new PDO($dsn, SND_FLARUM_DB_USER, SND_FLARUM_DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT            => 3,
        ]);
    } catch (PDOException $e) {
        error_log('[Sonadle] No se puede conectar a la DB de Flarum: ' . $e->getMessage());
        $pdo = null;
    }

    return $pdo;
}

/**
 * Valida la sesión de Flarum y devuelve los datos del usuario.
 *
 * Flujo:
 * 1. Lee la cookie flarum_session
 * 2. Busca esa sesión en la tabla sessions de Flarum
 * 3. Obtiene el user_id de la sesión
 * 4. Consulta la tabla users para obtener username y avatar_url
 * 5. Comprueba si el usuario es admin (grupo 1 = Administrators en Flarum)
 *
 * @return array{user_id: int, username: string, avatar_url: string, is_admin: bool}|null
 */
function snd_get_current_user(): ?array {
    $cookie_name = defined('SND_FLARUM_SESSION_COOKIE') ? SND_FLARUM_SESSION_COOKIE : 'flarum_session';

    // 1. Leer la cookie
    $session_id = $_COOKIE[$cookie_name] ?? null;

    if (empty($session_id)) {
        return null;
    }

    // Sanear: el session ID solo debe contener caracteres alfanuméricos
    if (!preg_match('/^[a-zA-Z0-9]{20,}$/', $session_id)) {
        return null;
    }

    $pdo = snd_flarum_db();
    if ($pdo === null) {
        return null;
    }

    $prefix = defined('SND_FLARUM_DB_PREFIX') ? SND_FLARUM_DB_PREFIX : 'flarum_';

    try {
        // 2 y 3. Obtener user_id de la sesión
        // Descartar sesiones sin usuario (anónimas) y caducadas (últimas 2 horas de inactividad)
        $stmt = $pdo->prepare("
            SELECT user_id
            FROM {$prefix}sessions
            WHERE id = :session_id
              AND user_id IS NOT NULL
              AND last_activity > :cutoff
            LIMIT 1
        ");
        $stmt->execute([
            ':session_id' => $session_id,
            ':cutoff'     => time() - 7200, // sesiones activas en las últimas 2 horas
        ]);
        $session = $stmt->fetch();

        if (!$session) {
            return null;
        }

        $user_id = (int) $session['user_id'];

        // 4. Obtener datos del usuario
        $stmt = $pdo->prepare("
            SELECT id, username, avatar_url
            FROM {$prefix}users
            WHERE id = :user_id
              AND is_email_confirmed = 1
            LIMIT 1
        ");
        $stmt->execute([':user_id' => $user_id]);
        $user = $stmt->fetch();

        if (!$user) {
            return null;
        }

        // 5. Comprobar si es admin (grupo 1 = Administrators en Flarum)
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as is_admin
            FROM {$prefix}group_user
            WHERE user_id = :user_id
              AND group_id = 1
        ");
        $stmt->execute([':user_id' => $user_id]);
        $admin_check = $stmt->fetch();
        $is_admin    = (bool) ($admin_check['is_admin'] ?? 0);

        // Normalizar avatar_url: Flarum puede guardar rutas relativas
        $avatar_url = $user['avatar_url'] ?? '';
        if ($avatar_url && !str_starts_with($avatar_url, 'http')) {
            $avatar_url = 'https://jenesaispop.com/foros/assets/avatars/' . ltrim($avatar_url, '/');
        }

        return [
            'user_id'    => (int) $user['id'],
            'username'   => (string) $user['username'],
            'avatar_url' => $avatar_url,
            'is_admin'   => $is_admin,
        ];

    } catch (PDOException $e) {
        error_log('[Sonadle] Error al validar sesión de Flarum: ' . $e->getMessage());
        return null;
    }
}

/**
 * Middleware para endpoints de la WP REST API que requieren login.
 *
 * Uso en register_rest_route():
 *   'permission_callback' => 'snd_require_auth'
 *
 * Inyecta el usuario en el request como '_flarum_user' para no volver
 * a consultar la DB en el handler.
 *
 * @return true|WP_Error
 */
function snd_require_auth(WP_REST_Request $request): true|WP_Error {
    $user = snd_get_current_user();

    if ($user === null) {
        return new WP_Error(
            'snd_not_authenticated',
            'Necesitas estar logueado en el foro para esto.',
            ['status' => 401]
        );
    }

    $request->set_param('_flarum_user', $user);

    return true;
}

/**
 * Middleware para endpoints que requieren ser admin de Flarum.
 *
 * @return true|WP_Error
 */
function snd_require_admin(WP_REST_Request $request): true|WP_Error {
    $auth = snd_require_auth($request);

    if (is_wp_error($auth)) {
        return $auth;
    }

    $user = $request->get_param('_flarum_user');

    if (!$user['is_admin']) {
        return new WP_Error(
            'snd_forbidden',
            'No tienes permisos para esto.',
            ['status' => 403]
        );
    }

    return true;
}

/**
 * URL de login del foro.
 * El botón de "iniciar sesión" del juego redirige aquí.
 * Flarum, tras el login, redirige de vuelta al juego con la cookie ya activa.
 */
function snd_get_login_url(): string {
    $return = urlencode(home_url('/sonadle'));
    return home_url('/foros/login?return=' . $return);
}

// =============================================================================
// Plan B — Validación por API token de Flarum
// Usar si la cookie tiene path=/foros y no es accesible desde /sonadle
// =============================================================================

/**
 * Valida un token opaco de Flarum (obtenido via POST /foros/api/token).
 * Alternativa a la validación por cookie si el SSO transparente no funciona.
 *
 * @return array{user_id: int, username: string, avatar_url: string, is_admin: bool}|null
 */
function snd_get_user_from_api_token(string $token): ?array {
    if (empty($token)) {
        return null;
    }

    $pdo = snd_flarum_db();
    if (!$pdo) {
        return null;
    }

    $prefix = defined('SND_FLARUM_DB_PREFIX') ? SND_FLARUM_DB_PREFIX : 'flarum_';

    try {
        $stmt = $pdo->prepare("
            SELECT at.user_id, u.username, u.avatar_url
            FROM {$prefix}access_tokens at
            JOIN {$prefix}users u ON u.id = at.user_id
            WHERE at.token = :token
              AND (at.expires_at IS NULL OR at.expires_at > NOW())
            LIMIT 1
        ");
        $stmt->execute([':token' => $token]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        $stmt = $pdo->prepare("
            SELECT COUNT(*) as is_admin
            FROM {$prefix}group_user
            WHERE user_id = :uid AND group_id = 1
        ");
        $stmt->execute([':uid' => $row['user_id']]);
        $admin = $stmt->fetch();

        $avatar_url = $row['avatar_url'] ?? '';
        if ($avatar_url && !str_starts_with($avatar_url, 'http')) {
            $avatar_url = 'https://jenesaispop.com/foros/assets/avatars/' . ltrim($avatar_url, '/');
        }

        return [
            'user_id'    => (int) $row['user_id'],
            'username'   => (string) $row['username'],
            'avatar_url' => $avatar_url,
            'is_admin'   => (bool) ($admin['is_admin'] ?? 0),
        ];

    } catch (PDOException $e) {
        error_log('[Sonadle] Error validando API token de Flarum: ' . $e->getMessage());
        return null;
    }
}
