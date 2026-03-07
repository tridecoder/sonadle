import { useState, useEffect, useCallback } from 'react'
import { fetchToday, guessLetter } from '../lib/api'

const STORAGE_KEY = 'sonadle_v33'
const MAX_WRONG = 6

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

/**
 * Comprueba si todas las letras del titulo han sido adivinadas.
 * titleDisplay: array de chars (' ', '_', o char especial)
 * revealedPositions: { letter: [indices] }
 */
function checkSolved(titleDisplay, revealedPositions) {
  const allRevealed = new Set(Object.values(revealedPositions).flat())
  return titleDisplay.every((c, i) => c !== '_' || allRevealed.has(i))
}

export function useGame() {
  const [loading, setLoading] = useState(true)
  const [gameNumber, setGameNumber] = useState(null)
  const [clue, setClue] = useState(null)
  const [titleDisplay, setTitleDisplay] = useState([])
  const [revealedPositions, setRevealedPositions] = useState({}) // { 'a': [0, 4, 7] }
  const [usedLetters, setUsedLetters] = useState({})             // { 'a': 'correct'|'wrong' }
  const [wrongCount, setWrongCount] = useState(0)
  const [progressiveClues, setProgressiveClues] = useState([])
  const [finished, setFinished] = useState(false)
  const [solved, setSolved] = useState(false)
  const [revealedSong, setRevealedSong] = useState(null)
  const [error, setError] = useState(null)

  // Auto-guardar en localStorage cada vez que cambia el estado del juego
  useEffect(() => {
    if (loading || !gameNumber) return
    saveState({
      date: getTodayStr(),
      gameNumber,
      clue,
      titleDisplay,
      revealedPositions,
      usedLetters,
      wrongCount,
      progressiveClues,
      finished,
      solved,
      revealedSong,
    })
  }, [loading, gameNumber, revealedPositions, usedLetters, wrongCount, progressiveClues, finished, solved, revealedSong])

  useEffect(() => {
    async function init() {
      const saved = loadState()

      if (saved) {
        setGameNumber(saved.gameNumber)
        setClue(saved.clue)
        setTitleDisplay(saved.titleDisplay)
        setRevealedPositions(saved.revealedPositions || {})
        setUsedLetters(saved.usedLetters || {})
        setWrongCount(saved.wrongCount || 0)
        setProgressiveClues(saved.progressiveClues || [])
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
        setTitleDisplay(data.title_display)
      } catch (err) {
        setError('No se pudo cargar el juego')
        console.error('[Sonadle]', err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const guess = useCallback(async (letter) => {
    if (finished || usedLetters[letter]) return

    try {
      const res = await guessLetter(letter, wrongCount, false)

      const newRevealedPositions = res.correct
        ? { ...revealedPositions, [letter]: res.positions }
        : revealedPositions

      const newUsedLetters = { ...usedLetters, [letter]: res.correct ? 'correct' : 'wrong' }
      const newWrongCount = res.wrong_count
      const newProgressiveClues = res.progressive_clue
        ? [...progressiveClues, res.progressive_clue]
        : progressiveClues

      const nowSolved = res.correct && checkSolved(titleDisplay, newRevealedPositions)
      const nowFinished = nowSolved || newWrongCount >= MAX_WRONG

      setRevealedPositions(newRevealedPositions)
      setUsedLetters(newUsedLetters)
      setWrongCount(newWrongCount)
      setProgressiveClues(newProgressiveClues)
      setFinished(nowFinished)
      setSolved(nowSolved)

      if (nowFinished) {
        const finalRes = await guessLetter(letter, newWrongCount, true)
        if (finalRes.revealed) setRevealedSong(finalRes.revealed)
      }
    } catch (err) {
      console.error('[Sonadle] Error al adivinar letra:', err)
    }
  }, [finished, usedLetters, wrongCount, revealedPositions, progressiveClues, titleDisplay])

  return {
    loading,
    error,
    gameNumber,
    clue,
    titleDisplay,
    revealedPositions,
    usedLetters,
    wrongCount,
    maxWrong: MAX_WRONG,
    progressiveClues,
    finished,
    solved,
    revealedSong,
    guess,
  }
}
