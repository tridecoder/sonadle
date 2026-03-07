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

  return { song: songs[songIndex], gameNumber, allSongs: songs }
}

/**
 * Shuffle determinista seeded por un numero.
 */
function seededShuffle(arr, seed) {
  const result = [...arr]
  let s = Math.abs(seed) || 1
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Devuelve 6 opciones: la cancion correcta + 5 distractores.
 * Prioriza mismo genero, luego misma decada, luego resto.
 * El orden esta determinado por gameNumber para que sea igual para todos.
 */
export function getOptions(song, allSongs, gameNumber) {
  const decade = Math.floor(song.year / 10) * 10
  const others = allSongs.filter(s => s.title !== song.title)

  const sameGenre = others.filter(s => s.genre === song.genre)
  const sameDecade = others.filter(s => s.genre !== song.genre && Math.floor(s.year / 10) * 10 === decade)
  const rest = others.filter(s => s.genre !== song.genre && Math.floor(s.year / 10) * 10 !== decade)

  const shuffledGenre = seededShuffle(sameGenre, gameNumber)
  const shuffledDecade = seededShuffle(sameDecade, gameNumber + 1)
  const shuffledRest = seededShuffle(rest, gameNumber + 2)

  const distractors = [...shuffledGenre, ...shuffledDecade, ...shuffledRest].slice(0, 5)
  const all6 = seededShuffle([song, ...distractors], gameNumber + 3)

  return all6.map(s => ({ title: s.title, artist: s.artist }))
}

/**
 * Devuelve la pista inicial: solo la frase JNSP.
 */
export function getGameClue(song) {
  return { jnsp: song.jnsp_clue }
}

/**
 * Pista progresiva revelada tras cada fallo.
 * attemptNum: 1..4
 */
export function getProgressiveClue(song, attemptNum) {
  const decade = Math.floor(song.year / 10) * 10 + 's'
  switch (attemptNum) {
    case 1: return { type: 'genre',    label: 'Género',  value: song.genre }
    case 2: return { type: 'decade',   label: 'Década',  value: decade }
    case 3: return { type: 'band',     label: song.is_band ? 'Banda' : 'Solista', value: song.is_band ? 'Es una banda' : 'Es un/a solista' }
    case 4: return { type: 'language', label: 'Idioma',  value: song.language === 'es' ? 'Está en español' : 'Está en inglés' }
    default: return null
  }
}
