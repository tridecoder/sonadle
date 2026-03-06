import { getTodaySong, getHints } from '../_lib/songs.js'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const attempts = parseInt(req.query.attempts || '0', 10)
  const { song, gameNumber } = getTodaySong()
  const hints = getHints(song, Math.min(attempts, 5))

  res.setHeader('Cache-Control', 'no-store')
  res.json({
    game_number: gameNumber,
    max_attempts: 6,
    hints,
  })
}
