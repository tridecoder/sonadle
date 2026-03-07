const BASE = '/api'

function getDevIndex() {
  return new URLSearchParams(window.location.search).get('i')
}

export async function fetchToday() {
  const i = getDevIndex()
  const url = i !== null ? `${BASE}/game/today?i=${encodeURIComponent(i)}` : `${BASE}/game/today`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function guessLetter(letter, wrongCount, finished = false) {
  const i = getDevIndex()
  const url = i !== null ? `${BASE}/game/letter?i=${encodeURIComponent(i)}` : `${BASE}/game/letter`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ letter, wrong_count: wrongCount, finished }),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function searchSongs(query) {
  if (query.length < 2) return []
  const res = await fetch(`${BASE}/songs/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) return []
  return res.json()
}
