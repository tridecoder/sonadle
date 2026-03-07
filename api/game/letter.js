import { getTodaySong, checkLetter, getHangmanClue } from '../_lib/songs.js'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { letter, wrong_count = 0 } = req.body || {}

  const normalized = (letter || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (!normalized || !/^[a-z]$/.test(normalized)) {
    return res.status(400).json({ error: 'Letra inválida' })
  }

  const { song, gameNumber } = getTodaySong()
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

  // El cliente pide el reveal cuando termina
  const { finished } = req.body || {}
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
