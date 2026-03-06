# User Stories — Sonadle

Formato: Como [rol], quiero [acción], para [beneficio].
Prioridad: P0 (MVP bloqueante) / P1 (MVP deseable) / P2 (Fase 2)

---

## Jugador anónimo (sin login)

| ID | Historia | Prioridad | Criterios de aceptación |
|----|----------|-----------|------------------------|
| US-01 | Como visitante, quiero ver la primera pista del día sin registrarme, para saber de qué va el juego antes de crear una cuenta | P0 | El juego carga y muestra la primera pista. Para jugar, se pide login. |
| US-02 | Como visitante, quiero ver la tabla de clasificación, para entender la dimensión social del juego | P1 | La tabla es visible sin login, pero participar requiere cuenta |

## Jugador registrado (con login)

| ID | Historia | Prioridad | Criterios de aceptación |
|----|----------|-----------|------------------------|
| US-04 | Como usuario registrado, quiero iniciar sesión con mi cuenta del foro de jenesaispop, para no tener que crear otra cuenta nueva | P0 | El botón de login redirige al flujo de Flarum y vuelve logueado |
| US-05 | Como usuario registrado, quiero que mi resultado se guarde automáticamente, para no perderlo si cierro el navegador | P0 | El resultado persiste en base de datos al terminar cada intento |
| US-06 | Como usuario registrado, quiero ver mi racha de días consecutivos, para tener motivación para seguir jugando cada día | P0 | La racha se muestra en la pantalla de resultado y en mi perfil |
| US-07 | Como usuario registrado, quiero ver mis puntos del mes actual, para saber cómo voy respecto a otros | P0 | Los puntos se muestran tras cada partida y en el perfil |
| US-08 | Como usuario registrado, quiero ver la tabla de clasificación mensual, para saber dónde estoy respecto al resto | P0 | La tabla muestra top 20 y siempre mi posición aunque no esté en el top |
| US-09 | Como usuario registrado, quiero compartir mi resultado sin hacer spoiler, para presumir sin revelar la canción | P0 | El texto generado usa emojis y no incluye el título de la canción |
| US-10 | Como usuario registrado, quiero que la tabla se resetee cada mes, para tener nuevas oportunidades aunque haya empezado tarde | P0 | El 1 de cada mes los puntos vuelven a 0 (el historial se archiva) |
| US-11 | Como usuario registrado, quiero ver mi historial de la semana, para saber qué días he jugado | P1 | Se muestran los últimos 7 días con indicador de si jugué y si acerté |

## Editor / equipo de contenido

| ID | Historia | Prioridad | Criterios de aceptación |
|----|----------|-----------|------------------------|
| US-12 | Como editor, quiero cargar la canción del día desde un panel, para no tener que tocar código | P0 | El panel admin permite añadir canción con todos sus campos |
| US-13 | Como editor, quiero programar canciones con antelación, para no tener que entrar cada día | P0 | Se pueden cargar canciones para fechas futuras (cola de al menos 7 días) |
| US-14 | Como editor, quiero hacer un preview del juego con la canción antes de publicarla, para verificar que todo se ve bien | P1 | Hay un modo preview en el panel admin |
| US-15 | Como editor, quiero que el sistema me avise si la cola de canciones tiene menos de 3 días, para no quedarme sin contenido | P2 | Alerta en el panel admin cuando la cola baja de 3 días |

## Administrador técnico

| ID | Historia | Prioridad | Criterios de aceptación |
|----|----------|-----------|------------------------|
| US-16 | Como admin, quiero que la canción del día no sea accesible via API sin autenticación, para evitar spoilers | P0 | El endpoint de canción del día requiere token válido |
| US-17 | Como admin, quiero que los datos de clasificación del mes anterior se archiven antes del reset, para no perder histórico | P1 | Al resetear, los datos se mueven a una tabla de histórico |
