<?php
/**
 * Plugin Name: Sonadle
 * Description: Juego musical diario para jenesaispop.com
 * Version: 0.1.0
 * Author: iko
 */

defined('ABSPATH') || exit;

define('SND_VERSION', '0.1.0');
define('SND_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SND_PLUGIN_URL', plugin_dir_url(__FILE__));

// Cargar módulos
require_once SND_PLUGIN_DIR . 'includes/db.php';
require_once SND_PLUGIN_DIR . 'includes/auth.php';
require_once SND_PLUGIN_DIR . 'includes/api-musical.php';
require_once SND_PLUGIN_DIR . 'includes/api.php';
require_once SND_PLUGIN_DIR . 'includes/admin.php';

// Registrar assets
add_action('wp_enqueue_scripts', function () {
    if (!is_page('sonadle')) return;

    wp_enqueue_style(
        'sonadle',
        SND_PLUGIN_URL . 'assets/css/game.css',
        [],
        SND_VERSION
    );

    wp_enqueue_script(
        'sonadle',
        SND_PLUGIN_URL . 'assets/js/game.js',
        [],
        SND_VERSION,
        true // footer
    );

    // Pasar datos del servidor al frontend
    wp_localize_script('sonadle', 'sndConfig', [
        'apiBase' => rest_url('sonadle/v1'),
        'nonce'   => wp_create_nonce('wp_rest'),
    ]);
});

// Shortcode [sonadle]
add_shortcode('sonadle', function () {
    ob_start();
    include SND_PLUGIN_DIR . 'templates/game.php';
    return ob_get_clean();
});

// Excluir la página del juego de AMP
add_filter('amp_skip_post', function ($skip, $post_id) {
    if (get_page_link($post_id) === home_url('/sonadle')) {
        return true;
    }
    return $skip;
}, 10, 2);

// Registrar endpoints REST
add_action('rest_api_init', function () {
    require_once SND_PLUGIN_DIR . 'includes/api.php';
    snd_register_routes();
});

// Registrar menú admin
add_action('admin_menu', function () {
    require_once SND_PLUGIN_DIR . 'includes/admin.php';
    snd_register_admin_menu();
});

// Activación: crear tablas
register_activation_hook(__FILE__, function () {
    require_once SND_PLUGIN_DIR . 'includes/db.php';
    snd_create_tables();
});
