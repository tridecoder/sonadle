import { useGame } from '../hooks/useGame'
import JNSPClue from './JNSPClue'
import Questions from './Questions'
import GuessHistory from './GuessHistory'
import Input from './Input'
import AttemptsBar from './AttemptsBar'
import Result from './Result'

export default function Game() {
  const {
    loading,
    error,
    gameNumber,
    clue,
    guesses,
    answers,
    attemptsUsed,
    questionsUsed,
    maxAttempts,
    maxQuestions,
    finished,
    solved,
    revealedSong,
    attempt,
    question,
  } = useGame()

  if (loading) {
    return <div className="snd-loading">Cargando...</div>
  }

  if (error) {
    return <div className="snd-loading">{error}</div>
  }

  return (
    <>
      <header className="snd-header">
        <h1 className="snd-title">Sonadle</h1>
        <div className="snd-meta">
          <span className="snd-game-number">#{gameNumber}</span>
        </div>
      </header>

      <JNSPClue clue={clue} />

      {!finished && (
        <Questions
          answers={answers}
          questionsUsed={questionsUsed}
          maxQuestions={maxQuestions}
          onAsk={question}
          disabled={finished}
        />
      )}

      {finished && answers.length > 0 && (
        <Questions
          answers={answers}
          questionsUsed={questionsUsed}
          maxQuestions={maxQuestions}
          onAsk={() => {}}
          disabled={true}
        />
      )}

      <GuessHistory guesses={guesses} />

      {!finished && (
        <>
          <Input onSubmit={attempt} disabled={finished} />
          <AttemptsBar used={attemptsUsed} max={maxAttempts} />
        </>
      )}

      {finished && (
        <Result
          solved={solved}
          attemptsUsed={attemptsUsed}
          questionsUsed={questionsUsed}
          maxAttempts={maxAttempts}
          gameNumber={gameNumber}
          song={revealedSong}
          guesses={guesses}
          answers={answers}
        />
      )}
    </>
  )
}
