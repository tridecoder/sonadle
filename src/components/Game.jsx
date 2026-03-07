import { useGame } from '../hooks/useGame'
import ClueStack from './ClueStack'
import TitleDisplay from './TitleDisplay'
import Lives from './Lives'
import Keyboard from './Keyboard'
import Result from './Result'

export default function Game() {
  const {
    loading,
    error,
    gameNumber,
    clue,
    titleDisplay,
    revealedPositions,
    usedLetters,
    wrongCount,
    maxWrong,
    progressiveClues,
    finished,
    solved,
    revealedSong,
    guess,
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

      <TitleDisplay titleDisplay={titleDisplay} revealedPositions={revealedPositions} />

      <Lives wrongCount={wrongCount} maxWrong={maxWrong} />

      {!finished && (
        <Keyboard usedLetters={usedLetters} onGuess={guess} disabled={finished} />
      )}

      {finished && (
        <Result
          solved={solved}
          wrongCount={wrongCount}
          maxWrong={maxWrong}
          gameNumber={gameNumber}
          song={revealedSong}
          usedLetters={usedLetters}
        />
      )}
    </>
  )
}
