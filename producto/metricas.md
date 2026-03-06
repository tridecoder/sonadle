# Métricas de éxito — Sonadle

## North Star Metric

**Usuarios activos diarios (DAU) jugando la canción del día.**

Si esta cifra crece, todo lo demás suele crecer con ella.

## Métricas de lanzamiento (primeras 4 semanas)

Estas son las cifras a revisar semanalmente desde el día de lanzamiento.

*Base: ~5.000 usuarios únicos diarios en jenesaispop.com*

| Métrica | Descripción | Objetivo semana 1 | Objetivo semana 4 |
|---------|-------------|-------------------|-------------------|
| DAU | Usuarios únicos que juegan cada día | 200 (4% de la audiencia) | 600 (12%) |
| Tasa de registro | % de jugadores anónimos que crean cuenta | 20% | 30% |
| Tasa de retención D7 | % de jugadores del día 1 que siguen en día 7 | — | 40% |
| Racha media | Media de días consecutivos de los usuarios activos | — | 4 días |
| Shares | Resultados compartidos en redes por día | 30 | 120 |
| Cuentas Flarum nuevas | Registros atribuibles al juego | 50 | 200 |

## Métricas de producto (calidad del juego)

| Métrica | Descripción | Señal de alerta |
|---------|-------------|-----------------|
| Intento promedio de acierto | En qué intento acierta la mayoría | < 2 (muy fácil) o > 5.5 (muy difícil) |
| Tasa de abandono | % que empieza pero no termina | > 30% |
| Tiempo de partida | Media de tiempo por sesión de juego | < 30s (pistas demasiado fáciles) |
| Errores JS | Errores en el front reportados | Cualquier pico es señal de alerta |

## Métricas de negocio

| Métrica | Descripción | Objetivo mes 1 |
|---------|-------------|----------------|
| Impresiones de banner | Banners mostrados en la página del juego | A definir con commercial |
| Usuarios registrados nuevos | Cuentas Flarum creadas desde el juego | 200 |
| Páginas vistas / sesión | Si el usuario visita más páginas del sitio tras jugar | > 1.5 |

## Cómo medir

- **Google Analytics / Jetpack:** DAU, páginas vistas, fuentes de tráfico
- **Base de datos propia:** partidas jugadas, rachas, puntos, registros
- **UTM en el link de compartir:** para trackear tráfico desde redes sociales
- **Flarum admin:** registros nuevos (cruzar con fecha de lanzamiento del juego)

## Revisiones

- **Diaria (primeras 2 semanas):** DAU y errores. 5 minutos.
- **Semanal:** todas las métricas de la tabla de lanzamiento.
- **Mensual:** revisión completa + decisión sobre Fase 2.
