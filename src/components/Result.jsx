import { useState, useEffect, useRef } from 'react'

function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function AppleMusicWidget({ title, artist }) {
  const [embedUrl, setEmbedUrl] = useState(null)
  const fetched = useRef(false)

  useEffect(() => {
    if (!title || !artist || fetched.current) return
    fetched.current = true
    const q = encodeURIComponent(`${artist} ${title}`)
    fetch(`https://itunes.apple.com/search?term=${q}&media=music&entity=song&limit=10&country=es`)
      .then(r => r.json())
      .then(data => {
        const expectedArtist = normalize(artist)
        const expectedTitle = normalize(title)
        const track = data.results?.find(t => {
          const resultArtist = normalize(t.artistName || '')
          const resultTitle = normalize(t.trackName || '')
          const artistMatch = resultArtist.includes(expectedArtist) || expectedArtist.includes(resultArtist)
          const titleMatch = resultTitle.includes(expectedTitle) || expectedTitle.includes(resultTitle)
          return artistMatch && titleMatch
        })
        if (track?.trackViewUrl) {
          setEmbedUrl(track.trackViewUrl.replace('music.apple.com', 'embed.music.apple.com'))
        }
      })
      .catch(() => {})
  }, [title, artist])

  if (!embedUrl) return null

  return (
    <div className="snd-apple-widget">
      <iframe
        src={embedUrl}
        height="175"
        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
        frameBorder="0"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
      />
    </div>
  )
}

function Countdown() {
  const [text, setText] = useState('')
  useEffect(() => {
    function update() {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight - now
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
      setText(`${h}:${m}:${s}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="snd-result__next">
      <span className="snd-result__next-label">Próxima canción en</span>
      <span className="snd-result__next-time">{text}</span>
    </div>
  )
}

export default function Result({ solved, wrongCount, maxWrong, gameNumber, song, usedLetters, score, elapsedSeconds }) {
  const [copied, setCopied] = useState(false)

  function share() {
    const squares = Array.from({ length: maxWrong }, (_, i) => i < wrongCount ? '🟥' : '⬜').join('')
    const scoreStr = solved ? `${score} pts` : 'sin resolver'
    const text = `Sonadle #${gameNumber} — ${scoreStr}\n${squares}\nsonadle.jenesaispop.com`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="snd-result">
      <div className={`snd-result__verdict ${solved ? 'snd-result__verdict--win' : 'snd-result__verdict--lose'}`}>
        {solved ? '¡Lo has pillado!' : 'Esta vez no ha podido ser'}
      </div>

      {song && (
        <div className="snd-result__song-card">
          <div className="snd-result__song-title">{song.title}</div>
          <div className="snd-result__song-artist">{song.artist}</div>
          {song.album && <div className="snd-result__song-album">{song.album}</div>}
        </div>
      )}

      {song && <AppleMusicWidget title={song.title} artist={song.artist} />}

      {solved ? (
        <div className="snd-result__score-block">
          <div className="snd-result__score-number">{score}</div>
          <div className="snd-result__score-label">puntos</div>
          <div className="snd-result__score-detail">
            {elapsedSeconds !== null && <span>{elapsedSeconds}s</span>}
            <span>·</span>
            <span>{wrongCount} fallo{wrongCount === 1 ? '' : 's'}</span>
          </div>
        </div>
      ) : (
        <div className="snd-result__no-score">Sin puntos hoy</div>
      )}

      <div className="snd-result__actions">
        <button className="snd-btn snd-btn--share" onClick={share}>
          {copied ? '¡Copiado!' : 'Compartir resultado'}
        </button>
      </div>

      <Countdown />
    </div>
  )
}
