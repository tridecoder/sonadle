import { useState, useEffect, useCallback } from 'react'
import { fetchToday, submitAttempt } from '../lib/api'

const STORAGE_KEY = 'sonadle_v17'
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
  const [hints, setHints] = useState([])
  const [attemptsUsed, setAttemptsUsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [solved, setSolved] = useState(false)
  const [revealedSong, setRevealedSong] = useState(null)
  const [error, setError] = useState(null)

  // Inicializar
  useEffect(() => {
    async function init() {
      const saved = loadState()

      if (saved) {
        setGameNumber(saved.gameNumber)
        setHints(saved.hints)
        setAttemptsUsed(saved.attemptsUsed)
        setFinished(saved.finished)
        setSolved(saved.solved)
        if (saved.revealedSong) setRevealedSong(saved.revealedSong)
        setLoading(false)
        return
      }

      try {
        const data = await fetchToday(0)
        setGameNumber(data.game_number)
        setHints(data.hints)
        saveState({
          date: getTodayStr(),
          gameNumber: data.game_number,
          hints: data.hints,
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

  const attempt = useCallback(async (answer) => {
    if (finished || attemptsUsed >= MAX_ATTEMPTS) return null

    const nextAttempt = attemptsUsed + 1

    try {
      const res = await submitAttempt(answer, nextAttempt)

      const newHints = res.new_hint ? [...hints, res.new_hint] : hints
      const revealed = res.finished
        ? { title: res.title, artist: res.artist, album: res.album, cover_url: res.cover_url }
        : null

      setAttemptsUsed(res.attempt_num)
      setFinished(res.finished)
      setSolved(res.solved)
      setHints(newHints)
      if (revealed) setRevealedSong(revealed)

      saveState({
        date: getTodayStr(),
        gameNumber,
        hints: newHints,
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
  }, [finished, attemptsUsed, hints, gameNumber])

  return {
    loading,
    error,
    gameNumber,
    hints,
    attemptsUsed,
    maxAttempts: MAX_ATTEMPTS,
    finished,
    solved,
    revealedSong,
    attempt,
  }
}
