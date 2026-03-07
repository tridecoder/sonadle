export default function Lives({ wrongCount, maxWrong }) {
  return (
    <div className="snd-lives">
      {Array.from({ length: maxWrong }, (_, i) => (
        <span key={i} className={`snd-life ${i < wrongCount ? 'snd-life--lost' : ''}`} />
      ))}
    </div>
  )
}
