# Sprint 3 — Gamificacion (rachas, puntos, clasificacion)

**Semana:** 3
**Objetivo:** El juego tiene la capa de enganche que hace que la gente vuelva. Rachas, puntos, tabla de clasificacion mensual. Al terminar este sprint, el producto tiene todo lo necesario para generar habito.

## Prerequisitos (del Sprint 2)

- Auth con Flarum funcionando
- Resultados guardados con user_id real
- Panel admin operativo

## Rachas

- [ ] Logica de calculo de racha en el backend (ver `tecnico/base-de-datos.md`):
  - Si `last_played = ayer`: `current_streak += 1`
  - Si `last_played = hoy`: no hacer nada
  - Si `last_played < ayer` o null: `current_streak = 1`
  - Actualizar `max_streak` si `current_streak > max_streak`
- [ ] Mostrar racha actual en la pantalla de resultado
- [ ] Mostrar racha en el perfil basico del usuario

## Puntos y tabla de clasificacion

- [ ] Asignar puntos al guardar resultado (6 si acierta en intento 1, ..., 1 si acierta en intento 6, 0 si no acierta)
- [ ] UPSERT en `snd_monthly_points` al guardar cada resultado
- [ ] Endpoint `GET /wp-json/sonadle/v1/leaderboard/monthly` — top 20 del mes actual
- [ ] Endpoint `GET /wp-json/sonadle/v1/leaderboard/my-rank` — posicion del usuario actual
- [ ] Frontend: tabla de clasificacion (mobile-first)
  - Top 20 con username (y avatar si esta disponible de Flarum)
  - El usuario siempre ve su posicion aunque no este en el top 20
- [ ] Endpoint `GET /wp-json/sonadle/v1/user/profile` — racha, puntos del mes, posicion, max_streak

## Reset mensual

- [ ] No necesita cron: `snd_monthly_points` usa `year_month` como clave. El mes nuevo crea sus propias filas automaticamente.
- [ ] Para el archivo del leaderboard: script manual (o boton en el panel admin) que guarda el top 20 en `snd_leaderboard_archive` al inicio de cada mes.

## Frontend

- [ ] Seccion de tabla de clasificacion en la pagina del juego
- [ ] Perfil basico del usuario: racha actual, racha maxima, puntos del mes, posicion
- [ ] Puntos ganados mostrados en la pantalla de resultado
- [ ] Incluir racha en el texto de compartir

## Criterios de aceptacion del Sprint 3

- [ ] La racha se incrementa correctamente al jugar dias consecutivos
- [ ] La racha se rompe si el usuario no juega un dia
- [ ] Los puntos se calculan y guardan correctamente
- [ ] La tabla de clasificacion muestra top 20 correctamente
- [ ] El usuario ve su posicion aunque no este en el top 20
- [ ] El perfil muestra racha, puntos y posicion

## Riesgos del sprint

- Si el Sprint 2 se ha retrasado (auth), la primera mitad de este sprint se dedica a terminarlo. Si esto pasa, la tabla de clasificacion se puede lanzar como update en la primera semana post-lanzamiento.
