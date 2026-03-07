import { useState, useRef, useEffect, useCallback } from 'react'
import { searchSongs } from '../lib/api'

export default function Input({ onSubmit, disabled }) {
  const [value, setValue] = useState('')
  const [selected, setSelected] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [shaking, setShaking] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleInput = useCallback((e) => {
    const q = e.target.value
    setValue(q)
    setSelected(null)

    clearTimeout(debounceRef.current)

    if (q.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      const results = await searchSongs(q.trim())
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    }, 300)
  }, [])

  function selectSuggestion(song) {
    setValue(`${song.title} — ${song.artist}`)
    setSelected(song)
    setShowSuggestions(false)
    setSuggestions([])
  }

  async function handleSubmit() {
    if (!selected || disabled) return

    const result = await onSubmit(selected.title)

    if (result && !result.is_correct) {
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }

    setValue('')
    setSelected(null)
    setSuggestions([])
    setShowSuggestions(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className={`snd-input-area ${shaking ? 'snd-shake' : ''}`} ref={wrapperRef}>
      <div className="snd-autocomplete">
        <input
          type="text"
          className="snd-input"
          placeholder="Busca una canción..."
          autoComplete="off"
          spellCheck="false"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        {showSuggestions && (
          <ul className="snd-suggestions">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="snd-suggestion"
                onClick={() => selectSuggestion(s)}
              >
                <strong>{s.title}</strong>
                <span>{s.artist}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        className="snd-btn snd-btn--primary"
        onClick={handleSubmit}
        disabled={disabled || !selected}
      >
        Intentar
      </button>
    </div>
  )
}
