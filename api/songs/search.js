const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const q = (req.query.q || '').trim()
  if (q.length < 2) {
    return res.json([])
  }

  const apiKey = process.env.LASTFM_API_KEY
  if (!apiKey) {
    console.error('[Sonadle] LASTFM_API_KEY no configurada en variables de entorno')
    return res.status(500).json({ error: 'Configuracion del servidor incompleta' })
  }

  const params = new URLSearchParams({
    method: 'track.search',
    track: q,
    api_key: apiKey,
    format: 'json',
    limit: '8',
  })

  try {
    const response = await fetch(`${LASTFM_API_BASE}?${params}`, {
      headers: { 'User-Agent': 'Sonadle/1.0 (jenesaispop.com)' },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`Last.fm respondio ${response.status}`)
    }

    const data = await response.json()
    const tracks = data?.results?.trackmatches?.track

    if (!tracks || !Array.isArray(tracks)) {
      return res.json([])
    }

    const results = tracks.map(t => ({
      title: t.name || '',
      artist: t.artist || '',
    }))

    // Cache 1 hora en el CDN de Vercel
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.json(results)
  } catch (err) {
    console.error('[Sonadle] Error en Last.fm:', err.message)
    res.status(502).json({ error: 'No se pudo contactar con Last.fm' })
  }
}
