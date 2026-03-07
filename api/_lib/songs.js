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

// Fecha de inicio del juego
const START_DATE = new Date('2026-03-06T00:00:00')

/**
 * Devuelve la cancion del dia y el numero de partida.
 */
export function getTodaySong() {
  const songs = loadSongs()
  const now = new Date()
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
 * Devuelve la pista inicial del juego:
 * frase editorial JNSP + genero + decada.
 */
export function getGameClue(song) {
  return {
    jnsp: song.jnsp_clue,
    genre: song.genre,
    decade: Math.floor(song.year / 10) * 10 + 's',
  }
}

/**
 * Responde una pregunta de si/no sobre la cancion.
 * Devuelve true (si) o false (no).
 */
export function answerQuestion(song, question) {
  const wordCount = song.title.replace(/\(.*?\)/g, '').trim().split(/\s+/).length

  switch (question) {
    case 'title_long':   return wordCount > 3
    case 'title_single': return wordCount === 1
    case 'is_band':      return !!song.is_band
    case 'is_female':    return !!song.is_female
    case 'in_spanish':   return song.language === 'es'
    case 'before_2000':  return song.year < 2000
    default:             return null
  }
}
