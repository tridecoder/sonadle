export default function GuessHistory({ guesses }) {
  if (!guesses.length) return null

  return (
    <div className="snd-guess-history">
      {guesses.map((g, i) => (
        <div key={i} className={`snd-guess ${g.correct ? 'snd-guess--correct' : 'snd-guess--wrong'}`}>
          <span className="snd-guess__icon">{g.correct ? '✅' : '❌'}</span>
          <span className="snd-guess__title">{g.title}</span>
        </div>
      ))}
    </div>
  )
}
