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

export default function Result({ solved, attemptsUsed, questionsUsed, maxAttempts, gameNumber, song, guesses, answers }) {
  const [copied, setCopied] = useState(false)

  function share() {
    const guessLine = (guesses || []).map(g => g.correct ? '✅' : '❌').join('')
    const questionLine = questionsUsed > 0 ? `❓x${questionsUsed}` : ''

    const lines = [
      `Sonadle #${gameNumber} — ${solved ? attemptsUsed : 'X'}/${maxAttempts}`,
      [questionLine, guessLine].filter(Boolean).join('  '),
      'sonadle.jenesaispop.com',
    ]

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
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
          ? `En ${attemptsUsed} intento${attemptsUsed === 1 ? '' : 's'}${questionsUsed > 0 ? ` · ${questionsUsed} pregunta${questionsUsed === 1 ? '' : 's'}` : ''}`
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
