import { useGame } from '../hooks/useGame'
import ClueStack from './ClueStack'
import OptionsList from './OptionsList'
import AttemptsBar from './AttemptsBar'
import Result from './Result'

export default function Game() {
  const {
    loading,
    error,
    gameNumber,
    clue,
    options,
    eliminated,
    progressiveClues,
    attemptsUsed,
    maxAttempts,
    finished,
    solved,
    revealedSong,
    attempt,
  } = useGame()

  if (loading) return <div className="snd-loading">Cargando...</div>
  if (error)   return <div className="snd-loading">{error}</div>

  return (
    <>
      <header className="snd-header">
        <h1 className="snd-title">Sonadle</h1>
        <div className="snd-meta">
          <span className="snd-game-number">#{gameNumber}</span>
        </div>
      </header>

      <ClueStack clue={clue} progressiveClues={progressiveClues} />

      {!finished && (
        <>
          <OptionsList
            options={options}
            eliminated={eliminated}
            onSelect={attempt}
            disabled={finished}
          />
          <AttemptsBar used={attemptsUsed} max={maxAttempts} />
        </>
      )}

      {finished && (
        <>
          <OptionsList
            options={options}
            eliminated={eliminated}
            onSelect={() => {}}
            disabled={true}
          />
          <Result
            solved={solved}
            attemptsUsed={attemptsUsed}
            maxAttempts={maxAttempts}
            gameNumber={gameNumber}
            song={revealedSong}
            eliminated={eliminated}
          />
        </>
      )}
    </>
  )
}
