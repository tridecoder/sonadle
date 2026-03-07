const BASE = '/api'

export async function fetchToday() {
  const res = await fetch(`${BASE}/game/today`)
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function submitAttempt(title, attemptNum) {
  const res = await fetch(`${BASE}/game/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, attempt_num: attemptNum }),
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
