import { getTodaySong, compareGuess, getProgressiveHint } from '../_lib/songs.js'
import { checkAnswer } from '../_lib/normalize.js'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, artist, attempt_num } = req.body || {}

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Falta el campo title' })
  }

  const attemptNum = parseInt(attempt_num, 10)
  if (!attemptNum || attemptNum < 1 || attemptNum > 6) {
    return res.status(400).json({ error: 'attempt_num debe estar entre 1 y 6' })
  }

  const { song, gameNumber } = getTodaySong()
  const isCorrect = checkAnswer(title, song.title)
  const finished = isCorrect || attemptNum >= 6

  const feedback = compareGuess(title, artist || '', song)

  const response = {
    game_number: gameNumber,
    attempt_num: attemptNum,
    is_correct: isCorrect,
    finished,
    solved: isCorrect,
    guess: { title, artist: artist || '' },
    feedback,
  }

  // Pista progresiva si falla y quedan intentos
  if (!isCorrect && attemptNum < 6) {
    response.progressive_hint = getProgressiveHint(song, attemptNum)
  }

  // Revelar cancion si la partida termina
  if (finished) {
    response.revealed = {
      title: song.title,
      artist: song.artist,
      album: song.album,
    }
  }

  res.setHeader('Cache-Control', 'no-store')
  res.json(response)
}
