-- Sonadle — Creación de tablas
-- Ejecutar en la base de datos de WordPress (misma DB, prefijo snd_)
-- Este archivo es solo de referencia; la creación real ocurre via
-- register_activation_hook en sonadle.php (función snd_create_tables)

CREATE TABLE IF NOT EXISTS snd_songs (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    play_date    DATE NOT NULL,
    title        VARCHAR(255) NOT NULL,
    artist       VARCHAR(255) NOT NULL,
    album        VARCHAR(255),
    year         YEAR,
    genre        VARCHAR(100),
    lyric_hint   TEXT NOT NULL,
    cover_url    VARCHAR(500),
    spotify_id   VARCHAR(50),
    difficulty   TINYINT DEFAULT 3,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by   INT UNSIGNED,
    UNIQUE KEY uq_play_date (play_date),
    INDEX idx_play_date (play_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS snd_attempts (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      INT UNSIGNED NOT NULL,
    song_id      INT UNSIGNED NOT NULL,
    play_date    DATE NOT NULL,
    attempt_num  TINYINT NOT NULL,
    answer       VARCHAR(255) NOT NULL,
    is_correct   TINYINT(1) NOT NULL DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_attempt (user_id, song_id, attempt_num),
    INDEX idx_user_date (user_id, play_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS snd_results (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED NOT NULL,
    song_id       INT UNSIGNED NOT NULL,
    play_date     DATE NOT NULL,
    solved        TINYINT(1) NOT NULL DEFAULT 0,
    attempts_used TINYINT NOT NULL,
    points        TINYINT NOT NULL DEFAULT 0,
    completed_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_day (user_id, play_date),
    INDEX idx_play_date (play_date),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS snd_streaks (
    user_id        INT UNSIGNED PRIMARY KEY,
    current_streak INT UNSIGNED DEFAULT 0,
    max_streak     INT UNSIGNED DEFAULT 0,
    last_played    DATE,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS snd_monthly_points (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      INT UNSIGNED NOT NULL,
    year_month   CHAR(7) NOT NULL,
    total_points INT UNSIGNED DEFAULT 0,
    games_played INT UNSIGNED DEFAULT 0,
    games_solved INT UNSIGNED DEFAULT 0,
    UNIQUE KEY uq_user_month (user_id, year_month),
    INDEX idx_month_points (year_month, total_points DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS snd_leaderboard_archive (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    year_month    CHAR(7) NOT NULL,
    rank_position INT UNSIGNED NOT NULL,
    user_id       INT UNSIGNED NOT NULL,
    username      VARCHAR(100) NOT NULL,
    total_points  INT UNSIGNED NOT NULL,
    games_played  INT UNSIGNED NOT NULL,
    archived_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_month (year_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Canción de prueba para el Sprint 1 (descomentar para testing)
-- INSERT INTO snd_songs (play_date, title, artist, album, year, genre, lyric_hint, difficulty)
-- VALUES (CURDATE(), 'Running Up That Hill (A Deal with God)', 'Kate Bush',
--         'Hounds of Love', 1985, 'Pop',
--         'It doesn''t hurt me. Do you want to feel how it feels?', 3);
