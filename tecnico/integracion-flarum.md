# Integración con Flarum — SSO

**Estado:** Investigado. Opción elegida: C (cookie de sesión compartida).
**Riesgo:** BAJO — mismo dominio, acceso directo a DB de Flarum desde el plugin WordPress.

---

## Objetivo

Que un usuario logueado en el foro de jenesaispop (Flarum) esté automáticamente logueado en el juego, sin doble login ni cuenta separada.

## Datos del usuario que necesitamos de Flarum

| Campo | Uso en el juego |
|-------|-----------------|
| `user_id` | Identificar al usuario en la DB del juego |
| `username` | Mostrar en la tabla de clasificación |
| `avatar_url` | Mostrar en la tabla (opcional, no bloqueante) |
| `is_admin` | Dar acceso al panel de admin del juego |

---

## Investigación técnica

### Opción A — Token nativo de Flarum (`POST /api/token`)

**¿Existe el endpoint?** Sí. Flarum expone `POST /foros/api/token`.

**Parámetros que acepta:**
```json
{
  "identification": "email_o_username",
  "password": "contraseña",
  "lifetime": 3600
}
```

**¿Qué devuelve?** Un token **opaco** (no JWT). Es un string aleatorio que Flarum almacena en la tabla `access_tokens` de su base de datos. No es un JWT firmado — no tiene payload decodificable.

```json
{
  "token": "abc123...",
  "userId": 42
}
```

**¿El token incluye user_id y username?** Devuelve `userId` en la respuesta inicial, pero el token en sí no contiene datos — es una referencia opaca. Para obtener `username` y `avatar_url` hay que hacer un segundo request: `GET /foros/api/users/{userId}` con el header `Authorization: Token abc123...`.

**¿Cuánto dura?** El parámetro `lifetime` es en segundos. Sin `lifetime` (o con `lifetime: 0`) el token no caduca (token persistente). Con lifetime definido, caduca en ese tiempo. No existe refresh token — hay que volver a autenticar o usar un token sin expiración.

**¿Se puede validar localmente sin llamar a Flarum?** No. Al ser un token opaco, la única forma de validarlo es consultar la tabla `access_tokens` en la DB de Flarum o hacer `GET /foros/api/token` (que no existe como endpoint de validación). En la práctica, hay que ir a la DB o hacer un GET al API.

**Problema principal para este caso:** El flujo requiere que el usuario introduzca sus credenciales en el juego (o que el juego redirija a un formulario que devuelva el token). Flarum no tiene un OAuth2 flow nativo que permita "login en Flarum → redirigir de vuelta al juego con token". El endpoint `POST /api/token` está pensado para clientes API que ya tienen las credenciales, no para un flujo de autorización web delegado.

**Conclusión:** Viable solo si el juego pide usuario/contraseña directamente y los manda a `POST /api/token`. Funciona, pero obliga al usuario a introducir sus credenciales en el juego aunque ya esté logueado en el foro. Elimina la ventaja del SSO transparente.

---

### Opción C — Cookie de sesión compartida (ELEGIDA)

**¿Qué nombre tiene la cookie de sesión de Flarum?**

La cookie se llama `flarum_session`. Flarum usa el sistema de sesiones de PHP a través de su stack PSR-7/PSR-15 (Slim Framework). El nombre de la cookie está definido en `config.php` del foro bajo la clave `session`, y por defecto es `flarum_session`.

Para confirmar el nombre exacto en la instalación de jenesaispop:
```bash
grep -r "session" /path/to/flarum/config.php
# o buscar en el navegador la cookie cuando estás logueado en /foros
```

**¿Cómo gestiona Flarum las sesiones internamente?**

Flarum gestiona sesiones con el manejador de sesiones nativo de PHP pero usando su propia tabla de base de datos. La lógica está en `Flarum\Http\SessionServiceProvider` y usa `Illuminate\Session\DatabaseSessionHandler` (heredado del ORM Eloquent que usa Flarum).

**Tabla de MySQL que usa:** `sessions`

**Columnas de la tabla `sessions`:**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | varchar(255) | ID de sesión (valor de la cookie `flarum_session`) |
| `user_id` | int, nullable | ID del usuario autenticado. NULL si sesión anónima |
| `ip_address` | varchar(45), nullable | IP del cliente |
| `user_agent` | text, nullable | User agent del cliente |
| `payload` | longtext | Datos de sesión serializados en base64 |
| `last_activity` | int | Unix timestamp de última actividad |

**¿Se puede leer la cookie desde PHP externo y validarla contra la DB?** Sí, directamente. El valor de `flarum_session` es el `id` de la tabla `sessions`. Con ese ID se puede hacer una query a la DB de Flarum y obtener el `user_id`. Luego, con el `user_id`, se consulta la tabla `users` de Flarum para obtener `username`, `avatar_url` e `is_admin`.

**Tabla `users` de Flarum — columnas relevantes:**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | int | ID del usuario |
| `username` | varchar(100) | Nombre de usuario |
| `email` | varchar(150) | Email |
| `avatar_url` | varchar(255), nullable | URL del avatar (relativa o absoluta) |
| `is_email_confirmed` | tinyint | 1 si el email está verificado |
| `joined_at` | datetime | Fecha de registro |

**¿Cómo saber si un usuario es admin?** Flarum no tiene una columna `is_admin` en `users`. Los admins se gestionan a través de la tabla `group_user` y la tabla `groups`. El grupo con `id = 1` es el grupo "Administrators". Query:

```sql
SELECT COUNT(*) FROM flarum_group_user
WHERE user_id = ? AND group_id = 1
```

**¿Por qué funciona que la cookie sea accesible desde `/sonadle`?** La cookie `flarum_session` se establece con `domain=jenesaispop.com` (o sin domain, lo que la hace válida para todo el dominio). Al estar el juego en `jenesaispop.com/sonadle` y el foro en `jenesaispop.com/foros`, PHP del plugin WordPress puede leer `$_COOKIE['flarum_session']` directamente.

---

## Opción elegida: C — Cookie de sesión compartida

**Justificación:** Es la opción más simple de implementar: cero configuración en Flarum, cero plugins, cero flujo OAuth. Si el usuario ya está logueado en el foro, el juego lo reconoce automáticamente sin que haga nada. La implementación es una consulta SQL contra la DB de Flarum — unas 30 líneas de PHP. El único requisito es tener acceso a la DB de Flarum desde el plugin WordPress, que al estar en el mismo servidor es directo con una segunda conexión PDO.

---

## Implementación

### Configuración previa

En el `wp-config.php` o en la configuración del plugin, añadir las constantes de conexión a la DB de Flarum:

```php
// Conexión a la base de datos de Flarum
// Añadir en wp-config.php o en el plugin (no en el repo)
define('SND_FLARUM_DB_HOST', 'localhost');
define('SND_FLARUM_DB_NAME', 'nombre_db_flarum');
define('SND_FLARUM_DB_USER', 'usuario_db');
define('SND_FLARUM_DB_PASS', 'contraseña_db');
define('SND_FLARUM_DB_PREFIX', 'flarum_'); // prefijo de tablas de Flarum
define('SND_FLARUM_SESSION_COOKIE', 'flarum_session'); // confirmar inspeccionando el foro
```

Para encontrar estos valores, mirar el `config.php` de la instalación de Flarum en el servidor:
```bash
cat /path/to/flarum/config.php
```

### `includes/auth.php`

```php
<?php
/**
 * Sonadle — Autenticación via sesión de Flarum
 *
 * Lee la cookie flarum_session, la valida contra la DB de Flarum
 * y devuelve los datos del usuario. Sin modificar Flarum.
 */

declare(strict_types=1);

/**
 * Devuelve una conexión PDO a la base de datos de Flarum.
 * La conexión se crea una sola vez por request (singleton).
 */
function snd_flarum_db(): ?PDO {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
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
        // Loguear el error sin exponer credenciales
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
 * 5. Comprueba si el usuario es admin (grupo 1)
 *
 * @return array{user_id: int, username: string, avatar_url: string, is_admin: bool}|null
 */
function snd_get_current_user(): ?array {
    // 1. Leer la cookie
    $session_id = $_COOKIE[SND_FLARUM_SESSION_COOKIE] ?? null;

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

    $prefix = SND_FLARUM_DB_PREFIX;

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
        $is_admin = (bool) ($admin_check['is_admin'] ?? 0);

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
 * @param WP_REST_Request $request
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

    // Inyectar el usuario en el request para no volver a consultar la DB en el handler
    $request->set_param('_flarum_user', $user);

    return true;
}

/**
 * Middleware adicional para endpoints que requieren ser admin.
 *
 * @param WP_REST_Request $request
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
```

### Ejemplo de uso en un endpoint

```php
// En includes/api.php o donde se registren los endpoints
register_rest_route('sonadle/v1', '/guess', [
    'methods'             => 'POST',
    'callback'            => 'snd_handle_guess',
    'permission_callback' => 'snd_require_auth',
]);

function snd_handle_guess(WP_REST_Request $request): WP_REST_Response {
    // El usuario ya está validado y disponible
    $user = $request->get_param('_flarum_user');
    $user_id = $user['user_id'];

    // ... lógica del juego
}
```

---

## Flujo de login para el frontend

**Situación normal (usuario ya logueado en el foro):**
El juego llama a `GET /wp-json/sonadle/v1/me` en el primer load. Si devuelve datos de usuario, está logueado. No hay que hacer nada más.

**Endpoint `/me` para el frontend:**
```php
register_rest_route('sonadle/v1', '/me', [
    'methods'             => 'GET',
    'callback'            => function(WP_REST_Request $request) {
        $user = snd_get_current_user();
        if (!$user) {
            return new WP_REST_Response(['authenticated' => false], 200);
        }
        return new WP_REST_Response([
            'authenticated' => true,
            'user_id'       => $user['user_id'],
            'username'      => $user['username'],
            'avatar_url'    => $user['avatar_url'],
            'is_admin'      => $user['is_admin'],
        ], 200);
    },
    'permission_callback' => '__return_true', // público, devuelve null si no logueado
]);
```

**Situación: usuario no logueado, pulsa el botón de login:**

El botón de login del juego debe redirigir a la página de login del foro con un parámetro de retorno:

```javascript
// En el frontend JS del juego
function sndLogin() {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `/foros/login?return=${returnUrl}`;
}
```

Flarum, tras el login exitoso, redirige al usuario a la URL del parámetro `return` (o a la home del foro si no lo acepta — verificar en la instalación). Una vez de vuelta en el juego, la cookie `flarum_session` ya existe y `snd_get_current_user()` la leerá.

**Si Flarum no acepta el parámetro `return`** (depende de la configuración/versión), alternativa:

```javascript
function sndLogin() {
    // Abrir login en el foro en nueva pestaña
    window.open('/foros/login', '_blank');
    // Mostrar mensaje: "Cuando hayas iniciado sesión en el foro, recarga esta página"
    document.getElementById('login-hint').textContent =
        'Cuando hayas iniciado sesión en el foro, recarga la página.';
}
```

O más limpio: abrir el login en un modal/iframe. No recomendado por seguridad del login.

**Flujo completo resumido:**
```
Usuario pulsa "Login" en el juego
        ↓
Redirige a jenesaispop.com/foros/login
        ↓
Flarum autentica y crea cookie flarum_session (dominio: jenesaispop.com)
        ↓
Redirige de vuelta a jenesaispop.com/sonadle (o el usuario vuelve manualmente)
        ↓
JS del juego llama a GET /wp-json/sonadle/v1/me
        ↓
PHP lee $_COOKIE['flarum_session'], consulta DB de Flarum, devuelve datos del usuario
        ↓
Usuario logueado en el juego
```

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| El nombre de la cookie no es `flarum_session` | Baja | Alto | Confirmar inspeccionando el foro antes de escribir una línea de código |
| La tabla `sessions` no existe (Flarum usa sesiones nativas de PHP en ficheros) | Baja | Alto | Verificar con `SHOW TABLES LIKE '%session%'` en la DB de Flarum |
| La cookie se establece con `path=/foros` en vez de `path=/` | Media | Alto | Si la cookie tiene path restringido, no será accesible desde `/sonadle`. Comprobar en DevTools. Si ocurre, hay que cambiar la config de sesión de Flarum |
| El usuario de DB de WordPress no tiene acceso a la DB de Flarum | Media | Alto | Necesitará un usuario de DB con permisos SELECT en la DB de Flarum, o usar el mismo usuario si comparten DB |
| Cambio de esquema de DB en una actualización de Flarum | Baja | Medio | El esquema de `sessions` y `users` es estable desde Flarum 1.0. Añadir tests de humo tras updates de Flarum |
| Sesiones de Flarum muy cortas (cutoff de 2h demasiado agresivo) | Baja | Bajo | Ajustar el cutoff en `snd_get_current_user()`. Flarum por defecto tiene sesiones de varias horas |
| Acceso a la DB de Flarum añade latencia | Baja | Bajo | La conexión es localhost. Añadir caché en `$_SESSION` de WordPress o en un transient si la latencia es perceptible |

### Riesgo principal: path de la cookie

Este es el punto más importante a verificar antes de implementar. Abrir DevTools en el foro logueado y comprobar que la cookie `flarum_session` tiene:
- `Domain`: `jenesaispop.com` o vacío (no `.foros.jenesaispop.com`)
- `Path`: `/` (no `/foros`)

Si el path es `/foros`, la cookie no se enviará en requests a `/sonadle` y toda la Opción C se cae.

---

## Fallback si la integración falla antes del deadline

Si en el Sprint 0 se descubre que la cookie tiene path restringido o que la DB de Flarum no es accesible desde el contexto de WordPress:

**Plan B inmediato:** Usar `POST /foros/api/token` como autenticación manual.

El juego muestra un formulario de login propio (usuario + contraseña), los manda a `POST /foros/api/token`, recibe el token opaco y el `userId`, luego hace `GET /foros/api/users/{userId}` para obtener username y avatar. Guarda el token en `localStorage` o en una cookie propia, y lo envía en cada request a la API del juego. El plugin WordPress valida el token haciendo una query a la tabla `access_tokens` de Flarum.

Esto sí requiere que el usuario introduzca credenciales aunque ya esté logueado en el foro, pero es completamente funcional y el SSO transparente puede implementarse en Fase 2.

**Código de validación para el Plan B:**
```php
// Alternativa: validar un token de API de Flarum
function snd_get_user_from_api_token(string $token): ?array {
    $pdo = snd_flarum_db();
    if (!$pdo) return null;

    $prefix = SND_FLARUM_DB_PREFIX;

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

        if (!$row) return null;

        // Comprobar admin (igual que en snd_get_current_user)
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as is_admin FROM {$prefix}group_user
            WHERE user_id = :uid AND group_id = 1
        ");
        $stmt->execute([':uid' => $row['user_id']]);
        $admin = $stmt->fetch();

        return [
            'user_id'    => (int) $row['user_id'],
            'username'   => $row['username'],
            'avatar_url' => $row['avatar_url'] ?? '',
            'is_admin'   => (bool) ($admin['is_admin'] ?? 0),
        ];
    } catch (PDOException $e) {
        error_log('[Sonadle] Error validando API token de Flarum: ' . $e->getMessage());
        return null;
    }
}
```

---

## Checklist de verificación antes de implementar

- [ ] Confirmar nombre de cookie: abrir DevTools en `/foros` logueado, pestaña Application → Cookies
- [ ] Confirmar path y domain de la cookie `flarum_session`
- [ ] Confirmar que existe la tabla `sessions` en la DB de Flarum (`SHOW TABLES LIKE '%session%'`)
- [ ] Confirmar credenciales de acceso a la DB de Flarum
- [ ] Confirmar prefijo de tablas de Flarum (puede no ser `flarum_`)
- [ ] Verificar ruta de avatares: inspeccionar `avatar_url` de un usuario con avatar en la tabla `users`
- [ ] Probar `snd_get_current_user()` con sesión activa en el foro y sin sesión
