export default function ClueStack({ clue, progressiveClues }) {
  if (!clue) return null

  return (
    <div className="snd-clue-stack">
      <blockquote className="snd-jnsp-clue__quote">
        {clue.jnsp}
      </blockquote>
      {progressiveClues.map((c, i) => (
        <div key={i} className="snd-progressive-clue">
          <span className="snd-progressive-clue__label">{c.label}</span>
          <span className="snd-progressive-clue__value">{c.value}</span>
        </div>
      ))}
    </div>
  )
}
