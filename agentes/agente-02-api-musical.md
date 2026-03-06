# Instrucciones — Agente 2: Investigación API Musical

**Cuándo lanzar:** Al inicio del Sprint 0, en paralelo con el Agente 1.
**Tiempo estimado:** 1-2 horas de trabajo del agente.
**Output esperado:** `tecnico/integracion-api-musical.md` actualizado con la API elegida, ejemplos reales de respuestas JSON y código PHP del proxy.

---

## Contexto que necesitas conocer

Estás investigando qué API musical usar para un juego de adivinanzas diario tipo Wordle.

- **El juego:** Sonadle — en jenesaispop.com (web musical española). El usuario tiene que adivinar una canción a partir de pistas progresivas.
- **Stack:** PHP (WordPress REST API) en el backend. El frontend nunca llama a la API musical directamente — pasa siempre por el backend como proxy.
- **Presupuesto:** Cero. Solo planes gratuitos.

El documento de referencia con el análisis previo está en:
`/Users/saralegui/Documents/proyectos/jenesaispop/sonadle/tecnico/integracion-api-musical.md`

Léelo antes de empezar. Tu trabajo es pasar de "candidatas a evaluar" a "API elegida con código funcionando".

---

## Qué necesita el juego de la API

Prioridad crítica — sin esto el juego no funciona:
1. **Búsqueda de canciones por texto** — para el autocompletado del campo de respuesta
2. **Portada del álbum** — imagen para las pistas 5 y 6 del juego (pixelada y semi-desvelada)

Prioridad deseable — se puede rellenar manualmente si no está disponible:
3. **Año de lanzamiento** — para la pista 2
4. **Género musical** — para la pista 3

---

## Tareas a realizar, en orden

### 1. Evaluar Spotify Web API

Investiga el estado actual de la Spotify Web API (noviembre 2024 en adelante hubo cambios de política):

**Preguntas críticas:**
- ¿Sigue siendo accesible la búsqueda (`GET /v1/search`) con Client Credentials Flow (sin que el usuario esté logueado con Spotify)?
- ¿Qué devuelve exactamente para una búsqueda de canciones? ¿Incluye año, género, portada?
- ¿Cuál es el rate limit real del plan gratuito?
- ¿Requiere algún proceso de aprobación para usar la búsqueda básica?
- ¿Las URLs de las portadas de álbum son permanentes o caducan?

Busca en la documentación oficial y en fuentes recientes (2024-2025) sobre los cambios de política de Spotify.

### 2. Evaluar Last.fm API como alternativa

**Preguntas a responder:**
- ¿El método `track.search` devuelve portadas de álbum de calidad suficiente?
- ¿Devuelve año y género?
- ¿El rate limit es suficiente para autocompletado con debounce de 300ms y ~600 usuarios diarios?
- ¿Se puede obtener una API key sin proceso de aprobación?

### 3. Hacer llamadas de prueba reales

Elige una canción de referencia para las pruebas. Usa algo concreto y conocido, por ejemplo: "Running Up That Hill" de Kate Bush o "Blinding Lights" de The Weeknd.

**Para Spotify** (si el acceso es viable):
Documenta la respuesta real del endpoint de búsqueda. Lo que necesitas ver:
```json
{
  "tracks": {
    "items": [{
      "id": "...",
      "name": "Running Up That Hill (A Deal with God)",
      "artists": [{"name": "Kate Bush"}],
      "album": {
        "name": "Hounds of Love",
        "release_date": "1985-09-16",
        "images": [{"url": "...", "width": 640}]
      }
    }]
  }
}
```

**Para Last.fm:**
Documenta la respuesta de `track.search` y `track.getInfo` para la misma canción.

### 4. Comparar y elegir

| Criterio | Spotify | Last.fm |
|----------|---------|---------|
| Búsqueda de canciones | | |
| Calidad de portadas | | |
| Año de lanzamiento disponible | | |
| Género disponible | | |
| Rate limit gratuito | | |
| Proceso de aprobación | | |
| URLs de portada permanentes | | |
| Complejidad de implementación | | |

**Criterio de decisión:** Para un MVP con un mes de plazo, la simplicidad de acceso es tan importante como la calidad de datos. Si Spotify requiere aprobación o ha restringido el acceso, Last.fm es la opción.

### 5. Diseñar la respuesta normalizada del proxy

Independientemente de la API elegida, el endpoint `/wp-json/sonadle/v1/songs/search?q=` del juego siempre devolverá el mismo formato:

```json
[
  {
    "id": "spotify:track:xxx o lastfm:track:xxx",
    "title": "Running Up That Hill (A Deal with God)",
    "artist": "Kate Bush",
    "album": "Hounds of Love",
    "year": 1985,
    "cover_url": "https://..."
  }
]
```

Diseña esta respuesta normalizada para que el frontend no dependa de qué API se usa por debajo.

### 6. Escribir el código PHP del proxy

Escribe el código PHP para el endpoint de búsqueda. Tiene que:
1. Recibir el parámetro `q` (texto de búsqueda)
2. Llamar a la API musical elegida con las credenciales del servidor
3. Normalizar la respuesta al formato común
4. Gestionar la caché: cachear resultados de búsqueda frecuentes (WordPress Transients API, TTL 24h)
5. Gestionar errores de la API externa (timeout, rate limit)

Para Spotify, incluir también el código de Client Credentials Flow (obtener y refrescar el token cada hora).

Ejemplo de estructura esperada:

```php
// En includes/api-musical.php

function snd_search_songs(string $query): array {
    // Buscar en caché primero (WordPress Transients)
    $cache_key = 'snd_search_' . md5($query);
    $cached = get_transient($cache_key);
    if ($cached !== false) return $cached;

    // Llamar a Spotify/Last.fm
    $results = snd_spotify_search($query); // o snd_lastfm_search()

    // Normalizar respuesta
    $normalized = array_map('snd_normalize_track', $results);

    // Guardar en caché
    set_transient($cache_key, $normalized, DAY_IN_SECONDS);

    return $normalized;
}
```

### 7. Nota sobre las portadas

Las URLs de portadas de APIs externas pueden caducar o cambiar. Documenta:
- ¿Las URLs de Spotify/Last.fm son permanentes?
- Si no lo son: el plan es descargar la portada al servidor al cargar la canción en el panel admin y servirla desde `wp-content/uploads/sonadle/covers/`. Confirma que esto es viable y que la licencia de uso de imágenes de Spotify/Last.fm lo permite para uso no comercial.

---

## Output esperado

Actualiza el archivo `/Users/saralegui/Documents/proyectos/jenesaispop/sonadle/tecnico/integracion-api-musical.md` con:

1. **API elegida** con justificación clara
2. **Respuestas JSON reales** de las llamadas de prueba
3. **Formato normalizado** de la respuesta del proxy
4. **Código PHP** del proxy completo (`snd_search_songs` + autenticación)
5. **Nota sobre licencia de portadas** y estrategia de almacenamiento local
6. **Variables de entorno necesarias** (ya están en el documento, verificar que son correctas)

---

## Criterio de éxito

Al terminar, iko debe poder:
1. Registrarse en la API elegida y obtener credenciales en menos de 10 minutos
2. Copiar el código PHP del proxy directamente en el plugin sin necesidad de investigar nada más
3. Saber exactamente qué devuelve la API para poder rellenar el panel admin de canciones
