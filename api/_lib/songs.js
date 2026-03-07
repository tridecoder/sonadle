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

const START_DATE = new Date('2026-03-06T00:00:00')

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
 * Normaliza un caracter a su letra base sin acento.
 * La ñ se trata como letra propia, no como variante de n.
 */
function normalizeChar(c) {
  const lower = c.toLowerCase()
  if (lower === 'ñ') return 'ñ'
  return lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Quita contenido entre parentesis del titulo.
 */
function cleanTitle(title) {
  return title.replace(/\s*\(.*?\)/g, '').trim()
}

/**
 * Devuelve el titulo limpio para el hangman.
 */
export function getHangmanTitle(song) {
  return cleanTitle(song.title)
}

/**
 * Devuelve la estructura de display del titulo:
 * array donde cada elemento es ' ' (espacio), el char original (si no es letra),
 * o '_' (letra a adivinar).
 */
export function getTitleDisplay(song) {
  return getHangmanTitle(song).split('').map(c => {
    if (c === ' ') return ' '
    if (/\p{L}/u.test(c)) return '_'
    return c
  })
}

/**
 * Devuelve los indices en el titulo donde aparece la letra dada
 * (comparacion sin acento, case insensitive).
 */
export function checkLetter(song, letter) {
  const normalizedInput = normalizeChar(letter)
  const title = getHangmanTitle(song)
  const positions = []
  title.split('').forEach((c, i) => {
    if (/\p{L}/u.test(c) && normalizeChar(c) === normalizedInput) {
      positions.push(i)
    }
  })
  return positions
}

/**
 * Pista progresiva segun numero de fallos acumulados.
 */
export function getHangmanClue(song, wrongCount) {
  const decade = Math.floor(song.year / 10) * 10 + 's'
  if (wrongCount === 2) return { label: 'Género', value: song.genre }
  if (wrongCount === 4) return { label: 'Década', value: decade }
  return null
}

/**
 * Devuelve la pista JNSP para mostrar al inicio.
 */
export function getGameClue(song) {
  return { jnsp: song.jnsp_clue }
}
