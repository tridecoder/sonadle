import { useState, useEffect } from 'react'

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
      setText(`Nueva canción en ${h}:${m}:${s}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return <div className="snd-result__countdown">{text}</div>
}

export default function Result({ solved, attemptsUsed, maxAttempts, gameNumber, song, eliminated }) {
  const [copied, setCopied] = useState(false)

  function share() {
    const squares = Array.from({ length: maxAttempts }, (_, i) => {
      if (i < eliminated.length) return '🟥'
      if (i === eliminated.length && solved) return '🟩'
      return '⬜'
    }).join('')

    const text = `Sonadle #${gameNumber} — ${solved ? attemptsUsed : 'X'}/${maxAttempts}\n${squares}\nsonadle.jenesaispop.com`

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="snd-result">
      <div className="snd-result__verdict">
        {solved ? '¡Lo has pillado!' : 'Esta vez no ha podido ser'}
      </div>

      {song && (
        <div className="snd-result__song">
          <div className="snd-result__title">{song.title}</div>
          <div className="snd-result__artist">{song.artist}</div>
          {song.album && <div className="snd-result__album">{song.album}</div>}
        </div>
      )}

      <div className="snd-result__stats">
        {solved
          ? `En ${attemptsUsed} intento${attemptsUsed === 1 ? '' : 's'}`
          : 'Sin puntos hoy'
        }
      </div>

      <div className="snd-result__share">
        <button className="snd-btn snd-btn--share" onClick={share}>
          Compartir resultado
        </button>
        {copied && <span className="snd-share-confirm">¡Copiado!</span>}
      </div>

      <Countdown />
    </div>
  )
}
