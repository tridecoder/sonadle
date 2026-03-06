# Brief de diseño — Sonadle

---

## Contexto

El juego está integrado en jenesaispop.com. El diseño tiene que sentirse como parte del sitio, no como algo externo pegado. Pero también puede tener su propia identidad visual dentro de ese marco — es un producto diferente, con su propio carácter.

## Principios de diseño

1. **Mobile first.** La mayoría del tráfico de jenesaispop es móvil. El juego tiene que funcionar y verse bien con el pulgar.
2. **Claridad por encima de originalidad.** El usuario tiene que entender qué hacer sin instrucciones. El diseño guía la interacción.
3. **Personalidad sin ruido.** jenesaispop tiene carácter. El juego también puede tenerlo. Pero no a costa de la usabilidad.
4. **Rápido de percibir.** Una partida dura 2-5 minutos. El diseño tiene que ir al grano.

## Referentes visuales

*(Añadir imágenes/links en la carpeta `diseno/assets/`)*

- **Wordle** (nytimes.com/games/wordle) — referencia de simplicidad y claridad
- **Heardle** (discontinuado) — referencia de juego musical diario
- **Framed** (framed.wtf) — referencia de pistas visuales progresivas con portadas de película
- **Redactle** — referente de lo que pasa cuando el diseño interfiere demasiado

## Identidad visual del juego

### Relación con jenesaispop
- Usar la tipografía del sitio (verificar qué tipografías usa el theme actual)
- Mantener la paleta de colores del sitio como base
- El logo/título del juego puede tener su propio tratamiento tipográfico

### Propuesta de identidad propia
*(A definir con iko — esto es un placeholder)*
- ¿El juego tiene nombre propio visible? ¿Logo?
- ¿Tiene paleta de color propia dentro de la del sitio?
- ¿Modo oscuro? (jenesaispop ya lo tiene o lo tendrá)

## Pantallas a diseñar

### 1. Pantalla principal del juego
- Título/header del juego
- Área de pistas (las que están desbloqueadas)
- Campo de búsqueda con autocompletado
- Intentos restantes / intentos usados (visual)
- Banner (posición por definir)

### 2. Pistas — componentes individuales

Cada pista es un componente con estado: bloqueada / desbloqueada.

| Pista | Contenido | Tratamiento visual |
|-------|-----------|-------------------|
| 1 | Fragmento de letra | Texto entre comillas, tipografía destacada |
| 2 | Año de lanzamiento | Número grande, tipografía display |
| 3 | Género | Etiqueta/tag |
| 4 | Artista | Nombre del artista, el más revelador antes de la portada |
| 5 | Portada pixelada | Imagen cuadrada, filtro CSS para pixelar |
| 6 | Portada semi-desvelada | Misma imagen a mayor resolución |

### 3. Pantalla de resultado
- ¿Acertaste o no? (debe sentirse diferente en cada caso)
- Cuántos intentos usaste
- Emoji grid para compartir
- Botón de compartir
- Racha actual
- Puntos ganados hoy
- CTA: ver tabla de clasificación / crear cuenta si no está logueado

### 4. Tabla de clasificación
- Mes actual y puntos
- Top 20 con avatares de Flarum
- Tu posición si no estás en el top 20

### 5. Estado de "ya jugaste hoy"
- Mostrar el resultado de hoy de forma clara
- Tiempo hasta la siguiente canción (cuenta atrás)

### 6. Estado sin login
- El usuario ve la primera pista del día como gancho
- El campo de respuesta está desactivado o bloqueado con un overlay
- CTA de login claro pero no agresivo: "Inicia sesión con tu cuenta del foro para jugar"
- Debajo del CTA, opción de registrarse si no tiene cuenta

### 7. Primera visita (onboarding)
- Explicación en 3 líneas de cómo funciona
- No un modal largo. Puede ser un tooltip o una versión demo con una pista de ejemplo.

## Componente de banner

- Posición más probable: debajo del resultado (cuando la partida ha terminado)
- Alternativa: lateral en escritorio
- El banner no aparece mientras se juega (no interrumpir la mecánica)

## Animaciones

Mínimas pero efectivas:
- Entrada de cada pista nueva (suave, no llamativa)
- Feedback visual en intentos incorrectos (shake sutil)
- Celebración en acierto (confeti o similar, contenido, no exagerado)
- Transición al resultado

## Accesibilidad

- Contraste mínimo WCAG AA
- Tamaño mínimo de toque: 44x44px en móvil
- El juego tiene que ser usable sin CSS de animación (prefers-reduced-motion)
- Los emojis del resultado compartido tienen alternativa en texto para lectores de pantalla
