export default function AttemptsBar({ used, max }) {
  return (
    <div className="snd-attempts-bar">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`snd-attempt-slot ${i < used ? 'snd-attempt-slot--used' : ''}`}
        />
      ))}
    </div>
  )
}
