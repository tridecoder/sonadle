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
 * Estructura del titulo: primera letra visible + guiones.
 * Ej: "Kill Bill" → "K _ _ _   B _ _ _"
 */
function getTitleStructure(title) {
  const clean = title.replace(/\(.*?\)/g, '').trim()
  return clean
    .split(/\s+/)
    .map(w => w[0] + (w.length > 1 ? ' ' + '_ '.repeat(w.length - 1).trim() : ''))
    .join('   ')
}

/**
 * Cuenta palabras del titulo (sin parentesis).
 */
function getWordCount(title) {
  return title.replace(/\(.*?\)/g, '').trim().split(/\s+/).length
}

/**
 * Devuelve la pista inicial: genero, decada, estructura del titulo.
 */
export function getInitialHint(song) {
  return {
    genre: song.genre,
    decade: Math.floor(song.year / 10) * 10 + 's',
    title_structure: getTitleStructure(song.title),
    title_words: getWordCount(song.title),
  }
}

/**
 * Compara un intento con la cancion objetivo.
 * Devuelve feedback comparativo.
 */
export function compareGuess(guessTitle, guessArtist, target) {
  const artistMatch = guessArtist.toLowerCase().trim() === target.artist.toLowerCase().trim()

  const guessWords = getWordCount(guessTitle)
  const targetWords = getWordCount(target.title)
  let titleWordsDir = 'correct'
  if (guessWords < targetWords) titleWordsDir = 'more'
  else if (guessWords > targetWords) titleWordsDir = 'fewer'

  return {
    artist: artistMatch ? 'correct' : 'incorrect',
    title_words: titleWordsDir,
  }
}

/**
 * Devuelve una pista progresiva segun el intento fallido.
 * Se revela despues de cada error.
 */
export function getProgressiveHint(song, attemptNum) {
  switch (attemptNum) {
    case 1:
      return { type: 'year', value: song.year }
    case 2:
      return { type: 'artist_initial', value: song.artist[0] + '.' }
    case 3:
      return { type: 'keywords', value: song.keywords }
    case 4:
      return { type: 'artist', value: song.artist }
    case 5:
      return { type: 'lyric', value: song.lyric_hint }
    default:
      return null
  }
}
