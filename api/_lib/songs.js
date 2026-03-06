import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

let _songs = null

function loadSongs() {
  if (_songs) return _songs
  const raw = readFileSync(join(__dirname, '../../data/songs.json'), 'utf-8')
  _songs = JSON.parse(raw)
  return _songs
}

// Fecha de inicio del juego — ajustar al dia de lanzamiento real
const START_DATE = new Date('2026-03-06T00:00:00')

/**
 * Devuelve la cancion del dia y el numero de partida.
 */
export function getTodaySong() {
  const songs = loadSongs()
  const now = new Date()
  // Usar medianoche en horario de Madrid (CET/CEST)
  const madrid = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }))
  madrid.setHours(0, 0, 0, 0)

  const start = new Date(START_DATE)
  start.setHours(0, 0, 0, 0)

  const dayIndex = Math.floor((madrid - start) / 86400000)
  const songIndex = ((dayIndex % songs.length) + songs.length) % songs.length
  const gameNumber = dayIndex + 1

  return { song: songs[songIndex], gameNumber }
}

/**
 * Devuelve las pistas desbloqueadas segun el numero de intentos usados.
 * Pista 1: siempre visible (letra)
 * Pista 2: tras intento 1 (ano)
 * Pista 3: tras intento 2 (genero)
 * Pista 4: tras intento 3 (artista)
 * Pista 5: tras intento 4 (portada pixelada)
 * Pista 6: tras intento 5 (portada semi-desvelada)
 */
export function getHints(song, attemptsUsed) {
  const hints = []
  const maxHints = Math.min(attemptsUsed + 1, 6)

  for (let i = 1; i <= maxHints; i++) {
    hints.push(getHint(song, i))
  }

  return hints
}

function getHint(song, number) {
  switch (number) {
    case 1:
      return { type: 'lyric', value: song.lyric_hint }
    case 2:
      return { type: 'year', value: song.year }
    case 3:
      return { type: 'genre', value: song.genre }
    case 4:
      return { type: 'artist', value: song.artist }
    case 5:
      return { type: 'cover_pixel', value: song.cover_url || null }
    case 6:
      return { type: 'cover_medium', value: song.cover_url || null }
    default:
      return null
  }
}
