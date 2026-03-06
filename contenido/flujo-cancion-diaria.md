# Flujo operativo — Canción del día

Cómo funciona el proceso desde que alguien elige una canción hasta que el jugador la ve.

---

## Responsables

| Rol | Responsabilidad |
|-----|-----------------|
| iko | Todo: seleccionar la canción, elegir el fragmento de letra, asignar fecha, mantener el sistema |

## Flujo paso a paso

```
1. SELECCIÓN
   El editor elige la canción siguiendo los criterios editoriales.
   Busca la canción en el panel admin (autocompletado con Spotify).

2. CONFIGURACIÓN
   El panel autocompleta: artista, año, género, portada del álbum.
   El editor elige el fragmento de letra manualmente.
   El editor asigna una fecha (o deja que se asigne al siguiente hueco disponible).
   El editor indica la dificultad estimada (1-5).

3. PREVIEW
   El editor hace preview de cómo quedará el juego con esa canción.
   Verifica que las pistas tienen sentido y no hay errores.

4. PUBLICACIÓN
   El editor guarda la canción. Queda en la cola programada.
   El sistema la activará automáticamente en la fecha asignada a las 00:01 hora española.

5. EN VIVO
   A las 00:01, el juego cambia a la nueva canción del día.
   Todos los usuarios que intenten jugar ven la nueva canción.
   Los resultados del día anterior quedan archivados (se pueden consultar pero no jugar).
```

## Gestión de la cola

- La cola se puede ver en el panel admin con las canciones programadas y sus fechas.
- Si hay un hueco sin canción asignada, el sistema debe avisar con al menos 48h de antelación.
- En caso de emergencia (se ha cometido un error en la canción del día actual), existe un botón de admin para cambiarla manualmente. Esto solo debe usarse si la canción está mal (error en la letra, canción no disponible en Spotify, etc.) y antes de las 9:00 del día para minimizar el impacto.

## Cambio de canción a medianoche

- **No se necesita cron job.** La tabla `snd_songs` tiene un campo `play_date` por canción. El endpoint `game/today` simplemente busca `WHERE play_date = CURDATE()`. El cambio de canción es automático por diseño de la base de datos.
- Verificar que el servidor MySQL está configurado en la zona horaria correcta (Europe/Madrid).

## Incidencias frecuentes y cómo resolverlas

| Incidencia | Solución |
|------------|----------|
| No hay canción programada para mañana | Cargar una de emergencia en el panel admin. Usar las "canciones de reserva" (ver más abajo). |
| La portada no carga | Verificar la URL de Spotify. Si ha caducado, re-buscar la canción en el panel. |
| El fragmento de letra tiene el título de la canción | Editar antes de las 00:01. Si ya está en vivo, evaluar si merece corregirlo (borrará el progreso del día para todos). |
| Flarum está caído | El juego debería seguir funcionando para jugadores con sesión activa. Los nuevos logins fallarán. |

## Canciones de reserva

Mantener una lista de 5-10 canciones "precocinadas" (con todos los campos rellenos y revisados) sin fecha asignada, para usar en caso de emergencia. Estas canciones deben ser de dificultad media y no muy dependientes de la fecha (sin efeméride concreta).
