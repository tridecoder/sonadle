import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchToday, guessLetter } from '../lib/api'

const STORAGE_KEY = 'sonadle_v34'
const MAX_WRONG = 5
const TIME_LIMIT = 90

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

function checkSolved(titleDisplay, revealedPositions) {
  const allRevealed = new Set(Object.values(revealedPositions).flat())
  return titleDisplay.every((c, i) => c !== '_' || allRevealed.has(i))
}

function calcScore(startTime, wrongCount) {
  const elapsed = (Date.now() - startTime) / 1000
  return Math.max(0, Math.round(1000 - elapsed * 10 - wrongCount * 100))
}

const devIndex = new URLSearchParams(window.location.search).get('i')

export function useGame() {
  const [loading, setLoading] = useState(true)
  const [gameNumber, setGameNumber] = useState(null)
  const [clue, setClue] = useState(null)
  const [titleDisplay, setTitleDisplay] = useState([])
  const [revealedPositions, setRevealedPositions] = useState({})
  const [usedLetters, setUsedLetters] = useState({})
  const [wrongCount, setWrongCount] = useState(0)
  const [progressiveClues, setProgressiveClues] = useState([])
  const [finished, setFinished] = useState(false)
  const [solved, setSolved] = useState(false)
  const [revealedSong, setRevealedSong] = useState(null)
  const [error, setError] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [score, setScore] = useState(0)

  const startTimeRef = useRef(null)
  const wrongCountRef = useRef(0)
  const timedOutRef = useRef(false)

  useEffect(() => { startTimeRef.current = startTime }, [startTime])
  useEffect(() => { wrongCountRef.current = wrongCount }, [wrongCount])

  // Auto-guardar en localStorage (desactivado en modo dev ?i=N)
  useEffect(() => {
    if (loading || !gameNumber || devIndex !== null) return
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
      startTime,
      score,
    })
  }, [loading, gameNumber, revealedPositions, usedLetters, wrongCount, progressiveClues, finished, solved, revealedSong, startTime, score])

  useEffect(() => {
    async function init() {
      const saved = devIndex === null ? loadState() : null

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
        if (saved.score !== undefined) setScore(saved.score)

        if (saved.startTime && !saved.finished) {
          const elapsed = (Date.now() - saved.startTime) / 1000
          if (elapsed >= TIME_LIMIT) {
            // Se acabó el tiempo mientras no estaba
            timedOutRef.current = true
            setTimeLeft(0)
            setFinished(true)
            setSolved(false)
            try {
              const finalRes = await guessLetter('', saved.wrongCount || 0, true)
              if (finalRes.revealed) setRevealedSong(finalRes.revealed)
            } catch {}
          } else {
            setStartTime(saved.startTime)
            setTimeLeft(Math.ceil(TIME_LIMIT - elapsed))
          }
        } else if (saved.startTime) {
          setStartTime(saved.startTime)
        }

        setLoading(false)
        return
      }

      try {
        const data = await fetchToday()
        setGameNumber(data.game_number)
        setClue(data.clue)
        setTitleDisplay(data.title_display)
        setStartTime(Date.now())
      } catch (err) {
        setError('No se pudo cargar el juego')
        console.error('[Sonadle]', err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  // Countdown
  useEffect(() => {
    if (loading || finished || !startTime) return

    const id = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, Math.ceil(TIME_LIMIT - elapsed))
      setTimeLeft(remaining)

      if (remaining <= 0 && !timedOutRef.current) {
        timedOutRef.current = true
        setFinished(true)
        setSolved(false)
        guessLetter('', wrongCountRef.current, true)
          .then(res => { if (res.revealed) setRevealedSong(res.revealed) })
          .catch(() => {})
      }
    }, 250)

    return () => clearInterval(id)
  }, [loading, finished, startTime])

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

      if (nowSolved) {
        setScore(calcScore(startTimeRef.current, newWrongCount))
      }

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
    timeLeft,
    score,
  }
}
