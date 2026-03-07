import { getTodaySong, getSongByIndex, getGameClue, getTitleDisplay } from '../_lib/songs.js'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let song, gameNumber

  // ?i=N permite probar canciones concretas durante el desarrollo
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

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('CDN-Cache-Control', 'no-store')
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store')
  res.json({
    game_number: gameNumber,
    max_wrong: 5,
    clue: getGameClue(song),
    title_display: getTitleDisplay(song),
  })
}
