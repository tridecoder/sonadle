<?php
defined('ABSPATH') || exit;

function snd_register_admin_menu(): void {
    add_menu_page(
        'Sonadle',
        'Sonadle',
        'manage_options',
        'sonadle-admin',
        'snd_render_admin_page',
        'dashicons-playlist-audio',
        30
    );
}

function snd_render_admin_page(): void {
    if (!current_user_can('manage_options')) wp_die('Sin acceso.');

    // Procesar formulario de nueva canción
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['snd_save_song'])) {
        snd_handle_save_song();
    }

    // Procesar eliminación
    if (isset($_GET['delete']) && isset($_GET['_wpnonce'])) {
        snd_handle_delete_song((int) $_GET['delete'], $_GET['_wpnonce']);
    }

    include SND_PLUGIN_DIR . 'templates/admin-panel.php';
}

function snd_handle_save_song(): void {
    check_admin_referer('snd_save_song');

    global $wpdb;

    $cover_url = '';

    // Si se sube una imagen de portada, descargarla localmente
    if (!empty($_POST['snd_cover_url_remote'])) {
        $remote_url = esc_url_raw($_POST['snd_cover_url_remote']);
        $cover_url  = snd_download_cover($remote_url);
    }

    $wpdb->insert('snd_songs', [
        'play_date'  => sanitize_text_field($_POST['snd_play_date']),
        'title'      => sanitize_text_field($_POST['snd_title']),
        'artist'     => sanitize_text_field($_POST['snd_artist']),
        'album'      => sanitize_text_field($_POST['snd_album']),
        'year'       => (int) $_POST['snd_year'],
        'genre'      => sanitize_text_field($_POST['snd_genre']),
        'lyric_hint' => sanitize_textarea_field($_POST['snd_lyric_hint']),
        'cover_url'  => $cover_url,
        'difficulty' => min(5, max(1, (int) $_POST['snd_difficulty'])),
        'created_by' => get_current_user_id(),
    ]);

    add_action('admin_notices', function () {
        echo '<div class="notice notice-success"><p>Canción guardada correctamente.</p></div>';
    });
}

function snd_handle_delete_song(int $id, string $nonce): void {
    if (!wp_verify_nonce($nonce, 'snd_delete_song_' . $id)) wp_die('Nonce inválido.');
    global $wpdb;
    $wpdb->delete('snd_songs', ['id' => $id]);
}

/**
 * Descargar la portada de una URL externa y guardarla localmente.
 * Devuelve la URL local o la URL remota si falla.
 */
function snd_download_cover(string $remote_url): string {
    $upload_dir = wp_upload_dir();
    $covers_dir = $upload_dir['basedir'] . '/sonadle/covers/';
    $covers_url = $upload_dir['baseurl'] . '/sonadle/covers/';

    if (!file_exists($covers_dir)) {
        wp_mkdir_p($covers_dir);
    }

    $filename  = md5($remote_url) . '.jpg';
    $local_path = $covers_dir . $filename;

    if (file_exists($local_path)) {
        return $covers_url . $filename;
    }

    $response = wp_remote_get($remote_url, ['timeout' => 10]);
    if (is_wp_error($response)) return $remote_url;

    $image_data = wp_remote_retrieve_body($response);
    if (!$image_data) return $remote_url;

    file_put_contents($local_path, $image_data);
    return $covers_url . $filename;
}

/**
 * Obtener canciones programadas para mostrar en el panel.
 */
function snd_get_upcoming_songs(): array {
    global $wpdb;
    $today = current_time('Y-m-d');

    return $wpdb->get_results(
        $wpdb->prepare(
            "SELECT id, play_date, title, artist, difficulty
             FROM snd_songs
             WHERE play_date >= %s
             ORDER BY play_date ASC",
            $today
        ),
        ARRAY_A
    ) ?: [];
}

/**
 * Contar días de cola disponibles.
 */
function snd_queue_days_remaining(): int {
    global $wpdb;
    $today = current_time('Y-m-d');

    return (int) $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM snd_songs WHERE play_date >= %s",
        $today
    ));
}
