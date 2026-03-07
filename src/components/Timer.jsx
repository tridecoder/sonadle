export default function Timer({ timeLeft, maxTime }) {
  const pct = Math.max(0, (timeLeft / maxTime) * 100)
  const urgent = timeLeft <= 12
  const warning = timeLeft <= 30

  return (
    <div className="snd-timer-wrap">
      <div className={`snd-timer-count ${urgent ? 'snd-timer-count--urgent' : warning ? 'snd-timer-count--warning' : ''}`}>
        {timeLeft}s
      </div>
      <div className="snd-timer-track">
        <div
          className={`snd-timer-bar ${urgent ? 'snd-timer-bar--urgent' : warning ? 'snd-timer-bar--warning' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
