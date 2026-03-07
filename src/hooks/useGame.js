import { useState, useEffect, useCallback } from 'react'
import { fetchToday, submitAttempt } from '../lib/api'

const STORAGE_KEY = 'sonadle_v32'
const MAX_ATTEMPTS = 5

function getTodayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' })
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const state = JSON.parse(raw)
    if (state.date !== getTodayStr()) return null
    return state
  } catch {
    return null
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useGame() {
  const [loading, setLoading] = useState(true)
  const [gameNumber, setGameNumber] = useState(null)
  const [clue, setClue] = useState(null)
  const [options, setOptions] = useState([])           // [{ title, artist }] — orden fijo todo el día
  const [eliminated, setEliminated] = useState([])    // títulos eliminados
  const [progressiveClues, setProgressiveClues] = useState([])  // pistas reveladas tras cada fallo
  const [attemptsUsed, setAttemptsUsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [solved, setSolved] = useState(false)
  const [revealedSong, setRevealedSong] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function init() {
      const saved = loadState()

      if (saved) {
        setGameNumber(saved.gameNumber)
        setClue(saved.clue)
        setOptions(saved.options)
        setEliminated(saved.eliminated || [])
        setProgressiveClues(saved.progressiveClues || [])
        setAttemptsUsed(saved.attemptsUsed)
        setFinished(saved.finished)
        setSolved(saved.solved)
        if (saved.revealedSong) setRevealedSong(saved.revealedSong)
        setLoading(false)
        return
      }

      try {
        const data = await fetchToday()
        setGameNumber(data.game_number)
        setClue(data.clue)
        setOptions(data.options)
        saveState({
          date: getTodayStr(),
          gameNumber: data.game_number,
          clue: data.clue,
          options: data.options,
          eliminated: [],
          progressiveClues: [],
          attemptsUsed: 0,
          finished: false,
          solved: false,
          revealedSong: null,
        })
      } catch (err) {
        setError('No se pudo cargar el juego')
        console.error('[Sonadle]', err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const attempt = useCallback(async (title) => {
    if (finished || attemptsUsed >= MAX_ATTEMPTS) return null

    const nextAttempt = attemptsUsed + 1

    try {
      const res = await submitAttempt(title, nextAttempt)

      const newEliminated = res.is_correct ? eliminated : [...eliminated, title]
      const newProgressiveClues = res.progressive_clue
        ? [...progressiveClues, res.progressive_clue]
        : progressiveClues
      const revealed = res.revealed || null

      setEliminated(newEliminated)
      setProgressiveClues(newProgressiveClues)
      setAttemptsUsed(res.attempt_num)
      setFinished(res.finished)
      setSolved(res.solved)
      if (revealed) setRevealedSong(revealed)

      saveState({
        date: getTodayStr(),
        gameNumber,
        clue,
        options,
        eliminated: newEliminated,
        progressiveClues: newProgressiveClues,
        attemptsUsed: res.attempt_num,
        finished: res.finished,
        solved: res.solved,
        revealedSong: revealed,
      })

      return res
    } catch (err) {
      console.error('[Sonadle] Error en intento:', err)
      setError('Error al enviar la respuesta')
      return null
    }
  }, [finished, attemptsUsed, eliminated, progressiveClues, gameNumber, clue, options])

  return {
    loading,
    error,
    gameNumber,
    clue,
    options,
    eliminated,
    progressiveClues,
    attemptsUsed,
    maxAttempts: MAX_ATTEMPTS,
    finished,
    solved,
    revealedSong,
    attempt,
  }
}
