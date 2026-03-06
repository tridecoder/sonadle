# Sprint 0 — Setup y decisiones técnicas

**Duracion:** 3-4 dias (antes de empezar el Sprint 1)
**Objetivo:** Tomar todas las decisiones tecnicas bloqueantes y preparar el entorno. Al terminar este sprint no hay nada visible, pero todo lo que viene despues es mas rapido y seguro.

## Por que existe un Sprint 0

Hay dos decisiones que, si se toman mal o tarde, pueden tirar abajo el plan de un mes:
1. Como funciona el SSO con Flarum
2. Que API musical usamos y que podemos hacer con ella

Estas decisiones hay que tomarlas con datos, no con suposiciones.

## Tareas

### Investigacion tecnica (bloqueante)

- [ ] **SSO Flarum:** Investigar como integrar la sesion de Flarum con el juego. Documentar la solucion en `tecnico/integracion-flarum.md`. Pasos concretos:
  1. Verificar version de Flarum: `cd /path/flarum && php flarum info`
  2. Probar `POST jenesaispop.com/foros/api/token` con credenciales de prueba
  3. Si devuelve token: documentar la respuesta y planificar Opcion A (JWT)
  4. Si no: evaluar Opcion C (cookie compartida, viable porque es mismo dominio)
  5. Si nada funciona en 2 dias: activar fallback (Opcion D, login propio)

- [ ] **API musical:** Probar Spotify y Last.fm. Documentar en `tecnico/integracion-api-musical.md`:
  1. Crear app en Spotify Developer Dashboard
  2. Probar Client Credentials Flow y hacer una busqueda de prueba
  3. Verificar que devuelve titulo, artista, ano, genero y portada
  4. Si Spotify da problemas de acceso: probar Last.fm como alternativa

- [ ] **Child theme de WordPress:** Comprobar en Apariencia > Temas si hay child theme activo del Newspaper theme. Si no lo hay, el plugin custom es la unica opcion para integrar el juego.

### Setup del entorno

- [ ] Crear base de datos MySQL para el juego (mismo servidor, tablas con prefijo `snd_`)
- [ ] Ejecutar los CREATE TABLE de `tecnico/base-de-datos.md`
- [ ] Crear la estructura del plugin WordPress en `wp-content/plugins/sonadle/`
- [ ] Crear pagina en WordPress con slug `/sonadle` y plantilla vacia
- [ ] Excluir `/sonadle` del plugin de AMP
- [ ] Anadir `game.js` a la lista de exclusiones de Flying Scripts

### Contenido (en paralelo)

- [ ] Empezar a seleccionar canciones siguiendo `contenido/criterios-editoriales.md`
- [ ] Objetivo: tener al menos 5 canciones con todos los campos rellenos al terminar el Sprint 0 (para poder testear el juego en Sprint 1)

## Entregables al final del Sprint 0

- [ ] `tecnico/integracion-flarum.md` — solucion de SSO definida con plan de implementacion
- [ ] `tecnico/integracion-api-musical.md` — API elegida con ejemplos de llamadas reales
- [ ] Plugin WordPress creado con estructura basica (punto de entrada + shortcode vacio)
- [ ] Tablas de base de datos creadas
- [ ] Al menos 5 canciones de prueba cargadas manualmente en `snd_songs`

## Criterio de salida

No se empieza el Sprint 1 sin tener claro como va a funcionar el SSO (aunque sea con el fallback). Es el riesgo mas alto y bloquea los sprints 2 en adelante — pero no bloquea el Sprint 1, que es el juego sin auth.
