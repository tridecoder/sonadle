function HintCard({ hint, revealedTitle }) {
  switch (hint.type) {
    case 'clue':
      return (
        <div className="snd-hint snd-hint--clue">
          <div className="snd-clue__row">
            <span className="snd-clue__decade">{hint.value.decade}</span>
            <span className="snd-clue__keywords">{hint.value.keywords}</span>
          </div>
          <div className={`snd-clue__structure${revealedTitle ? ' snd-clue__structure--revealed' : ''}`}>
            {revealedTitle || hint.value.structure}
          </div>
        </div>
      )

    case 'initials':
      return (
        <div className="snd-hint snd-hint--initials">
          <span className="snd-hint__label">Título</span>
          <span className="snd-hint__value snd-hint__value--initials">{hint.value}</span>
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

export default function Hints({ hints, revealedTitle }) {
  return (
    <div className="snd-hints">
      {hints.map((hint, i) => (
        <HintCard key={`${hint.type}-${i}`} hint={hint} revealedTitle={revealedTitle} />
      ))}
    </div>
  )
}
