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
      setText(`Nueva cancion en ${h}:${m}:${s}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return <div className="snd-result__countdown">{text}</div>
}

export default function Result({ solved, attemptsUsed, maxAttempts, gameNumber, song }) {
  const [copied, setCopied] = useState(false)

  function share() {
    const emojis = Array.from({ length: attemptsUsed }, (_, i) =>
      i === attemptsUsed - 1 && solved ? '\uD83D\uDFE9' : '\u2B1C'
    ).join('')

    const text = `Sonadle #${gameNumber} — ${solved ? attemptsUsed : 'X'}/${maxAttempts}\n${emojis}\nsonadle.jenesaispop.com`

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="snd-result">
      <div className="snd-result__verdict">
        {solved ? 'Lo has pillado!' : 'Esta vez no ha podido ser'}
      </div>

      {song && (
        <div className="snd-result__song">
          <strong>{song.title}</strong> — {song.artist}
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
        {copied && <span className="snd-share-confirm">Copiado!</span>}
      </div>

      <Countdown />
    </div>
  )
}
