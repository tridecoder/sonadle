# Sprint 1 — Core del juego (sin auth)

**Semana:** 1
**Objetivo:** El juego funciona de principio a fin en local. Se puede jugar la cancion del dia, ver pistas, hacer intentos y ver el resultado. Sin login, sin gamificacion — solo la mecanica pura.

Al terminar este sprint se puede probar el juego internamente, aunque sea feo y sin usuarios reales. Lo importante es que la mecanica funcione y enganche.

## Por que sin auth

Separar el juego core del login permite:
- Validar la mecanica antes de meterse en la complejidad del SSO
- Tener algo jugable al final de la semana 1 (motivacion)
- Si el SSO da problemas, el juego core no se retrasa

## Backend

- [ ] Endpoint `GET /wp-json/sonadle/v1/game/today` — devuelve la cancion del dia (solo pista 1 si no hay sesion; pistas desbloqueadas si se pasa un user_id temporal para testing)
- [ ] Endpoint `POST /wp-json/sonadle/v1/game/attempt` — registra un intento y devuelve si es correcto + siguiente pista si no lo es
- [ ] Endpoint `GET /wp-json/sonadle/v1/game/state` — devuelve el estado de la partida actual
- [ ] Endpoint `GET /wp-json/sonadle/v1/songs/search?q=` — autocompletado conectado a la API musical (Spotify o Last.fm)
- [ ] Logica de validacion fuzzy: normalizar titulo antes de comparar (mayusculas, acentos, parentesis, articulos)
- [ ] Logica de "un intento por dia" (por ahora validado con cookie o parametro temporal; la validacion real con usuario viene en Sprint 2)

## Frontend

- [ ] Estructura HTML integrada en WordPress via shortcode `[sonadle]`
- [ ] Componente de pistas: muestra las pistas desbloqueadas en orden, las bloqueadas aparecen como slots vacios
- [ ] Campo de respuesta con autocompletado (debounce 300ms, llamada al endpoint de busqueda)
- [ ] Logica de intentos: hasta 6, con feedback visual basico por intento (correcto/incorrecto)
- [ ] Pantalla de resultado: acierto o fallo, con texto generado para compartir
- [ ] Boton "Compartir resultado" (copia texto al portapapeles con el formato definido en el PRD)
- [ ] Estado de "ya jugaste hoy": si el usuario vuelve a la pagina, ver resultado anterior en vez del juego

## Base de datos

Las tablas ya estan creadas del Sprint 0. En este sprint se usan:
- `snd_songs` — la cancion del dia (ya hay 5 canciones de prueba)
- `snd_attempts` — intentos (por ahora sin user_id real; usar un ID temporal)
- `snd_results` — resultado final

Las tablas de `snd_streaks` y `snd_monthly_points` no se tocan en este sprint.

## Criterios de aceptacion del Sprint 1

- [ ] Se puede jugar una partida completa (6 intentos o acierto) sin errores
- [ ] Las pistas se desbloquean correctamente en orden
- [ ] El autocompletado funciona y sugiere canciones reales
- [ ] La validacion fuzzy acepta variaciones razonables del titulo
- [ ] El resultado se puede copiar y pegar como texto
- [ ] Si vuelves a la pagina el mismo dia, ves el resultado anterior

## Riesgos del sprint

- **Autocompletado:** Si la API musical tiene problemas de rate o los datos no son buenos, usar una base de datos local con las 14 canciones programadas como fallback temporal.
- **Alcance:** Si algo no da tiempo, priorizar: mecanica de pistas > autocompletado > compartir.
