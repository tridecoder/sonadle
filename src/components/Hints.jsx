function HintCard({ hint }) {
  switch (hint.type) {
    case 'initials':
      return (
        <div className="snd-hint snd-hint--initials">
          <span className="snd-hint__label">Título</span>
          <span className="snd-hint__value snd-hint__value--initials">{hint.value}</span>
        </div>
      )

    case 'emoji':
      return (
        <div className="snd-hint snd-hint--emoji">
          <span className="snd-hint__label">Pista</span>
          <span className="snd-hint__value snd-hint__value--emoji">{hint.value}</span>
        </div>
      )

    case 'lyric':
      return (
        <div className="snd-hint snd-hint--lyric">
          <span className="snd-hint__label">Letra</span>
          <blockquote className="snd-hint__value">{hint.value}</blockquote>
        </div>
      )

    case 'year':
      return (
        <div className="snd-hint snd-hint--year">
          <span className="snd-hint__label">Año</span>
          <span className="snd-hint__value snd-hint__value--big">{hint.value}</span>
        </div>
      )

    case 'genre':
      return (
        <div className="snd-hint snd-hint--genre">
          <span className="snd-hint__label">Género</span>
          <span className="snd-hint__tag">{hint.value}</span>
        </div>
      )

    case 'artist':
      return (
        <div className="snd-hint snd-hint--artist">
          <span className="snd-hint__label">Artista</span>
          <span className="snd-hint__value">{hint.value}</span>
        </div>
      )

    default:
      return null
  }
}

export default function Hints({ hints }) {
  return (
    <div className="snd-hints">
      {hints.map((hint, i) => (
        <HintCard key={`${hint.type}-${i}`} hint={hint} />
      ))}
    </div>
  )
}
