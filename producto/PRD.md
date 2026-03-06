# PRD — Sonadle (Product Requirements Document)

**Versión:** 0.1
**Fecha:** 2026-03-06
**Autora:** iko
**Estado:** Borrador

---

## 1. Contexto y problema

jenesaispop tiene una audiencia fiel pero las visitas son irregulares: la gente entra cuando hay un artículo que le interesa, no todos los días. El objetivo es crear un motivo de visita diaria que no dependa del calendario editorial.

Los juegos tipo Wordle han demostrado que los juegos de un intento diario generan hábito muy eficazmente: son rápidos, compartibles y crean conversación social alrededor del resultado.

## 2. Objetivo del producto

Crear un juego musical diario integrado en jenesaispop.com que:
- Genere visita diaria habitual
- Aumente los registros (login via Flarum)
- Proporcione espacio para banners/publicidad
- Sea compartible en redes sociales sin spoiler

## 3. Usuarios objetivo

**Usuario primario:** Lector habitual de jenesaispop, 25-40 años, con amplia cultura musical, acostumbrado a jugar Wordle o similares.

**Usuario secundario:** Persona que llega desde redes sociales al ver el resultado compartido por un amigo. No conoce el sitio. El juego puede ser su punto de entrada.

## 4. Mecánica del juego

### 4.1 Flujo básico

1. Cada día hay una canción secreta, igual para todos los usuarios.
2. El usuario tiene hasta 6 intentos para adivinarla.
3. Cada intento fallido revela una pista adicional.
4. El orden de las pistas (de menos a más reveladora) es:
   - **Pista 1:** Fragmento de letra (ambiguo, sin título ni artista)
   - **Pista 2:** Año de lanzamiento
   - **Pista 3:** Género musical
   - **Pista 4:** Nombre del artista
   - **Pista 5:** Portada del álbum pixelada (baja resolución)
   - **Pista 6:** Portada del álbum a resolución media (casi desvelada)
5. El usuario escribe su respuesta en un campo de búsqueda con autocompletado (título de la canción).
6. Al acertar o agotar intentos, se muestra el resultado y la opción de compartir.

### 4.2 Sistema de puntos

| Intento en que se acierta | Puntos |
|---------------------------|--------|
| 1 | 6 |
| 2 | 5 |
| 3 | 4 |
| 4 | 3 |
| 5 | 2 |
| 6 | 1 |
| No acertada | 0 |

### 4.3 Rachas

- La racha cuenta días consecutivos en que el usuario ha jugado (no necesariamente acertado).
- Se rompe si el usuario no juega en un día natural.
- Se muestra en el perfil del usuario y en la pantalla de resultado.

### 4.4 Tabla de clasificación

- Mensual: se resetea el primer día de cada mes.
- Muestra los 20 mejores usuarios por puntos acumulados en el mes.
- Requiere login.

### 4.5 Compartir resultado

Texto generado sin spoiler, estilo Wordle. Un emoji por intento: blanco = fallo, verde = acierto.
```
Sonadle #47 — 3/6
⬜⬜🟩
Racha: 12 dias
jenesaispop.com/sonadle
```

## 5. Requisitos funcionales

### 5.1 Juego
- RF01: Una canción diferente cada día, igual para todos los usuarios registrados
- RF02: Sistema de pistas progresivas (6 pistas, 6 intentos máximo)
- RF03: Autocompletado en el campo de respuesta conectado a la API musical. La validación del intento es fuzzy: normaliza mayúsculas/minúsculas, acentos, paréntesis y artículos para evitar falsos negativos (ej: "running up that hill" = "Running Up That Hill (A Deal with God)")
- RF04: El usuario solo puede jugar una vez por día
- RF05: Si el usuario no está logueado, puede ver la primera pista del día pero no jugar. Para hacer intentos debe registrarse o loguearse via Flarum. Esto maximiza registros con una barrera baja (la primera pista engancha).
- RF06: Resultado compartible en texto plano (compatible con cualquier red social)

### 5.2 Auth y usuarios
- RF07: Login/registro via SSO con Flarum
- RF08: La sesión de Flarum y jenesaispop.com deben ser la misma (no doble login)
- RF09: Perfil básico con racha actual, puntos del mes y historial de la semana

### 5.3 Tabla de clasificación
- RF10: Tabla mensual con top 20 usuarios por puntos
- RF11: El usuario siempre ve su posición aunque no esté en el top 20
- RF12: Reset automático el 1 de cada mes (archivar datos del mes anterior)

### 5.4 Panel de administración
- RF13: Interfaz para cargar la canción del día (título, artista, pistas, fecha)
- RF14: Cola de canciones programadas (al menos 7 días de margen)
- RF15: Preview de cómo se verá el juego con esa canción antes de publicar

### 5.5 Banners y monetización
- RF16: Espacio para banner en la página del juego (posición a definir en diseño)
- RF17: Los banners no interrumpen la mecánica del juego

## 6. Requisitos no funcionales

- RNF01: El juego carga en menos de 2 segundos en conexión móvil normal
- RNF02: Funciona correctamente en móvil (la mayoría del tráfico de jenesaispop es móvil)
- RNF03: No rompe la versión AMP del sitio (el juego no tiene versión AMP, pero su existencia no puede romper otras páginas)
- RNF04: La canción del día no es accesible por URL directa ni por la API sin autenticación (anti-spoiler)

## 7. Fuera de alcance (MVP)

- Audio/preview de la canción
- Modo sin login con localStorage
- Logros y badges
- Notificaciones push
- Modo difícil
- Versión app nativa
- Historial de canciones pasadas jugables

## 8. Dependencias y riesgos

| Dependencia | Riesgo | Mitigación |
|-------------|--------|------------|
| SSO con Flarum | Medio — mismo dominio, viable pero no trivial | Investigar en Sprint 0; fallback: login propio con link a Flarum |
| API de Spotify | Medio — límites de rate, aprobación de app | Verificar términos; fallback: base de datos manual |
| Plazo de 1 mes | Alto — una sola persona (iko) para todo | Sprints realistas; el juego core primero, gamificación después |
| Contenido | Medio — iko carga las canciones además de desarrollar | Tener al menos 14 canciones listas antes de lanzar |

## 9. Criterios de aceptación del MVP

- Un usuario puede jugar la canción del día sin estar logueado (modo espectador)
- Un usuario logueado puede jugar, guardar su resultado y ver su racha
- El resultado se puede compartir en Twitter/X y otros con texto sin spoiler
- La tabla de clasificación muestra correctamente los puntos del mes
- El panel admin permite cargar y programar canciones del día
- La página carga correctamente en Chrome móvil (iOS y Android)
