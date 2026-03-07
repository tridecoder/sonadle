import { useState, useEffect, useCallback } from 'react'
import { fetchToday, submitAttempt } from '../lib/api'

const STORAGE_KEY = 'sonadle_v30'
const MAX_ATTEMPTS = 6

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
  const [initialHint, setInitialHint] = useState(null)
  const [guesses, setGuesses] = useState([])
  const [progressiveHints, setProgressiveHints] = useState([])
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
        setInitialHint(saved.initialHint)
        setGuesses(saved.guesses || [])
        setProgressiveHints(saved.progressiveHints || [])
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
        setInitialHint(data.initial_hint)
        saveState({
          date: getTodayStr(),
          gameNumber: data.game_number,
          initialHint: data.initial_hint,
          guesses: [],
          progressiveHints: [],
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

  const attempt = useCallback(async (title, artist) => {
    if (finished || attemptsUsed >= MAX_ATTEMPTS) return null

    const nextAttempt = attemptsUsed + 1

    try {
      const res = await submitAttempt(title, artist, nextAttempt)

      const newGuesses = [...guesses, {
        title: res.guess.title,
        artist: res.guess.artist,
        feedback: res.feedback,
      }]

      const newProgressiveHints = res.progressive_hint
        ? [...progressiveHints, res.progressive_hint]
        : progressiveHints

      const revealed = res.revealed || null

      setGuesses(newGuesses)
      setProgressiveHints(newProgressiveHints)
      setAttemptsUsed(res.attempt_num)
      setFinished(res.finished)
      setSolved(res.solved)
      if (revealed) setRevealedSong(revealed)

      saveState({
        date: getTodayStr(),
        gameNumber,
        initialHint,
        guesses: newGuesses,
        progressiveHints: newProgressiveHints,
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
  }, [finished, attemptsUsed, guesses, progressiveHints, gameNumber, initialHint])

  return {
    loading,
    error,
    gameNumber,
    initialHint,
    guesses,
    progressiveHints,
    attemptsUsed,
    maxAttempts: MAX_ATTEMPTS,
    finished,
    solved,
    revealedSong,
    attempt,
  }
}
