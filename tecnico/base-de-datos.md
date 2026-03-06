# Base de datos — Sonadle

Todas las tablas usan el prefijo `snd_` para no colisionar con WordPress (`wp_`) ni Flarum.
Motor: MySQL/MariaDB (el que ya usa el servidor).

---

## Esquema de tablas

### `snd_songs` — Canciones

```sql
CREATE TABLE snd_songs (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    play_date    DATE NOT NULL UNIQUE,          -- fecha en que se juega esta canción
    title        VARCHAR(255) NOT NULL,          -- título de la canción (la respuesta)
    artist       VARCHAR(255) NOT NULL,          -- artista
    album        VARCHAR(255),
    year         YEAR,                           -- pista 2
    genre        VARCHAR(100),                   -- pista 3
    lyric_hint   TEXT NOT NULL,                  -- pista 1: fragmento de letra
    cover_url    VARCHAR(500),                   -- URL de la portada (pistas 5 y 6)
    spotify_id   VARCHAR(50),                    -- ID en Spotify (para autocompletado)
    difficulty   TINYINT DEFAULT 3,              -- 1-5, para calibrar la selección
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by   INT UNSIGNED,                   -- flarum user_id del editor
    INDEX idx_play_date (play_date)
);
```

### `snd_attempts` — Intentos por usuario y día

```sql
CREATE TABLE snd_attempts (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      INT UNSIGNED NOT NULL,          -- flarum user_id
    song_id      INT UNSIGNED NOT NULL,
    play_date    DATE NOT NULL,
    attempt_num  TINYINT NOT NULL,               -- 1 a 6
    answer       VARCHAR(255) NOT NULL,           -- lo que escribió el usuario
    is_correct   TINYINT(1) NOT NULL DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_attempt (user_id, song_id, attempt_num),
    INDEX idx_user_date (user_id, play_date)
);
```

### `snd_results` — Resultado final por usuario y día

```sql
CREATE TABLE snd_results (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      INT UNSIGNED NOT NULL,
    song_id      INT UNSIGNED NOT NULL,
    play_date    DATE NOT NULL,
    solved       TINYINT(1) NOT NULL DEFAULT 0,  -- 1 si acertó, 0 si no
    attempts_used TINYINT NOT NULL,              -- cuántos intentos usó (1-6)
    points       TINYINT NOT NULL DEFAULT 0,     -- puntos ganados (0-6)
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_day (user_id, play_date),
    INDEX idx_play_date (play_date),
    INDEX idx_user_id (user_id)
);
```

### `snd_streaks` — Rachas por usuario

```sql
CREATE TABLE snd_streaks (
    user_id       INT UNSIGNED PRIMARY KEY,      -- flarum user_id
    current_streak INT UNSIGNED DEFAULT 0,       -- racha actual (días consecutivos)
    max_streak    INT UNSIGNED DEFAULT 0,         -- récord histórico
    last_played   DATE,                           -- último día que jugó
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### `snd_monthly_points` — Puntos mensuales para la clasificación

```sql
CREATE TABLE snd_monthly_points (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      INT UNSIGNED NOT NULL,
    year_month   CHAR(7) NOT NULL,               -- formato: '2026-03'
    total_points INT UNSIGNED DEFAULT 0,
    games_played INT UNSIGNED DEFAULT 0,
    games_solved INT UNSIGNED DEFAULT 0,
    UNIQUE KEY uq_user_month (user_id, year_month),
    INDEX idx_month_points (year_month, total_points DESC)
);
```

### `snd_leaderboard_archive` — Histórico de clasificaciones mensuales

```sql
CREATE TABLE snd_leaderboard_archive (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    year_month   CHAR(7) NOT NULL,
    rank_position INT UNSIGNED NOT NULL,
    user_id      INT UNSIGNED NOT NULL,
    username     VARCHAR(100) NOT NULL,          -- guardamos el nombre en el momento
    total_points INT UNSIGNED NOT NULL,
    games_played INT UNSIGNED NOT NULL,
    archived_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_month (year_month)
);
```

---

## Lógica de racha

Al guardar un resultado:
```
1. Obtener el registro de snd_streaks del usuario
2. Si last_played = ayer: current_streak += 1
3. Si last_played = hoy: no hacer nada (ya se contó)
4. Si last_played < ayer (o es null): current_streak = 1 (racha rota)
5. Actualizar max_streak si current_streak > max_streak
6. Actualizar last_played = hoy
```

## Lógica de puntos mensuales

Al guardar un resultado:
```
1. Calcular puntos: si solved = 1, puntos = 7 - attempts_used. Si solved = 0, puntos = 0.
2. Hacer UPSERT en snd_monthly_points para (user_id, current_month)
3. Incrementar total_points, games_played y games_solved (si solved = 1)
```

## Reset mensual

No necesita cron. `snd_monthly_points` usa `year_month` como clave compuesta, así que el mes nuevo simplemente crea sus propias filas. No hay nada que resetear.

Para archivar el leaderboard del mes anterior:
```
1. Guardar top 20 del mes en snd_leaderboard_archive (script manual o botón en admin)
2. No tocar snd_monthly_points (los datos históricos quedan accesibles por year_month)
```

---

## Notas

- No almacenamos datos de usuario propios (nombre, email, avatar). Todo eso está en Flarum. Solo guardamos el `user_id` de Flarum como clave foránea.
- Si el usuario borra su cuenta de Flarum, sus datos en el juego quedan huérfanos. Se puede limpiar periódicamente o ignorar para el MVP.
