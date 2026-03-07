import { useEffect } from 'react'

const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l','ñ'],
  ['z','x','c','v','b','n','m'],
]

export default function Keyboard({ usedLetters, onGuess, disabled }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (disabled) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const key = e.key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (/^[a-z]$/.test(key) && !usedLetters[key]) {
        onGuess(key)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, usedLetters, onGuess])

  return (
    <div className="snd-keyboard">
      {ROWS.map((row, ri) => (
        <div key={ri} className="snd-keyboard__row">
          {row.map(letter => {
            const state = usedLetters[letter] // 'correct' | 'wrong' | undefined
            return (
              <button
                key={letter}
                className={`snd-key ${state ? `snd-key--${state}` : ''}`}
                onClick={() => onGuess(letter)}
                disabled={disabled || !!state}
              >
                {letter.toUpperCase()}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
