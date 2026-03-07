import { getTodaySong } from '../_lib/songs.js'
import { checkAnswer } from '../_lib/normalize.js'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, attempt_num } = req.body || {}

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Falta el campo title' })
  }

  const attemptNum = parseInt(attempt_num, 10)
  if (!attemptNum || attemptNum < 1 || attemptNum > 4) {
    return res.status(400).json({ error: 'attempt_num debe estar entre 1 y 4' })
  }

  const { song, gameNumber } = getTodaySong()
  const isCorrect = checkAnswer(title, song.title)
  const finished = isCorrect || attemptNum >= 4

  const response = {
    game_number: gameNumber,
    attempt_num: attemptNum,
    is_correct: isCorrect,
    finished,
    solved: isCorrect,
    guess: title,
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
