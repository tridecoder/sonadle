import { getTodaySong, getSongByIndex, checkLetter, getHangmanClue } from '../_lib/songs.js'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { letter, wrong_count = 0 } = req.body || {}

  const { finished } = req.body || {}

  // ?i=N permite probar canciones concretas durante el desarrollo
  let song, gameNumber
  const { i } = req.query
  if (i !== undefined) {
    const parsed = parseInt(i, 10)
    if (!isNaN(parsed)) {
      song = getSongByIndex(parsed)
      gameNumber = parsed
    }
  }
  if (!song) {
    ;({ song, gameNumber } = getTodaySong())
  }

  // Caso especial: el cliente pide solo el reveal (fin por tiempo, sin letra)
  if (finished && !letter) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.setHeader('CDN-Cache-Control', 'no-store')
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store')
    return res.json({
      game_number: gameNumber,
      letter: '',
      correct: false,
      positions: [],
      wrong_count: parseInt(wrong_count, 10) || 0,
      progressive_clue: null,
      revealed: { title: song.title, artist: song.artist, album: song.album },
    })
  }

  let normalized = (letter || '').toLowerCase()
  if (normalized !== 'ñ') normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (!normalized || (!/^[a-z]$/.test(normalized) && normalized !== 'ñ')) {
    return res.status(400).json({ error: 'Letra inválida' })
  }

  const positions = checkLetter(song, normalized)
  const correct = positions.length > 0
  const prevWrong = parseInt(wrong_count, 10) || 0
  const newWrongCount = correct ? prevWrong : prevWrong + 1

  const response = {
    game_number: gameNumber,
    letter: normalized,
    correct,
    positions,
    wrong_count: newWrongCount,
    progressive_clue: null,
    revealed: null,
  }

  if (!correct) {
    response.progressive_clue = getHangmanClue(song, newWrongCount)
  }

  if (finished) {
    response.revealed = {
      title: song.title,
      artist: song.artist,
      album: song.album,
    }
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('CDN-Cache-Control', 'no-store')
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store')
  res.json(response)
}
