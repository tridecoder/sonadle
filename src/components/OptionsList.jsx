export default function OptionsList({ options, eliminated, onSelect, disabled }) {
  return (
    <div className="snd-options">
      {options.map((opt) => {
        const isEliminated = eliminated.includes(opt.title)
        return (
          <button
            key={opt.title}
            className={`snd-option ${isEliminated ? 'snd-option--eliminated' : ''}`}
            onClick={() => !isEliminated && !disabled && onSelect(opt.title)}
            disabled={isEliminated || disabled}
          >
            <span className="snd-option__title">{opt.title}</span>
            <span className="snd-option__artist">{opt.artist}</span>
          </button>
        )
      })}
    </div>
  )
}
