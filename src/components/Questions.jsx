const QUESTIONS = [
  { key: 'title_long',   label: '¿Más de 3 palabras en el título?' },
  { key: 'is_band',      label: '¿Es una banda?' },
  { key: 'is_female',    label: '¿Artista mujer?' },
  { key: 'in_spanish',   label: '¿Está en español?' },
  { key: 'before_2000',  label: '¿Es de antes del 2000?' },
]

export default function Questions({ answers, questionsUsed, maxQuestions, onAsk, disabled }) {
  const answeredKeys = new Set(answers.map(a => a.question))
  const remaining = maxQuestions - questionsUsed

  return (
    <div className="snd-questions">
      <div className="snd-questions__header">
        <span className="snd-questions__title">Preguntas</span>
        <span className="snd-questions__remaining">{remaining} restantes</span>
      </div>
      <div className="snd-questions__list">
        {QUESTIONS.map(q => {
          const answered = answers.find(a => a.question === q.key)

          if (answered) {
            return (
              <div key={q.key} className={`snd-question snd-question--answered snd-question--${answered.answer === 'sí' ? 'yes' : 'no'}`}>
                <span className="snd-question__label">{q.label}</span>
                <span className="snd-question__answer">{answered.answer}</span>
              </div>
            )
          }

          return (
            <button
              key={q.key}
              className="snd-question snd-question--available"
              onClick={() => onAsk(q.key)}
              disabled={disabled || remaining === 0}
            >
              {q.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
