import { getTodaySong, getGameClue, getOptions } from '../_lib/songs.js'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { song, gameNumber, allSongs } = getTodaySong()

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('CDN-Cache-Control', 'no-store')
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store')
  res.json({
    game_number: gameNumber,
    max_attempts: 5,
    clue: getGameClue(song),
    options: getOptions(song, allSongs, gameNumber),
  })
}
