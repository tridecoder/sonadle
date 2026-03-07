const BASE = '/api'

export async function fetchToday() {
  const res = await fetch(`${BASE}/game/today`)
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function guessLetter(letter, wrongCount, finished = false) {
  const res = await fetch(`${BASE}/game/letter`, {
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
