# Seguridad y anti-trampas — Sonadle

El juego pierde todo su sentido si la respuesta se puede saber antes de jugar. La seguridad anti-spoiler no es un extra — es parte del core del producto.

---

## Vectores de ataque y mitigaciones

### 1. Inspeccionar la respuesta de la API

**Ataque:** El usuario abre DevTools y mira la respuesta de `game/today` para ver la canción.

**Mitigación:**
- El endpoint `game/today` **nunca** devuelve el título de la canción ni el `spotify_id`.
- Solo devuelve las pistas desbloqueadas según el estado del usuario (para anónimos: solo pista 1).
- La respuesta correcta se valida en el backend. El frontend envía el intento y el backend responde `correct: true/false`.
- El título de la canción solo se revela cuando `attempts_used = 6` o `solved = true`.

```
// Respuesta de game/today para un usuario con 2 intentos usados:
{
  "game_number": 47,
  "hints": [
    { "type": "lyric", "value": "I was dreaming of the past..." },
    { "type": "year", "value": 1970 },
    { "type": "genre", "value": null }  // bloqueada
  ],
  "attempts_used": 2,
  "max_attempts": 6,
  "solved": false
}
```

### 2. Fuerza bruta via autocompletado

**Ataque:** Un script llama al endpoint de autocompletado con miles de consultas para probar todas las canciones posibles y ver cuál devuelve `correct: true`.

**Mitigaciones:**
- **Rate limiting en autocompletado:** Máximo 30 requests/minuto por IP y por usuario. Suficiente para uso humano, insuficiente para fuerza bruta.
- **Rate limiting en intentos:** Máximo 6 intentos por día por usuario (lógica de negocio). Máximo 10 `POST /attempt` por minuto por IP (protección técnica).
- **El autocompletado no indica si una canción es la respuesta.** Solo devuelve resultados de búsqueda de la API musical — no hay forma de distinguir la canción del día de cualquier otra.

### 3. Deducir la canción por eliminación del autocompletado

**Ataque:** Si el autocompletado solo devuelve canciones que están en nuestra base de datos (en vez de todo Spotify), el usuario podría hacer búsquedas amplias y deducir la respuesta por eliminación.

**Mitigación:**
- El autocompletado busca contra la API musical completa (Spotify/Last.fm), no contra nuestra base de datos interna. No hay filtrado que revele qué canciones están programadas.

### 4. Acceso directo a la base de datos / endpoints admin

**Ataque:** Alguien accede a los endpoints del panel admin para ver las canciones programadas.

**Mitigaciones:**
- Los endpoints de admin requieren `manage_options` (solo administradores de WordPress).
- La tabla `snd_songs` no es accesible via ningún endpoint público.
- Las canciones futuras (con `play_date > CURDATE()`) no se exponen en ningún endpoint público bajo ninguna circunstancia.

### 5. Caché del navegador o CDN

**Ataque:** Si la respuesta de la API se cachea, alguien podría ver datos de otro usuario.

**Mitigaciones:**
- Los endpoints que dependen del usuario (`game/state`, `game/today` para logueados) incluyen `Cache-Control: no-store, private`.
- El endpoint `game/today` para anónimos (solo pista 1) sí puede cachearse, ya que no revela nada sensible.

### 6. Compartir la respuesta en redes antes de tiempo

**Ataque:** No es un ataque técnico, pero alguien que acierta puede escribir la respuesta en Twitter.

**Mitigaciones:**
- El texto de compartir generado por el juego **nunca** incluye el título de la canción.
- No se puede evitar que alguien escriba la respuesta manualmente, pero:
  - Incentivar el uso del texto generado (fácil de copiar, atractivo visualmente).
  - Considerar un mensaje en la pantalla de resultado: "No hagas spoiler — comparte tu resultado sin revelar la canción".

---

## Normalización de respuestas (fuzzy matching)

El usuario no siempre escribirá el título exacto. La validación debe ser tolerante:

```
Normalización aplicada antes de comparar:
1. Convertir a minúsculas
2. Eliminar acentos y diacríticos (é → e, ñ → n, ü → u)
3. Eliminar contenido entre paréntesis — "(A Deal with God)", "(feat. X)", "(Remix)"
4. Eliminar artículos iniciales — "The", "El", "La", "Los", "Las", "A", "An"
5. Eliminar puntuación — comillas, guiones, puntos suspensivos
6. Colapsar espacios múltiples
7. Trim
```

**Ejemplo:**
- Input del usuario: `running up that hill`
- Título real: `Running Up That Hill (A Deal with God)`
- Ambos se normalizan a: `running up that hill`
- Resultado: `correct: true`

**Importante:** La normalización se aplica tanto al input del usuario como al título almacenado. Se comparan ambos después de normalizar.

---

## Headers de seguridad

Añadir en las respuestas de la API del juego:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'
Cache-Control: no-store, private  (en endpoints con datos de usuario)
```

---

## Checklist de seguridad para el lanzamiento

- [ ] `game/today` no devuelve el título de la canción ni el spotify_id
- [ ] Las canciones futuras no aparecen en ningún endpoint público
- [ ] El rate limiting está activo en producción
- [ ] El autocompletado busca contra la API musical completa, no contra la DB interna
- [ ] Los endpoints admin requieren `manage_options`
- [ ] La normalización de respuestas funciona con los casos de test habituales
- [ ] Los headers de seguridad están presentes en las respuestas
