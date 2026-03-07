export default function TitleDisplay({ titleDisplay, revealedPositions }) {
  if (!titleDisplay.length) return null

  const allRevealed = new Set(Object.values(revealedPositions).flat())

  // Agrupa el array en palabras separadas por espacios
  const words = []
  let current = []

  titleDisplay.forEach((char, i) => {
    if (char === ' ') {
      if (current.length) { words.push(current); current = [] }
    } else {
      const isLetter = char === '_'
      const isRevealed = isLetter && allRevealed.has(i)
      const displayChar = isRevealed
        ? Object.entries(revealedPositions).find(([, positions]) => positions.includes(i))?.[0]?.toUpperCase() ?? '_'
        : char === '_' ? null : char
      current.push({ index: i, isLetter, isRevealed, displayChar, fixed: char !== '_' })
    }
  })
  if (current.length) words.push(current)

  return (
    <div className="snd-title-display">
      {words.map((word, wi) => (
        <span key={wi} className="snd-title-word">
          {word.map((slot) => (
            <span
              key={slot.index}
              className={`snd-title-slot ${slot.isRevealed || slot.fixed ? 'snd-title-slot--revealed' : ''}`}
            >
              {slot.isRevealed || slot.fixed ? (slot.displayChar ?? '') : ''}
            </span>
          ))}
        </span>
      ))}
    </div>
  )
}
