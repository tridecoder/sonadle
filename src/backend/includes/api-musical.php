<?php
/**
 * Sonadle — Integración API Musical
 *
 * Usa Last.fm como fuente de búsqueda y metadatos.
 * Las portadas se obtienen de Cover Art Archive (MusicBrainz) y se
 * descargan al servidor en wp-content/uploads/sonadle/covers/.
 *
 * Variables necesarias en wp-config.php:
 *   LASTFM_API_KEY — API key de last.fm (last.fm/api/account/create)
 */

defined('ABSPATH') || exit;

define('SND_LASTFM_API_BASE', 'https://ws.audioscrobbler.com/2.0/');
define('SND_COVERS_DIR', WP_CONTENT_DIR . '/uploads/sonadle/covers/');
define('SND_COVERS_URL', WP_CONTENT_URL . '/uploads/sonadle/covers/');


// ─────────────────────────────────────────────
// Búsqueda de canciones (autocompletado)
// ─────────────────────────────────────────────

/**
 * Busca canciones en Last.fm y devuelve una lista normalizada.
 * Cachea los resultados 24h con WordPress Transients.
 *
 * @param string $query Texto introducido por el jugador.
 * @param int    $limit Número máximo de resultados (defecto 8).
 * @return array Lista de canciones en formato normalizado, o array vacío si falla.
 */
function snd_search_songs(string $query, int $limit = 8): array {
    $query = trim($query);

    if (strlen($query) < 2) {
        return [];
    }

    $cache_key = 'snd_search_' . md5(strtolower($query) . '_' . $limit);
    $cached    = get_transient($cache_key);

    if (false !== $cached) {
        return $cached;
    }

    $api_key = defined('LASTFM_API_KEY') ? LASTFM_API_KEY : '';

    if (empty($api_key)) {
        error_log('[Sonadle] LASTFM_API_KEY no definida en wp-config.php');
        return [];
    }

    $url = add_query_arg([
        'method'  => 'track.search',
        'track'   => $query,
        'api_key' => $api_key,
        'format'  => 'json',
        'limit'   => $limit,
    ], SND_LASTFM_API_BASE);

    $response = wp_remote_get($url, [
        'timeout' => 5,
        'headers' => ['User-Agent' => 'Sonadle/1.0 (jenesaispop.com)'],
    ]);

    if (is_wp_error($response)) {
        error_log('[Sonadle] Error llamando a Last.fm: ' . $response->get_error_message());
        return [];
    }

    $body   = json_decode(wp_remote_retrieve_body($response), true);
    $tracks = $body['results']['trackmatches']['track'] ?? [];

    if (empty($tracks) || !is_array($tracks)) {
        set_transient($cache_key, [], HOUR_IN_SECONDS);
        return [];
    }

    $results = [];

    foreach ($tracks as $track) {
        $mbid = $track['mbid'] ?? '';

        $results[] = [
            'id'        => $mbid ?: null,
            'title'     => $track['name']   ?? '',
            'artist'    => $track['artist'] ?? '',
            'album'     => '',   // track.search no devuelve álbum; se completa con track.getInfo
            'year'      => null,
            'cover_url' => '',
            'tags'      => [],
        ];
    }

    set_transient($cache_key, $results, DAY_IN_SECONDS);

    return $results;
}


// ─────────────────────────────────────────────
// Metadatos completos de una canción
// ─────────────────────────────────────────────

/**
 * Obtiene metadatos completos de una canción via track.getInfo.
 * Devuelve un único objeto normalizado con álbum, año, tags y cover_url.
 * Cachea el resultado 24h.
 *
 * @param string $artist Nombre del artista.
 * @param string $track  Nombre de la canción.
 * @param string $mbid   MBID de MusicBrainz (opcional pero mejora precisión).
 * @return array|null Canción normalizada, o null si no se encuentra.
 */
function snd_get_track_info(string $artist, string $track, string $mbid = ''): ?array {
    $cache_key = 'snd_trackinfo_' . md5($artist . '_' . $track . '_' . $mbid);
    $cached    = get_transient($cache_key);

    if (false !== $cached) {
        return $cached ?: null;
    }

    $api_key = defined('LASTFM_API_KEY') ? LASTFM_API_KEY : '';

    if (empty($api_key)) {
        return null;
    }

    $params = [
        'method'      => 'track.getInfo',
        'api_key'     => $api_key,
        'format'      => 'json',
        'autocorrect' => 1,
    ];

    if ($mbid) {
        $params['mbid'] = $mbid;
    } else {
        $params['artist'] = $artist;
        $params['track']  = $track;
    }

    $url      = add_query_arg($params, SND_LASTFM_API_BASE);
    $response = wp_remote_get($url, [
        'timeout' => 5,
        'headers' => ['User-Agent' => 'Sonadle/1.0 (jenesaispop.com)'],
    ]);

    if (is_wp_error($response)) {
        error_log('[Sonadle] Error en track.getInfo: ' . $response->get_error_message());
        return null;
    }

    $body  = json_decode(wp_remote_retrieve_body($response), true);
    $tdata = $body['track'] ?? null;

    if (empty($tdata)) {
        set_transient($cache_key, false, HOUR_IN_SECONDS);
        return null;
    }

    // Extraer año de la fecha de publicación de la wiki si existe
    $year = null;
    if (!empty($tdata['wiki']['published'])) {
        if (preg_match('/\b(\d{4})\b/', $tdata['wiki']['published'], $m)) {
            $year = (int) $m[1];
        }
    }

    // Extraer MBID del álbum para buscar la portada
    $album_mbid  = $tdata['album']['mbid']  ?? '';
    $album_title = $tdata['album']['title'] ?? '';

    $cover_url = '';
    if ($album_mbid) {
        $cover_url = snd_get_cover_url($album_mbid);
    }

    // Tags: tomar los 5 primeros
    $tags = [];
    if (!empty($tdata['toptags']['tag'])) {
        foreach (array_slice($tdata['toptags']['tag'], 0, 5) as $tag) {
            $tags[] = $tag['name'];
        }
    }

    $result = [
        'id'        => $tdata['mbid'] ?? $mbid,
        'title'     => $tdata['name']           ?? $track,
        'artist'    => $tdata['artist']['name'] ?? $artist,
        'album'     => $album_title,
        'year'      => $year,
        'cover_url' => $cover_url,
        'tags'      => $tags,
    ];

    set_transient($cache_key, $result, DAY_IN_SECONDS);

    return $result;
}


// ─────────────────────────────────────────────
// Portadas via Cover Art Archive
// ─────────────────────────────────────────────

/**
 * Dado el MBID de un álbum de MusicBrainz, descarga la portada al servidor
 * (si no existe ya) y devuelve la URL local.
 *
 * La imagen se guarda en wp-content/uploads/sonadle/covers/{mbid}.jpg
 * Las imágenes de Cover Art Archive tienen licencia Creative Commons —
 * descargarlas y alojarlas en el servidor propio está permitido.
 *
 * @param string $album_mbid MBID del álbum en MusicBrainz.
 * @return string URL local de la portada, o cadena vacía si falla.
 */
function snd_get_cover_url(string $album_mbid): string {
    if (empty($album_mbid)) {
        return '';
    }

    // Sanitizar MBID (solo caracteres UUID válidos)
    $album_mbid = preg_replace('/[^a-f0-9\-]/', '', strtolower($album_mbid));
    $filename   = $album_mbid . '.jpg';
    $local_path = SND_COVERS_DIR . $filename;
    $local_url  = SND_COVERS_URL . $filename;

    // Si ya está descargada, devolver la URL local directamente
    if (file_exists($local_path)) {
        return $local_url;
    }

    // Asegurar que el directorio existe
    wp_mkdir_p(SND_COVERS_DIR);

    // Cover Art Archive redirige a la imagen real — seguir la redirección
    $caa_url  = 'https://coverartarchive.org/release/' . $album_mbid . '/front-500';
    $response = wp_remote_get($caa_url, [
        'timeout'     => 10,
        'redirection' => 5,
        'headers'     => ['User-Agent' => 'Sonadle/1.0 (jenesaispop.com)'],
    ]);

    if (is_wp_error($response)) {
        error_log('[Sonadle] Error descargando portada ' . $album_mbid . ': ' . $response->get_error_message());
        return '';
    }

    $code = wp_remote_retrieve_response_code($response);

    if (200 !== (int) $code) {
        error_log('[Sonadle] Cover Art Archive devolvió HTTP ' . $code . ' para ' . $album_mbid);
        return '';
    }

    $image_data = wp_remote_retrieve_body($response);

    if (empty($image_data)) {
        return '';
    }

    // Verificar que es una imagen válida antes de guardar
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->buffer($image_data);

    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
        error_log('[Sonadle] El archivo descargado no es una imagen válida: ' . $mime);
        return '';
    }

    $saved = file_put_contents($local_path, $image_data);

    if (false === $saved) {
        error_log('[Sonadle] No se pudo escribir la portada en ' . $local_path);
        return '';
    }

    return $local_url;
}


// ─────────────────────────────────────────────
// Utilidad: forzar re-descarga de portada
// ─────────────────────────────────────────────

/**
 * Fuerza la re-descarga de la portada de un álbum, borrando la caché local.
 * Útil si la imagen está corrupta o quieres actualizarla.
 *
 * @param string $album_mbid MBID del álbum.
 * @return string Nueva URL local, o cadena vacía si falla.
 */
function snd_refresh_cover(string $album_mbid): string {
    $album_mbid = preg_replace('/[^a-f0-9\-]/', '', strtolower($album_mbid));
    $local_path = SND_COVERS_DIR . $album_mbid . '.jpg';

    if (file_exists($local_path)) {
        unlink($local_path);
    }

    return snd_get_cover_url($album_mbid);
}
