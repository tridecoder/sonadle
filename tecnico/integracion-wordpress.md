# Integración con WordPress

---

## Estrategia general

El juego vive en una página de WordPress (`/sonadle`) pero funciona como una app independiente. WordPress solo actúa como contenedor: da la cabecera, el footer y los menús del sitio. El contenido de la página es 100% el juego.

## Opciones de integración

### Opción A — Plugin custom de WordPress (recomendada)

Crear un plugin ligero `sonadle` que:
- Registra los assets del juego (JS, CSS) con `wp_enqueue_scripts`
- Añade un shortcode `[sonadle]` para montar el juego en la página
- Registra las rutas de la API REST del juego como endpoints de WordPress (`register_rest_route`)
- Añade el menú de admin en el dashboard de WordPress

**Ventajas:**
- El código del juego está separado del theme (si el theme cambia, el juego no se rompe)
- Los endpoints usan la infraestructura REST de WordPress, lo que simplifica auth para el panel admin
- Fácil de activar/desactivar

**Estructura del plugin:**
```
wp-content/plugins/sonadle/
    sonadle.php              — punto de entrada, registro de hooks
    includes/
        api.php              — endpoints REST
        admin.php            — panel de admin en el dashboard
        db.php               — funciones de base de datos
    assets/
        js/
            game.js          — lógica del juego
        css/
            game.css         — estilos
    templates/
        game.php             — template del shortcode
        admin-panel.php      — template del panel admin
```

### Opción B — Child theme

Añadir el juego directamente en el child theme del Newspaper theme.

**Desventajas:** El código del juego queda mezclado con el del theme. Si algún día cambian de theme, hay que rescatar el código. No recomendado.

## API REST en WordPress

Usar `register_rest_route` para registrar los endpoints del juego bajo `/wp-json/sonadle/v1/`:

```php
// En sonadle.php o includes/api.php
add_action('rest_api_init', function() {
    register_rest_route('sonadle/v1', '/game/today', [
        'methods'  => 'GET',
        'callback' => 'snd_get_today_game',
        'permission_callback' => '__return_true', // público, pero la respuesta varía según auth
    ]);

    register_rest_route('sonadle/v1', '/game/attempt', [
        'methods'  => 'POST',
        'callback' => 'snd_post_attempt',
        'permission_callback' => 'snd_check_flarum_token', // requiere auth
    ]);

    // ... resto de endpoints
});
```

## Panel de administración en WordPress

El panel admin del juego (para cargar canciones) se integra como un menú custom en el dashboard de WordPress:

```php
add_action('admin_menu', function() {
    add_menu_page(
        'Sonadle',
        'Sonadle',
        'manage_options',        // solo admins de WordPress
        'sonadle-admin',
        'snd_render_admin_page',
        'dashicons-playlist-audio',
        30
    );
});
```

## Página del juego en WordPress

1. Crear página con slug `/sonadle` en WordPress
2. Asignar template custom (o usar el shortcode `[sonadle]`)
3. En el tagDiv Composer: usar una fila de ancho completo sin sidebar
4. Considerar si el juego tiene cabecera del sitio o va a pantalla completa

## AMP

El juego no tiene versión AMP. Hay que excluir la página `/sonadle` del plugin de AMP:

```php
// En sonadle.php
add_filter('amp_skip_post', function($skip, $post_id) {
    if (get_page_link($post_id) === home_url('/sonadle')) {
        return true;
    }
    return $skip;
}, 10, 2);
```

O bien configurar la exclusión directamente en el plugin de AMP si tiene esa opción en el panel.

## Consideraciones con Flying Scripts

El plugin Flying Scripts retrasa la carga de scripts. Asegurarse de que los scripts del juego (`game.js`) están en la lista de exclusiones para que carguen inmediatamente en la página del juego. Un juego que tarda en cargar es mala experiencia.

## Consideraciones con Jetpack

Jetpack tiene un CDN de imágenes (Photon). Si las portadas de Spotify se sirven desde URLs externas, Jetpack podría intentar procesarlas. Verificar que esto no rompe las imágenes del juego.
