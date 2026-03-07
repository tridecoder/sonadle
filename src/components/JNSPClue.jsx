export default function JNSPClue({ clue }) {
  if (!clue) return null

  return (
    <div className="snd-jnsp-clue">
      <div className="snd-jnsp-clue__badges">
        <span className="snd-badge">{clue.genre}</span>
        <span className="snd-badge">{clue.decade}</span>
      </div>
      <blockquote className="snd-jnsp-clue__quote">
        {clue.jnsp}
      </blockquote>
    </div>
  )
}
