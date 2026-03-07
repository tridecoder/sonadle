import { useState, useEffect, useCallback } from 'react'
import { fetchToday, submitAttempt, askQuestion } from '../lib/api'

const STORAGE_KEY = 'sonadle_v31'
const MAX_ATTEMPTS = 4
const MAX_QUESTIONS = 5

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
  const [guesses, setGuesses] = useState([])           // [{ title, correct }]
  const [answers, setAnswers] = useState([])            // [{ question, answer }]
  const [attemptsUsed, setAttemptsUsed] = useState(0)
  const [questionsUsed, setQuestionsUsed] = useState(0)
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
        setGuesses(saved.guesses || [])
        setAnswers(saved.answers || [])
        setAttemptsUsed(saved.attemptsUsed)
        setQuestionsUsed(saved.questionsUsed)
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
        saveState({
          date: getTodayStr(),
          gameNumber: data.game_number,
          clue: data.clue,
          guesses: [],
          answers: [],
          attemptsUsed: 0,
          questionsUsed: 0,
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

      const newGuesses = [...guesses, { title: res.guess, correct: res.is_correct }]
      const revealed = res.revealed || null

      setGuesses(newGuesses)
      setAttemptsUsed(res.attempt_num)
      setFinished(res.finished)
      setSolved(res.solved)
      if (revealed) setRevealedSong(revealed)

      saveState({
        date: getTodayStr(),
        gameNumber,
        clue,
        guesses: newGuesses,
        answers,
        attemptsUsed: res.attempt_num,
        questionsUsed,
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
  }, [finished, attemptsUsed, guesses, answers, gameNumber, clue, questionsUsed])

  const question = useCallback(async (questionKey) => {
    if (finished || questionsUsed >= MAX_QUESTIONS) return null
    if (answers.find(a => a.question === questionKey)) return null

    try {
      const res = await askQuestion(questionKey)

      const newAnswers = [...answers, { question: res.question, answer: res.answer }]
      const newQuestionsUsed = questionsUsed + 1

      setAnswers(newAnswers)
      setQuestionsUsed(newQuestionsUsed)

      saveState({
        date: getTodayStr(),
        gameNumber,
        clue,
        guesses,
        answers: newAnswers,
        attemptsUsed,
        questionsUsed: newQuestionsUsed,
        finished,
        solved,
        revealedSong,
      })

      return res
    } catch (err) {
      console.error('[Sonadle] Error en pregunta:', err)
      return null
    }
  }, [finished, questionsUsed, answers, gameNumber, clue, guesses, attemptsUsed, solved, revealedSong])

  return {
    loading,
    error,
    gameNumber,
    clue,
    guesses,
    answers,
    attemptsUsed,
    questionsUsed,
    maxAttempts: MAX_ATTEMPTS,
    maxQuestions: MAX_QUESTIONS,
    finished,
    solved,
    revealedSong,
    attempt,
    question,
  }
}
