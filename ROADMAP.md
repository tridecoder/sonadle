# Roadmap — Sonadle

Plazo total: 4 semanas desde el inicio del Sprint 0.

## Vision

Convertir jenesaispop en destino diario obligatorio para los fans de la música mediante un juego de adivinanzas que mezcle cultura musical, competición amistosa y la personalidad editorial del sitio.

## Fases

### Fase 1 — MVP (mes 1)
Lanzamiento funcional con lo imprescindible para validar la mecánica y empezar a generar hábito.

**Incluye:**
- Juego diario con 6 pistas progresivas (letra, año, género, artista, portada pixelada, portada semi-desvelada)
- Resultado compartible en redes (sin spoiler)
- Login via Flarum (SSO)
- Racha personal (días consecutivos jugados)
- Tabla de clasificación mensual (puntos por intentos usados)
- Panel admin básico para cargar canciones del día
- Integración de banners en la página del juego

**No incluye (deliberadamente):**
- App móvil nativa
- Modos multijugador o duelos
- Sonido/preview de audio
- Historial de canciones pasadas jugables

**Usuarios sin login:** Pueden ver la primera pista, pero para jugar tienen que registrarse/loguearse. Maximiza registros sin crear una barrera total.

### Fase 2 — Mejoras post-lanzamiento (mes 2-3)
A definir según datos reales de uso y feedback de la comunidad.

**Candidatos:**
- Preview de audio como pista adicional (vía Spotify)
- Modo difícil
- Historial de canciones pasadas
- Logros y badges
- Modo sin login con localStorage (racha local, sin clasificación)
- Notificaciones push / recordatorio diario

### Fase 3 — Crecimiento (mes 4+)
- Categorías temáticas (décadas, géneros, artistas concretos)
- Torneos especiales (Primavera Sound, San Valentín, etc.)
- Integración con newsletter

## Decisiones tomadas

- [x] ~~Stack técnico del backend~~ → **PHP** via WordPress REST API
- [x] ~~Dominio/URL~~ → **`jenesaispop.com/sonadle`** (subdirectorio, mismo dominio que el foro)
- [x] ~~Usuarios sin login~~ → Ven la primera pista, requieren login para jugar

## Decisiones pendientes (bloquean Sprint 0)

- [ ] Viabilidad SSO con Flarum (riesgo MEDIO — mismo dominio, viable)
- [ ] API musical: Spotify vs alternativas (MusicBrainz, Last.fm)
- [ ] Frontend: Vanilla JS vs Preact
- [ ] ¿Hay child theme de Newspaper activo?
- [ ] Nombre final del juego (working title: Sonadle)
