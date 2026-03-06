import { useGame } from '../hooks/useGame'
import Hints from './Hints'
import Input from './Input'
import AttemptsBar from './AttemptsBar'
import Result from './Result'

export default function Game() {
  const {
    loading,
    error,
    gameNumber,
    hints,
    attemptsUsed,
    maxAttempts,
    finished,
    solved,
    revealedSong,
    attempt,
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

      <Hints hints={hints} />

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
          maxAttempts={maxAttempts}
          gameNumber={gameNumber}
          song={revealedSong}
        />
      )}
    </>
  )
}
