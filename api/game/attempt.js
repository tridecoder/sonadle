import { getTodaySong, getHints } from '../_lib/songs.js'
import { checkAnswer } from '../_lib/normalize.js'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { answer, attempt_num } = req.body || {}

  if (!answer || typeof answer !== 'string') {
    return res.status(400).json({ error: 'Falta el campo answer' })
  }

  const attemptNum = parseInt(attempt_num, 10)
  if (!attemptNum || attemptNum < 1 || attemptNum > 6) {
    return res.status(400).json({ error: 'attempt_num debe estar entre 1 y 6' })
  }

  const { song, gameNumber } = getTodaySong()
  const isCorrect = checkAnswer(answer, song.title)
  const finished = isCorrect || attemptNum >= 6

  const response = {
    game_number: gameNumber,
    attempt_num: attemptNum,
    is_correct: isCorrect,
    finished,
    solved: isCorrect,
  }

  // Pista nueva si fallo y quedan intentos
  if (!isCorrect && attemptNum < 6) {
    const allHints = getHints(song, attemptNum)
    response.new_hint = allHints[allHints.length - 1]
  }

  // Revelar cancion si la partida termina
  if (finished) {
    response.title = song.title
    response.artist = song.artist
    response.album = song.album
    response.cover_url = song.cover_url
  }

  res.setHeader('Cache-Control', 'no-store')
  res.json(response)
}
