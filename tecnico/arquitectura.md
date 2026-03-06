# Arquitectura técnica — Sonadle

**Estado:** Borrador (completar en Sprint 0)

---

## Visión general

El juego es una SPA (Single Page Application) ligera embebida en una página de WordPress. Se comunica con una API REST propia que corre en el mismo servidor que WordPress y Flarum.

```
[WordPress page /sonadle]
    └── [SPA del juego — JS + CSS]
            └── [API REST propia — PHP]
                    ├── [MySQL — base de datos del juego]
                    ├── [Flarum — auth / SSO]
                    └── [API musical — Spotify / Last.fm]
```

## Componentes

### 1. Frontend — SPA del juego

**Integración con WordPress:**
- La página `jenesaispop.com/sonadle` es una página normal de WordPress con una plantilla custom que carga el juego.
- El juego se monta en un `<div id="sonadle-app">` dentro de esa plantilla.
- Los assets del juego (JS, CSS) se encolan via `wp_enqueue_scripts`.

**Stack del frontend:**
- [ ] **A decidir en Sprint 0:** Vanilla JS vs React ligero (Preact)
  - Vanilla JS: cero dependencias, menos KB, suficiente para este caso
  - Preact: más organizado si el juego crece, ~4KB extra
  - **Recomendación provisional:** Vanilla JS + módulos ES. Suficiente para el MVP.

### 2. Backend — API REST

**Stack del backend: PHP** (decisión tomada)
- Mismo servidor y lenguaje que WordPress. No requiere levantar procesos adicionales.
- Sin framework pesado: enrutamiento manual simple o micro-framework ligero (Slim, Bramus Router).
- Los endpoints se registran como rutas de la API REST de WordPress (`register_rest_route`) para aprovechar la infraestructura existente.

**Rutas de la API** (via WordPress REST API):
```
GET  /wp-json/sonadle/v1/game/today          — canción del día (pista 1 para anónimos; pistas desbloqueadas para logueados)
GET  /wp-json/sonadle/v1/game/state          — estado de la partida del usuario actual
POST /wp-json/sonadle/v1/game/attempt        — registrar un intento (requiere auth)
GET  /wp-json/sonadle/v1/songs/search?q=     — autocompletado de canciones (requiere auth)
GET  /wp-json/sonadle/v1/leaderboard/monthly — tabla clasificación mes actual
GET  /wp-json/sonadle/v1/leaderboard/my-rank — posición del usuario actual (requiere auth)
GET  /wp-json/sonadle/v1/user/me             — verificar sesión: devuelve datos del usuario o 401
GET  /wp-json/sonadle/v1/user/profile        — racha y stats del usuario (requiere auth)
```

**Auth:**
Todas las rutas que requieren usuario envían el token de Flarum en el header `Authorization: Bearer <token>`. El backend valida el token contra Flarum.

### 3. Base de datos

MySQL en el mismo servidor. Tablas con prefijo `snd_` para no colisionar con WordPress (`wp_`) ni Flarum.

Ver esquema completo en `tecnico/base-de-datos.md`.

### 4. Auth — SSO con Flarum

Ver detalle en `tecnico/integracion-flarum.md`.

Resumen:
- El usuario se loguea con su cuenta de Flarum
- Flarum emite un JWT que el juego usa para autenticarse contra la API
- La sesión es compartida: si estás logueado en el foro, estás logueado en el juego

### 5. API musical

Ver detalle en `tecnico/integracion-api-musical.md`.

Uso principal:
- Autocompletado de canciones en el campo de respuesta
- Obtener portada del álbum para las pistas 5 y 6
- Obtener año y género para las pistas 2 y 3 (o se completan manualmente en el panel admin)

## Decisiones pendientes (Sprint 0)

- [x] ~~PHP vs Node para el backend~~ → **PHP**
- [ ] Vanilla JS vs Preact para el frontend
- [ ] Spotify vs Last.fm vs MusicBrainz para la API musical
- [x] ~~Subdominio vs subdirectorio~~ → **`jenesaispop.com/sonadle`** (mismo dominio que el foro, facilita el SSO)
- [ ] ¿Hay child theme de Newspaper activo? → si no, el plugin custom es obligatorio

## Consideraciones de rendimiento

- La canción del día se cachea en PHP/memoria para no consultar la DB en cada request
- El autocompletado tiene debounce de 300ms en el frontend para no spammear la API musical
- Los assets del juego se sirven con caché larga (hash en el nombre del archivo)

## Consideraciones de seguridad

Ver documento completo en `tecnico/seguridad-anti-spoiler.md`.

Resumen:
- La canción del día completa (con respuesta) nunca se envía al frontend; solo las pistas desbloqueadas
- Los endpoints de la API no devuelven el título de la canción hasta que el usuario acierta o agota intentos
- Rate limiting en el endpoint de intentos (máximo 10 por minuto por IP)
- Rate limiting en el autocompletado (máximo 30 por minuto por IP)
- La validación de respuestas es fuzzy (normalización de mayúsculas, acentos, paréntesis, artículos)
