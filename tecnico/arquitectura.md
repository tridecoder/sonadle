# Arquitectura técnica — Sonadle

**Última actualización:** marzo 2026

---

## Visión general

SPA de React desplegada en Vercel, con serverless functions para el backend. Sin base de datos: los datos viven en un JSON estático versionado en git.

```
[Browser]
    └── React SPA (Vite build → Vercel CDN)
            └── /api/game/today   (Vercel Serverless Function)
            └── /api/game/letter  (Vercel Serverless Function)
                    └── data/songs.json (leído en runtime)
```

---

## Frontend

**Stack:** React 19 + Vite + CSS custom

El estado del juego vive en `src/hooks/useGame.js` y se persiste en `localStorage` con clave versionada (`sonadle_v34`). La clave incluye la fecha del día: si el usuario recarga al día siguiente, la partida se descarta y se carga la canción nueva.

### Componentes

| Componente | Responsabilidad |
|-----------|----------------|
| `Game.jsx` | Orquestador. Llama a `useGame`, renderiza todo. |
| `Timer.jsx` | Barra de progreso + número de segundos restantes. |
| `TitleDisplay.jsx` | Slots del título (`_` o letra revelada). |
| `Lives.jsx` | 5 puntos, uno se rellena en rojo por cada fallo. |
| `Keyboard.jsx` | Teclado QWERTY on-screen + listener de teclado físico. |
| `ClueStack.jsx` | Pista JNSP inicial + pistas de género/década que se desbloquean. |
| `Result.jsx` | Tarjeta de fin de partida con puntuación, canción y countdown. |

### Hook `useGame`

Gestiona todo el estado del juego:

- Carga la partida desde localStorage o desde la API
- Mantiene `titleDisplay`, `revealedPositions`, `usedLetters`, `wrongCount`
- Timer de 120s con `startTime` persistido en localStorage
- Calcula la puntuación al resolver: `max(0, round(1000 - elapsed×10 - wrongCount×100))`
- Maneja el timeout (tiempo agotado) y el reveal automático de la canción

### Normalización de letras

- Los acentos se normalizan vía NFD: adivinar `e` revela `é`, `è`, etc.
- La **ñ** es excepción: se trata como letra independiente, no como variante de `n`
- Esto aplica tanto en el backend (`api/_lib/songs.js` → `normalizeChar`) como en el frontend (listener de teclado físico en `Keyboard.jsx`) y en la validación de la API (`api/game/letter.js`)

---

## Backend

**Stack:** Node.js ES modules, Vercel Serverless Functions

No hay base de datos. Las canciones viven en `data/songs.json`, leído en runtime con `readFileSync`. Se cachea en memoria durante el ciclo de vida de la función (en producción, hasta que Vercel recicla el contenedor).

### `api/_lib/songs.js`

Lógica compartida entre los dos endpoints:

- `getTodaySong()` — calcula el índice del día desde `START_DATE = 2026-03-06` (zona horaria `Europe/Madrid`) y devuelve la canción correspondiente
- `getSongByIndex(n)` — override para dev (`?i=N`)
- `getTitleDisplay(song)` — convierte el título en array de `_`, ` `, o carácter literal (guiones, signos...)
- `checkLetter(song, letter)` — devuelve los índices donde aparece la letra (con normalización)
- `getHangmanClue(song, wrongCount)` — pista progresiva: género a los 2 fallos, década a los 4
- `getGameClue(song)` — pista editorial JNSP

### `GET /api/game/today`

- Devuelve `game_number`, `max_wrong: 5`, `clue` (pista JNSP) y `title_display`
- Acepta `?i=N` para dev
- Headers: `Cache-Control: no-store`

### `POST /api/game/letter`

- Recibe `{ letter, wrong_count, finished }`
- Acepta `?i=N` para dev
- Valida la letra (a-z o ñ), busca posiciones en el título
- Devuelve `{ correct, positions, wrong_count, progressive_clue, revealed }`
- Si `finished: true` o `letter` vacío con `finished: true` (timeout): incluye `revealed: { title, artist, album }`
- Headers: `Cache-Control: no-store`

---

## Datos

### `data/songs.json`

Array de 100 canciones. Campos por canción:

```json
{
  "title":      "string — título exacto",
  "artist":     "string",
  "album":      "string",
  "year":       1985,
  "genre":      "string — se muestra como pista progresiva",
  "is_band":    false,
  "is_female":  true,
  "language":   "es | en | other",
  "jnsp_clue":  "string — pista editorial, tono jenesaispop",
  "keywords":   "string — para uso interno/búsqueda",
  "lyric_hint": "string — reservado para futuras mecánicas",
  "cover_url":  "string — reservado",
  "difficulty": 3
}
```

**Rotación:** `songIndex = (dayIndex % songs.length + songs.length) % songs.length`

Los paréntesis se eliminan del título para el hangman (`cleanTitle`).

---

## Caché y headers

```
/index.html   → no-cache, no-store, must-revalidate  (nunca cacheado en CDN)
/assets/(*)   → public, max-age=31536000, immutable  (hash en nombre, caché permanente)
/api/(*)      → no-store                             (en cada serverless handler)
```

---

## Deploy

El proyecto se despliega automáticamente en Vercel desde la rama `main`.

```bash
# Desarrollo local (frontend + API)
npx vercel dev

# Deploy manual (normalmente automático desde git push)
npx vercel --prod
```

---

## Pendiente

- Integración en jenesaispop.com (iframe o subdominio)
- Auth con cuenta Flarum (rachas, ranking global)
- Panel admin para programar el orden de canciones
- Diseño visual definitivo con identidad jenesaispop
