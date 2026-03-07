import { getTodaySong, answerQuestion } from '../_lib/songs.js'

const VALID_QUESTIONS = [
  'title_long',
  'title_single',
  'is_band',
  'is_female',
  'in_spanish',
  'before_2000',
]

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { question } = req.body || {}

  if (!question || !VALID_QUESTIONS.includes(question)) {
    return res.status(400).json({ error: 'Pregunta no válida' })
  }

  const { song } = getTodaySong()
  const result = answerQuestion(song, question)

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('CDN-Cache-Control', 'no-store')
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store')
  res.json({ question, answer: result ? 'sí' : 'no' })
}
