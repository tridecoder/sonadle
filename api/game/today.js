import { getTodaySong, getInitialHint } from '../_lib/songs.js'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { song, gameNumber } = getTodaySong()

  res.setHeader('Cache-Control', 'no-store')
  res.json({
    game_number: gameNumber,
    max_attempts: 6,
    initial_hint: getInitialHint(song),
  })
}
