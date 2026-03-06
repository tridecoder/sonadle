# Sonadle — Juego musical diario de jenesaispop

Mini-juego diario tipo Wordle donde los usuarios adivinan canciones a partir de pistas progresivas: fragmentos de letra, año, género, portada pixelada.

Objetivo de negocio: generar hábito de visita diaria, aumentar registros y retención, espacio para banners.

## Estado actual

- [ ] Sprint 0 — Setup y decisiones técnicas (3-4 días)
- [ ] Sprint 1 — Core del juego sin auth (semana 1)
- [ ] Sprint 2 — Auth Flarum + panel admin (semana 2)
- [ ] Sprint 3 — Gamificación: rachas, puntos, clasificación (semana 3)
- [ ] Sprint 4 — Diseño, banners, testing, lanzamiento (semana 4)
- [ ] Lanzamiento

## Documentos clave

| Documento | Ruta |
|-----------|------|
| Requisitos de producto (PRD) | `producto/PRD.md` |
| Alcance del MVP | `producto/MVP.md` |
| User stories | `producto/user-stories.md` |
| Métricas de éxito | `producto/metricas.md` |
| Arquitectura técnica | `tecnico/arquitectura.md` |
| Integración Flarum (auth) | `tecnico/integracion-flarum.md` |
| Integración API musical | `tecnico/integracion-api-musical.md` |
| Integración WordPress | `tecnico/integracion-wordpress.md` |
| Base de datos | `tecnico/base-de-datos.md` |
| Brief de diseño | `diseno/brief.md` |
| Criterios editoriales | `contenido/criterios-editoriales.md` |
| Flujo canción del día | `contenido/flujo-cancion-diaria.md` |
| Seguridad anti-spoiler | `tecnico/seguridad-anti-spoiler.md` |
| Análisis de competencia | `investigacion/analisis-competencia.md` |
| Juegos similares (referencias) | `investigacion/referencias/juegos-similares.md` |
| Guía de entrevistas | `investigacion/entrevistas/guia-entrevistas.md` |
| Roadmap | `ROADMAP.md` |

## Stack

- Frontend: SPA embebida en página de WordPress (vanilla JS o Preact — a decidir en Sprint 0)
- Backend: API REST en PHP via WordPress REST API (`/wp-json/sonadle/v1/`)
- Base de datos: MySQL en el mismo servidor, tablas con prefijo `snd_`
- Auth: SSO con Flarum (mismo dominio)
- API musical: Spotify como primera opción (a confirmar en Sprint 0)

## Riesgos principales

1. **Integración Flarum SSO** — riesgo bajado a MEDIO. El foro está en `jenesaispop.com/foros` (mismo dominio), lo que simplifica el SSO notablemente.
2. **API musical** — Spotify requiere aprobación para ciertos endpoints. Hay que verificar límites.
3. **Plazo de 1 mes con una sola persona** — todo el desarrollo y el contenido recae en iko. Sin margen para imprevistos grandes.

## Equipo

- iko — desarrollo, diseño, contenido, decisiones de producto (todo)
