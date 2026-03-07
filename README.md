# Sonadle

Juego musical diario de [jenesaispop.com](https://jenesaispop.com). Adivina la canción del día a partir de una pista editorial y completando las letras del título, estilo ahorcado. Una canción nueva cada día.

**URL:** `sonadle.jenesaispop.com`

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite |
| Backend | Vercel Serverless Functions (Node.js / ES modules) |
| Datos | `data/songs.json` (fichero estático, sin base de datos) |
| Deploy | Vercel |
| Estilos | CSS custom con variables, mobile-first |

---

## Arrancar en local

```bash
# Instalar dependencias
npm install

# Arrancar con Vercel CLI (necesario para que funcione la API)
npx vercel dev
```

El juego estará en `http://localhost:3000`.

> **Nota:** `npm run dev` (solo Vite) arranca el frontend pero las llamadas a `/api/` fallan porque no hay backend.

### Probar canciones distintas en dev

Añade `?i=N` a la URL para cargar la canción N del array de `songs.json`:

```
http://localhost:3000/?i=5
```

Con `?i=N` el localStorage se ignora y cada recarga es una partida fresca.

---

## Estructura del proyecto

```
sonadle/
├── api/
│   ├── _lib/
│   │   └── songs.js          # Lógica compartida: rotación, hangman, pistas
│   └── game/
│       ├── today.js          # GET  /api/game/today
│       └── letter.js         # POST /api/game/letter
├── data/
│   └── songs.json            # Lista de 100 canciones
├── src/
│   ├── components/
│   │   ├── Game.jsx          # Orquestador principal
│   │   ├── Timer.jsx         # Cuenta atrás con barra de progreso
│   │   ├── TitleDisplay.jsx  # Título oculto con slots
│   │   ├── Lives.jsx         # Indicador de vidas (5 puntos)
│   │   ├── Keyboard.jsx      # Teclado on-screen + soporte teclado físico
│   │   ├── ClueStack.jsx     # Pista JNSP + pistas progresivas
│   │   └── Result.jsx        # Tarjeta de resultado final
│   ├── hooks/
│   │   └── useGame.js        # Estado del juego + timer + puntuación
│   ├── lib/
│   │   └── api.js            # Fetch wrappers hacia /api/
│   └── index.css             # Estilos (prefijo .snd-)
├── vercel.json               # Rutas y headers de caché
└── vite.config.js
```

---

## Mecánica del juego

**Hangman Musical**: el título de la canción se muestra como slots en blanco (`_`). El jugador adivina letras una a una con el teclado on-screen (o el teclado físico en desktop).

| Parámetro | Valor |
|-----------|-------|
| Vidas | 5 fallos → game over |
| Tiempo | 120 segundos |
| Pista inicial | Texto editorial en tono jenesaispop (no googleable) |
| Pista progresiva 1 | Género — al 2.º fallo |
| Pista progresiva 2 | Década — al 4.º fallo |

### Puntuación

Solo puntúa si se resuelve:

```
puntos = max(0, round(1000 - segundos_tardados × 10 - fallos × 100))
```

- Resolver en 0s, 0 fallos → 1000 pts
- Resolver en 60s, 2 fallos → 200 pts
- No resolver → 0 pts

---

## Datos: `songs.json`

Cada canción tiene estos campos:

```json
{
  "title":      "Nombre del tema",
  "artist":     "Artista",
  "album":      "Álbum",
  "year":       2022,
  "genre":      "Indie",
  "is_band":    true,
  "is_female":  false,
  "language":   "es",
  "jnsp_clue":  "Pista editorial en tono jenesaispop",
  "keywords":   "palabra clave, otra, otra",
  "lyric_hint": "",
  "cover_url":  "",
  "difficulty": 3
}
```

**Notas sobre los títulos:**
- Los paréntesis se eliminan para el hangman: `"Running Up That Hill (A Deal with God)"` → `"Running Up That Hill"`
- La **ñ** se trata como letra propia, distinta de la n
- El resto de acentos se normalizan: adivinar `e` revela posiciones de `é`, `è`, etc.

### Rotación de canciones

- `START_DATE = 2026-03-06` — día 1
- `dayIndex = días transcurridos desde START_DATE (zona horaria Europe/Madrid)`
- `songIndex = dayIndex % songs.length`

Con 100 canciones la rotación completa dura ~3 meses y 10 días.

---

## API

### `GET /api/game/today`

Devuelve la canción del día.

**Query params:**
- `?i=N` — override de índice (dev)

**Respuesta:**
```json
{
  "game_number": 2,
  "max_wrong": 5,
  "clue": { "jnsp": "Texto de la pista..." },
  "title_display": ["_", "_", " ", "_", "_", "_"]
}
```

### `POST /api/game/letter`

Comprueba una letra.

**Query params:**
- `?i=N` — override de índice (dev)

**Body:**
```json
{
  "letter": "a",
  "wrong_count": 1,
  "finished": false
}
```

**Respuesta:**
```json
{
  "correct": true,
  "positions": [0, 4],
  "wrong_count": 1,
  "progressive_clue": null,
  "revealed": null
}
```

Si `finished: true`, incluye `revealed: { title, artist, album }`.

---

## Caché y deploy

```json
// vercel.json
"/index.html"   → no-cache, no-store, must-revalidate
"/assets/(*)"   → public, max-age=31536000, immutable
"/api/(*)"      → no-store (cabecera en cada handler)
```

El HTML nunca se cachea en CDN para garantizar que los usuarios siempre cargan la versión más reciente. Los assets de Vite tienen hash en el nombre y se cachean indefinidamente.

---

## Estado del proyecto

- [x] Mecánica hangman implementada y funcionando
- [x] Timer 120s con barra de progreso
- [x] Sistema de puntuación
- [x] Teclado físico (desktop)
- [x] Soporte correcto para ñ
- [x] 100 canciones con pistas editoriales
- [x] Rotación dev con `?i=N`
- [x] Persistencia con localStorage (por día)
- [ ] Integración con WordPress / iframe en jenesaispop.com
- [ ] Diseño visual definitivo (identidad jenesaispop)
- [ ] Auth con Flarum (rachas, ranking)
- [ ] Panel de administración para programar canciones
