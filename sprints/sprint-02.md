# Sprint 2 — Auth con Flarum + panel admin

**Semana:** 2
**Objetivo:** El juego tiene usuarios reales. Un usuario puede loguearse con su cuenta del foro, jugar y que su resultado se guarde. El panel admin permite cargar canciones sin tocar codigo.

## Prerequisitos (del Sprint 1)

- El juego core funciona de principio a fin
- Las tablas de base de datos estan creadas
- La solucion de SSO esta definida (del Sprint 0)

## Auth con Flarum

- [ ] Implementar la solucion de SSO elegida en Sprint 0 (JWT, cookie compartida o fallback)
- [ ] Endpoint `GET /wp-json/sonadle/v1/user/me` — verificar sesion: devuelve datos del usuario (id, username, avatar) o 401
- [ ] Middleware de auth para los endpoints que lo requieren (`game/attempt`, `songs/search`, `user/profile`)
- [ ] Frontend: boton de login que redirige al flujo de Flarum y vuelve con sesion activa
- [ ] Frontend: estado sin login — muestra pista 1, campo de respuesta bloqueado, CTA de login
- [ ] Frontend: estado logueado — muestra el juego completo
- [ ] Conectar los intentos y resultados al `user_id` real de Flarum (migrar la logica temporal del Sprint 1)
- [ ] Validar que un usuario no puede jugar dos veces el mismo dia (en backend, no solo en frontend)

## Panel de administracion

Para el MVP, el panel es simple y funcional. No necesita ser bonito. Se integra en el dashboard de WordPress.

- [ ] Menu custom en el dashboard de WordPress (solo visible para admins)
- [ ] Formulario para anadir cancion del dia con campos manuales:
  - Titulo de la cancion
  - Artista
  - Album
  - Ano de lanzamiento
  - Genero (lista cerrada)
  - Fragmento de letra (textarea)
  - Dificultad estimada (1-5)
  - Fecha asignada
  - URL de la portada (o subir imagen directamente)
- [ ] Al guardar: descargar la portada y almacenarla localmente en `wp-content/uploads/sonadle/covers/`
- [ ] Vista de cola: lista de canciones programadas con su fecha, ordenadas cronologicamente
- [ ] Editar o eliminar una cancion programada
- [ ] Indicador visual cuando la cola tiene menos de 7 dias

**Lo que NO entra en el panel del MVP:**
- Autocompletado con API musical desde el panel (iko busca en Spotify aparte y copia los datos)
- Preview del juego con la cancion
- Alertas automaticas por email

## Criterios de aceptacion del Sprint 2

- [ ] El login con cuenta Flarum funciona y persiste la sesion
- [ ] Un usuario no logueado ve solo la primera pista y el CTA de login
- [ ] Un usuario logueado puede jugar y su resultado se guarda en la DB con su user_id
- [ ] Un usuario no puede jugar dos veces el mismo dia
- [ ] Un admin puede cargar una cancion del dia desde el panel de WordPress
- [ ] Las portadas se descargan y sirven localmente
- [ ] La cola muestra las canciones programadas

## Riesgos del sprint

- **SSO Flarum:** Si la solucion elegida no funciona en la practica, activar el fallback (login propio) inmediatamente. No dedicar mas de 2 dias a auth.
- **Panel admin:** Si no da tiempo a todo, priorizar: formulario de carga > vista de cola > editar/eliminar.
