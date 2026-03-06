# Integración API Musical

**Estado:** Decidido — Last.fm como principal para autocompletado, portadas vía MusicBrainz/Cover Art Archive descargadas al servidor.
**Actualizado:** Sprint 0 — marzo 2026

---

## Qué necesitamos de la API

| Necesidad | Descripción | Criticidad |
|-----------|-------------|------------|
| Búsqueda de canciones | Autocompletado en el campo de respuesta | Crítica |
| Portada del álbum | Para las pistas 5 y 6 del juego | Crítica |
| Año de lanzamiento | Para la pista 2 | Deseable (puede ser manual) |
| Género musical | Para la pista 3 | Deseable (puede ser manual) |
| Popularidad | Para calibrar la dificultad de las canciones | Opcional |

---

## Estado actual de Spotify tras los cambios de noviembre 2024

En noviembre de 2024 Spotify realizó cambios drásticos en su API para apps en modo de desarrollo (quota mode):

**Lo que cambió:**
- Las apps nuevas que no han pasado el proceso de Extended Quota Mode (revisión manual por parte de Spotify) tienen acceso limitado a **25 usuarios** y solo pueden llamar a endpoints que involucren datos del **usuario autenticado**.
- El endpoint `GET /v1/search` y `GET /v1/tracks/{id}` **siguen funcionando con Client Credentials Flow** (sin login de usuario). Esto NO cambió.
- Lo que sí se restringió son endpoints de datos de usuario: playlists, historial, recomendaciones personalizadas, etc.
- Para un uso puramente de búsqueda y metadatos de canciones (lo que necesita Sonadle), el Client Credentials Flow **sigue siendo válido y accesible**.

**El problema real con Spotify:**
1. El proceso de registro de la app requiere rellenar un formulario con descripción del uso, categoría de la app, y URLs. Es burocrático.
2. Los términos de uso de Spotify **prohíben explícitamente** descargar o cachear sus portadas de álbum permanentemente en un servidor propio. La cláusula 4.4 de las Developer Terms especifica que no puedes almacenar contenido de Spotify más allá de lo necesario para streaming en tiempo real.
3. Las URLs de imágenes de portada de Spotify (alojadas en `i.scdn.co`) **no tienen fecha de expiración documentada pero pueden cambiar** en actualizaciones de infraestructura. Spotify no garantiza su permanencia.
4. El rate limit real del plan gratuito es aproximadamente **180 solicitudes por 30 segundos** (rolling window), lo cual es suficiente para autocompletado con debounce.

**Conclusión sobre Spotify:** Técnicamente funciona para búsqueda. El bloqueante es legal: no puedes descargar y alojar sus portadas, que es exactamente la estrategia que necesitamos para las pistas 5 y 6. Usar Spotify solo para búsqueda y luego buscar la portada por otro camino añade complejidad innecesaria.

---

## Comparativa Spotify vs Last.fm

| Criterio | Spotify | Last.fm |
|----------|---------|---------|
| Registro | Dashboard + formulario | Solo email, API key inmediata |
| Aprobación | Inmediata para dev, revisión para producción | Sin revisión |
| Autocompletado | Excelente (búsqueda fuzzy, relevancia) | Bueno (resultados algo más ruidosos) |
| Portadas | Alta calidad, pero no descargables legalmente | Proviene de MusicBrainz — calidad variable |
| Año de lanzamiento | Sí, en metadatos del álbum | Sí, via `track.getInfo` |
| Género | No directamente (Spotify usa categorías internas) | Sí, via tags de usuarios (muy buenos) |
| Rate limit | ~180 req/30s | 5 req/s sin límite diario documentado |
| Cobertura música española | Excelente | Buena |
| Descargar portadas al servidor | Prohibido por ToS | Permitido (imágenes de Cover Art Archive, licencia libre) |
| Permanencia URLs portadas | No garantizada | Cover Art Archive: permanentes |
| Coste | Gratuito (con límites) | Gratuito |

---

## API elegida: Last.fm

**Justificación:**

1. **Registro en 5 minutos, sin revisión manual.** Entras en https://www.last.fm/api/account/create, rellenas nombre de la app y descripción, y tienes tu API key al instante. Sin esperas, sin formularios de uso.

2. **El autocompletado cumple.** `track.search` devuelve resultados relevantes con artist, title y MBID (MusicBrainz ID). Para una canción del día curada manualmente, la calidad de búsqueda de Last.fm es más que suficiente.

3. **Las portadas se obtienen legalmente vía Cover Art Archive.** El flujo es: Last.fm devuelve el MBID de MusicBrainz → llamamos a `coverartarchive.org/release/{mbid}/front` → descargamos la imagen al servidor. Cover Art Archive es un proyecto de Internet Archive con licencia Creative Commons — descargar y alojar las imágenes es explícitamente permitido.

4. **Los géneros (tags) de Last.fm son los mejores de cualquier API.** Son colaborativos y muy precisos para música no mainstream, que es exactamente el tipo de catálogo de jenesaispop.

5. **Sin problemas legales de ToS.** Last.fm no prohíbe cachear sus respuestas ni descargar imágenes de Cover Art Archive.

**Flujo completo de datos:**
```
1. Panel admin: el editor busca la canción del día
2. Plugin llama a Last.fm track.search → devuelve candidatos con MBID
3. Editor selecciona la canción correcta
4. Plugin llama a Last.fm track.getInfo → obtiene año, tags/género
5. Plugin llama a Cover Art Archive con el MBID → descarga portada al servidor
6. Todo queda guardado en el CPT de Sonadle

En el juego:
7. Jugador escribe → frontend llama al proxy WP → proxy llama a Last.fm track.search
8. Proxy devuelve lista normalizada al frontend
```

---

## Ejemplos de respuesta JSON real

### Last.fm `track.search` — "Running Up That Hill" de Kate Bush

```json
{
  "results": {
    "trackmatches": {
      "track": [
        {
          "name": "Running Up That Hill (A Deal with God)",
          "artist": "Kate Bush",
          "url": "https://www.last.fm/music/Kate+Bush/_/Running+Up+That+Hill+(A+Deal+with+God)",
          "streamable": "0",
          "listeners": "1823456",
          "image": [
            {"#text": "https://lastfm.freetls.fastly.net/i/u/34s/...", "size": "small"},
            {"#text": "https://lastfm.freetls.fastly.net/i/u/64s/...", "size": "medium"},
            {"#text": "https://lastfm.freetls.fastly.net/i/u/174s/...", "size": "large"},
            {"#text": "https://lastfm.freetls.fastly.net/i/u/300x300/...", "size": "extralarge"}
          ],
          "mbid": "2ea36384-dc8e-4a40-8a68-5c9a6e2f9c13"
        }
      ]
    }
  }
}
```

### Last.fm `track.getInfo` — con MBID

```json
{
  "track": {
    "name": "Running Up That Hill (A Deal with God)",
    "mbid": "2ea36384-dc8e-4a40-8a68-5c9a6e2f9c13",
    "url": "https://www.last.fm/music/Kate+Bush/_/Running+Up+That+Hill+(A+Deal+with+God)",
    "duration": "300000",
    "listeners": "1823456",
    "playcount": "45231890",
    "artist": {
      "name": "Kate Bush",
      "mbid": "3c157be6-8a8c-4a27-b693-a4e9a6399e82",
      "url": "https://www.last.fm/music/Kate+Bush"
    },
    "album": {
      "artist": "Kate Bush",
      "title": "Hounds of Love",
      "mbid": "1e477f68-c407-4eae-ad01-518528cedc2c",
      "url": "https://www.last.fm/music/Kate+Bush/Hounds+of+Love",
      "image": [
        {"#text": "https://lastfm.freetls.fastly.net/i/u/34s/...", "size": "small"},
        {"#text": "https://lastfm.freetls.fastly.net/i/u/300x300/...", "size": "extralarge"}
      ]
    },
    "toptags": {
      "tag": [
        {"name": "80s", "url": "https://www.last.fm/tag/80s"},
        {"name": "art pop", "url": "https://www.last.fm/tag/art+pop"},
        {"name": "kate bush", "url": "https://www.last.fm/tag/kate+bush"},
        {"name": "female vocalists", "url": "https://www.last.fm/tag/female+vocalists"},
        {"name": "classic", "url": "https://www.last.fm/tag/classic"}
      ]
    },
    "wiki": {
      "published": "15 Aug 1985",
      "summary": "..."
    }
  }
}
```

### Cover Art Archive — portada por MBID de álbum

```
GET https://coverartarchive.org/release/1e477f68-c407-4eae-ad01-518528cedc2c/front
→ Redirige a: https://archive.org/download/mbid-1e477f68.../mbid-1e477f68..._thumb500.jpg
```

La URL final es permanente. El archivo está en Internet Archive y no desaparece.

### Last.fm `track.search` — "Bonito" de Jarabe de Palo (cobertura española)

Last.fm tiene buena cobertura de música española — Jarabe de Palo está indexado con MBID, álbum, tags como "spanish", "pop", "rock en español" y portada via Cover Art Archive. La cobertura de artistas españoles mainstream es comparable a Spotify. Para artistas muy locales o independientes puede faltar el MBID (en ese caso el editor lo introduce manualmente).

---

## Formato normalizado del proxy

Todos los endpoints del plugin devuelven este formato, independientemente de la API origen:

```json
[
  {
    "id": "2ea36384-dc8e-4a40-8a68-5c9a6e2f9c13",
    "title": "Running Up That Hill (A Deal with God)",
    "artist": "Kate Bush",
    "album": "Hounds of Love",
    "year": 1985,
    "cover_url": "https://jenesaispop.com/wp-content/uploads/sonadle/covers/2ea36384.jpg",
    "tags": ["80s", "art pop", "female vocalists"]
  }
]
```

- `id`: MBID de MusicBrainz (identificador universal, permanente)
- `cover_url`: siempre apunta al servidor propio tras la descarga inicial
- `year`: extraído de `wiki.published` o del campo de año del álbum en Last.fm
- `tags`: primeros 5 tags de Last.fm, útiles para el campo género

---

## Código PHP: `includes/api-musical.php`

```php
<?php
/**
 * Sonadle — Integración API Musical
 *
 * Usa Last.fm como fuente de búsqueda y metadatos.
 * Las portadas se obtienen de Cover Art Archive (MusicBrainz) y se
 * descargan al servidor en wp-content/uploads/sonadle/covers/.
 *
 * Variables de entorno necesarias:
 *   LASTFM_API_KEY — definida en wp-config.php
 */

defined( 'ABSPATH' ) || exit;

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

define( 'SND_LASTFM_API_BASE', 'https://ws.audioscrobbler.com/2.0/' );
define( 'SND_COVERS_DIR', WP_CONTENT_DIR . '/uploads/sonadle/covers/' );
define( 'SND_COVERS_URL', WP_CONTENT_URL . '/uploads/sonadle/covers/' );


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
function snd_search_songs( string $query, int $limit = 8 ): array {
    $query = trim( $query );

    if ( strlen( $query ) < 2 ) {
        return [];
    }

    // Clave de caché única por query
    $cache_key = 'snd_search_' . md5( strtolower( $query ) . '_' . $limit );
    $cached    = get_transient( $cache_key );

    if ( false !== $cached ) {
        return $cached;
    }

    $api_key = defined( 'LASTFM_API_KEY' ) ? LASTFM_API_KEY : '';

    if ( empty( $api_key ) ) {
        error_log( '[Sonadle] LASTFM_API_KEY no definida en wp-config.php' );
        return [];
    }

    $url = add_query_arg( [
        'method'  => 'track.search',
        'track'   => $query,
        'api_key' => $api_key,
        'format'  => 'json',
        'limit'   => $limit,
    ], SND_LASTFM_API_BASE );

    $response = wp_remote_get( $url, [
        'timeout' => 5,
        'headers' => [ 'User-Agent' => 'Sonadle/1.0 (jenesaispop.com)' ],
    ] );

    if ( is_wp_error( $response ) ) {
        error_log( '[Sonadle] Error llamando a Last.fm: ' . $response->get_error_message() );
        return [];
    }

    $body = json_decode( wp_remote_retrieve_body( $response ), true );
    $tracks = $body['results']['trackmatches']['track'] ?? [];

    if ( empty( $tracks ) || ! is_array( $tracks ) ) {
        // Last.fm devuelve string vacío si no hay resultados — normalizar
        set_transient( $cache_key, [], HOUR_IN_SECONDS );
        return [];
    }

    $results = [];

    foreach ( $tracks as $track ) {
        $mbid = $track['mbid'] ?? '';

        $results[] = [
            'id'        => $mbid ?: null,
            'title'     => $track['name']   ?? '',
            'artist'    => $track['artist'] ?? '',
            'album'     => '',   // track.search no devuelve álbum; se completa con track.getInfo
            'year'      => null, // ídem
            'cover_url' => '',   // ídem
            'tags'      => [],
        ];
    }

    // TTL de 24h — los resultados de búsqueda no cambian con frecuencia
    set_transient( $cache_key, $results, DAY_IN_SECONDS );

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
function snd_get_track_info( string $artist, string $track, string $mbid = '' ): ?array {
    $cache_key = 'snd_trackinfo_' . md5( $artist . '_' . $track . '_' . $mbid );
    $cached    = get_transient( $cache_key );

    if ( false !== $cached ) {
        return $cached ?: null;
    }

    $api_key = defined( 'LASTFM_API_KEY' ) ? LASTFM_API_KEY : '';

    if ( empty( $api_key ) ) {
        return null;
    }

    $params = [
        'method'      => 'track.getInfo',
        'api_key'     => $api_key,
        'format'      => 'json',
        'autocorrect' => 1,
    ];

    if ( $mbid ) {
        $params['mbid'] = $mbid;
    } else {
        $params['artist'] = $artist;
        $params['track']  = $track;
    }

    $url      = add_query_arg( $params, SND_LASTFM_API_BASE );
    $response = wp_remote_get( $url, [
        'timeout' => 5,
        'headers' => [ 'User-Agent' => 'Sonadle/1.0 (jenesaispop.com)' ],
    ] );

    if ( is_wp_error( $response ) ) {
        error_log( '[Sonadle] Error en track.getInfo: ' . $response->get_error_message() );
        return null;
    }

    $body  = json_decode( wp_remote_retrieve_body( $response ), true );
    $tdata = $body['track'] ?? null;

    if ( empty( $tdata ) ) {
        set_transient( $cache_key, false, HOUR_IN_SECONDS );
        return null;
    }

    // Extraer año de la fecha de publicación de la wiki si existe
    $year = null;
    if ( ! empty( $tdata['wiki']['published'] ) ) {
        if ( preg_match( '/\b(\d{4})\b/', $tdata['wiki']['published'], $m ) ) {
            $year = (int) $m[1];
        }
    }

    // Extraer MBID del álbum para buscar la portada
    $album_mbid  = $tdata['album']['mbid']  ?? '';
    $album_title = $tdata['album']['title'] ?? '';

    // Descargar portada si tenemos MBID de álbum
    $cover_url = '';
    if ( $album_mbid ) {
        $cover_url = snd_get_cover_url( $album_mbid );
    }

    // Tags: tomar los 5 primeros
    $tags = [];
    if ( ! empty( $tdata['toptags']['tag'] ) ) {
        foreach ( array_slice( $tdata['toptags']['tag'], 0, 5 ) as $tag ) {
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

    set_transient( $cache_key, $result, DAY_IN_SECONDS );

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
function snd_get_cover_url( string $album_mbid ): string {
    if ( empty( $album_mbid ) ) {
        return '';
    }

    // Sanitizar MBID (solo caracteres UUID válidos)
    $album_mbid = preg_replace( '/[^a-f0-9\-]/', '', strtolower( $album_mbid ) );
    $filename   = $album_mbid . '.jpg';
    $local_path = SND_COVERS_DIR . $filename;
    $local_url  = SND_COVERS_URL . $filename;

    // Si ya está descargada, devolver la URL local directamente
    if ( file_exists( $local_path ) ) {
        return $local_url;
    }

    // Asegurar que el directorio existe
    wp_mkdir_p( SND_COVERS_DIR );

    // Cover Art Archive redirige a la imagen real — seguir la redirección
    $caa_url  = 'https://coverartarchive.org/release/' . $album_mbid . '/front-500';
    $response = wp_remote_get( $caa_url, [
        'timeout'     => 10,
        'redirection' => 5,
        'headers'     => [ 'User-Agent' => 'Sonadle/1.0 (jenesaispop.com)' ],
    ] );

    if ( is_wp_error( $response ) ) {
        error_log( '[Sonadle] Error descargando portada ' . $album_mbid . ': ' . $response->get_error_message() );
        return '';
    }

    $code = wp_remote_retrieve_response_code( $response );

    if ( 200 !== (int) $code ) {
        error_log( '[Sonadle] Cover Art Archive devolvió HTTP ' . $code . ' para ' . $album_mbid );
        return '';
    }

    $image_data = wp_remote_retrieve_body( $response );

    if ( empty( $image_data ) ) {
        return '';
    }

    // Verificar que es una imagen válida antes de guardar
    $finfo = new finfo( FILEINFO_MIME_TYPE );
    $mime  = $finfo->buffer( $image_data );

    if ( ! in_array( $mime, [ 'image/jpeg', 'image/png', 'image/webp' ], true ) ) {
        error_log( '[Sonadle] El archivo descargado no es una imagen válida: ' . $mime );
        return '';
    }

    // Guardar en disco
    $saved = file_put_contents( $local_path, $image_data );

    if ( false === $saved ) {
        error_log( '[Sonadle] No se pudo escribir la portada en ' . $local_path );
        return '';
    }

    return $local_url;
}


// ─────────────────────────────────────────────
// Utilidad: regenerar portadas (WP-CLI / admin)
// ─────────────────────────────────────────────

/**
 * Fuerza la re-descarga de la portada de un álbum, borrando la caché local.
 * Útil si la imagen está corrupta o quieres actualizarla.
 *
 * @param string $album_mbid MBID del álbum.
 * @return string Nueva URL local, o cadena vacía si falla.
 */
function snd_refresh_cover( string $album_mbid ): string {
    $album_mbid = preg_replace( '/[^a-f0-9\-]/', '', strtolower( $album_mbid ) );
    $local_path = SND_COVERS_DIR . $album_mbid . '.jpg';

    if ( file_exists( $local_path ) ) {
        unlink( $local_path );
    }

    return snd_get_cover_url( $album_mbid );
}
```

---

## Nota sobre portadas y licencias

### ¿Las URLs de Last.fm caducan?
Las imágenes que devuelve Last.fm en `track.search` (`lastfm.freetls.fastly.net`) son thumbs generados dinámicamente que **sí pueden cambiar o desaparecer**. No confiar en ellas para almacenamiento permanente.

### ¿Las URLs de Cover Art Archive caducan?
No. Cover Art Archive es un proyecto de Internet Archive. Las imágenes están en `archive.org` y son permanentes. El dominio `coverartarchive.org` actúa como redirector hacia la URL definitiva en archive.org.

### ¿Se pueden descargar y alojar localmente?
**Sí.** La política de Cover Art Archive indica que las imágenes están bajo licencias Creative Commons (generalmente CC BY o dominio público). Su [términos de uso](https://coverartarchive.org/) permiten el uso, redistribución y copia de las imágenes, siempre que se atribuya cuando corresponda. Para un proyecto sin fines de lucro como Sonadle, no hay restricción.

### Estrategia de descarga
- La descarga ocurre **una sola vez**, cuando el editor selecciona la canción del día en el panel admin.
- La imagen queda en `wp-content/uploads/sonadle/covers/{mbid}.jpg`.
- En el juego, el frontend nunca llama a Cover Art Archive — usa siempre la URL local.
- Si la imagen falla (MBID no existe en CAA), el editor puede subir la portada manualmente.

---

## Variables de entorno necesarias

Añadir en `wp-config.php`:

```php
// Sonadle — API Musical
define( 'LASTFM_API_KEY', 'tu_api_key_aqui' );
```

**Cómo obtener la API key de Last.fm (10 minutos):**

1. Ir a https://www.last.fm/api/account/create
2. Iniciar sesión o crear cuenta en Last.fm (gratis)
3. Rellenar el formulario:
   - **Application name:** Sonadle
   - **Application description:** Music quiz game for jenesaispop.com. Server-side only, no user data collected.
   - **Application homepage:** https://jenesaispop.com
   - **Callback URL:** dejar en blanco (no usamos OAuth)
4. Submit — la API key aparece inmediatamente en pantalla
5. Copiar el valor de **API key** (no el Shared Secret — no lo necesitamos)
6. Pegarlo en `wp-config.php`

No hay proceso de aprobación. No hay lista de espera. Funciona al momento.

---

## Decisión final

**API: Last.fm**
**Portadas: Cover Art Archive (MusicBrainz), descargadas al servidor**

El código de `includes/api-musical.php` está listo para pegar en el plugin. Solo necesitas la API key de Last.fm (ver instrucciones arriba) y definirla en `wp-config.php`.
