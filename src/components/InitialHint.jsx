export default function InitialHint({ hint, revealedTitle }) {
  if (!hint) return null

  return (
    <div className="snd-initial-hint">
      <div className="snd-initial-hint__row">
        <span className="snd-initial-hint__badge">{hint.decade}</span>
        <span className="snd-initial-hint__badge">{hint.genre}</span>
        <span className="snd-initial-hint__badge snd-initial-hint__badge--words">
          {hint.title_words} {hint.title_words === 1 ? 'palabra' : 'palabras'}
        </span>
      </div>
      <div className={`snd-initial-hint__structure${revealedTitle ? ' snd-initial-hint__structure--revealed' : ''}`}>
        {revealedTitle || hint.title_structure}
      </div>
    </div>
  )
}
