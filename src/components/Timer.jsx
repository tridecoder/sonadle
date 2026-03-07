export default function Timer({ timeLeft }) {
  const urgent = timeLeft <= 10
  return (
    <div className={`snd-timer ${urgent ? 'snd-timer--urgent' : ''}`}>
      {timeLeft}s
    </div>
  )
}
