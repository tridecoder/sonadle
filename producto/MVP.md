# MVP — Alcance mínimo del lanzamiento

Este documento define exactamente qué tiene que estar funcionando el día del lanzamiento. Cualquier cosa que no esté aquí va a la Fase 2.

## Principio guía

Un juego que funciona perfectamente con 5 features vale más que uno con 10 features a medias. Si hay que recortar, se recorta. La tabla de clasificación puede esperar. El juego en sí, no.

## Lo que SÍ entra en el MVP

### Core del juego
- [x] Canción del día (igual para todos)
- [x] 6 pistas progresivas en orden fijo
- [x] Campo de respuesta con autocompletado
- [x] 6 intentos máximo
- [x] Un intento por día por usuario
- [x] Pantalla de resultado al finalizar
- [x] Botón de compartir (texto sin spoiler)

### Auth
- [x] Login via Flarum SSO
- [x] Sin login: el usuario ve la primera pista del día, pero para jugar necesita loguearse

### Perfil y gamificación
- [x] Racha de días consecutivos jugados
- [x] Puntos acumulados en el mes
- [x] Tabla de clasificación mensual (top 20)

### Admin
- [x] Panel para cargar canción del día con sus pistas
- [x] Cola de al menos 7 días programados

### Monetización
- [x] Espacio para banner (1 posición)

### Técnico
- [x] Funciona en móvil
- [x] No rompe nada de WordPress ni de las páginas de jenesaispop

## Lo que NO entra (aunque mole)

| Feature | Por qué no |
|---------|------------|
| Preview de audio | Complejidad legal y técnica de Spotify SDK |
| Jugar sin login | Los visitantes ven la primera pista como gancho; jugar requiere cuenta. Maximiza registros. |
| Historial de canciones pasadas | No es necesario para el hábito diario |
| Logros y badges | Tiempo de desarrollo; no impacta el lanzamiento |
| Modo difícil | Segunda iteración con datos de uso real |
| Estadísticas detalladas por usuario | Fase 2 |
| Notificaciones push | Fase 2 |

## Criterio de "listo para lanzar"

1. Se puede jugar de principio a fin sin errores en móvil y escritorio
2. El login con cuenta de Flarum funciona
3. La racha se guarda correctamente
4. El resultado se puede compartir en Twitter/X
5. El panel admin permite cargar la canción del día
6. Hay canciones cargadas para al menos 14 días desde el lanzamiento
7. El banner aparece sin romper el layout
