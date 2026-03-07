function FeedbackIcon({ value }) {
  switch (value) {
    case 'correct':
      return <span className="snd-fb snd-fb--correct">✅</span>
    case 'incorrect':
      return <span className="snd-fb snd-fb--incorrect">❌</span>
    case 'more':
      return <span className="snd-fb snd-fb--dir">⬆️</span>
    case 'fewer':
      return <span className="snd-fb snd-fb--dir">⬇️</span>
    default:
      return null
  }
}

function HintChip({ hint }) {
  switch (hint.type) {
    case 'year':
      return <div className="snd-hint-chip"><span className="snd-hint-chip__label">Año</span> {hint.value}</div>
    case 'artist_initial':
      return <div className="snd-hint-chip"><span className="snd-hint-chip__label">Artista</span> {hint.value}__</div>
    case 'keywords':
      return <div className="snd-hint-chip"><span className="snd-hint-chip__label">Pistas</span> {hint.value}</div>
    case 'artist':
      return <div className="snd-hint-chip"><span className="snd-hint-chip__label">Artista</span> {hint.value}</div>
    case 'lyric':
      return <div className="snd-hint-chip snd-hint-chip--lyric"><span className="snd-hint-chip__label">Letra</span> <em>{hint.value}</em></div>
    default:
      return null
  }
}

export default function GuessHistory({ guesses, progressiveHints }) {
  return (
    <div className="snd-guess-history">
      {guesses.map((guess, i) => (
        <div key={i} className="snd-guess">
          <div className="snd-guess__song">
            <strong>{guess.title}</strong>
            <span>{guess.artist}</span>
          </div>
          <div className="snd-guess__feedback">
            <div className="snd-guess__fb-item">
              <span className="snd-guess__fb-label">Artista</span>
              <FeedbackIcon value={guess.feedback.artist} />
            </div>
            <div className="snd-guess__fb-item">
              <span className="snd-guess__fb-label">Palabras</span>
              <FeedbackIcon value={guess.feedback.title_words} />
            </div>
          </div>
          {progressiveHints[i] && (
            <div className="snd-guess__hint">
              <HintChip hint={progressiveHints[i]} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
