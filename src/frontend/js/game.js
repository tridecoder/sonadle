/**
 * Sonadle — Lógica del juego
 *
 * Lee la configuración inyectada por WordPress en window.sndConfig:
 *   sndConfig.apiBase  — URL base de la API REST (/wp-json/sonadle/v1)
 *   sndConfig.nonce    — nonce de WordPress para autenticación
 */

const API   = sndConfig.apiBase;
const NONCE = sndConfig.nonce;

// ─── Estado local ────────────────────────────────────────────────────────────

let state = {
    gameNumber:   null,
    hints:        [],
    attemptsUsed: 0,
    maxAttempts:  6,
    finished:     false,
    solved:       false,
    selectedSong: null, // { id, title, artist } del autocompletado
};

// ─── Referencias al DOM ───────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

const els = {
    loading:    $('snd-loading'),
    gate:       $('snd-gate'),
    gateHint:   $('snd-gate-hint'),
    game:       $('snd-game'),
    gameNumber: $('snd-game-number'),
    streak:     $('snd-streak'),
    hints:      $('snd-hints'),
    inputArea:  $('snd-input-area'),
    answer:     $('snd-answer'),
    suggestions:$('snd-suggestions'),
    submit:     $('snd-submit'),
    attemptsBar:$('snd-attempts-bar'),
    result:     $('snd-result'),
    verdict:    $('snd-result-verdict'),
    song:       $('snd-result-song'),
    stats:      $('snd-result-stats'),
    shareBtn:   $('snd-share-btn'),
    shareConfirm: $('snd-share-confirm'),
    countdown:  $('snd-result-countdown'),
};

// ─── Inicialización ───────────────────────────────────────────────────────────

async function init() {
    try {
        // 1. Verificar sesión
        const me = await api('/user/me');

        if (!me.logged_in) {
            // Sin login: cargar solo la primera pista y mostrar gate
            const today = await api('/game/today');
            renderGate(today);
            return;
        }

        // 2. Con login: cargar estado completo
        const [today, profile] = await Promise.all([
            api('/game/today'),
            api('/user/profile'),
        ]);

        state.gameNumber   = today.game_number;
        state.hints        = today.hints || [];
        state.attemptsUsed = today.attempts_used || 0;
        state.finished     = today.finished || false;
        state.solved       = today.solved   || false;

        renderGame();

        if (profile.current_streak > 0) {
            els.streak.hidden = false;
            els.streak.querySelector('span').textContent = profile.current_streak;
        }

        if (state.finished) {
            renderResult({ solved: state.solved, points: 0 });
        }

    } catch (err) {
        console.error('[Sonadle] Error al inicializar:', err);
    } finally {
        els.loading.hidden = true;
    }
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderGate(today) {
    const hint = today.hints?.[0];
    if (hint) {
        els.gateHint.innerHTML = renderHint(hint);
    }
    els.gate.hidden = false;
}

function renderGame() {
    els.game.hidden = false;
    els.gameNumber.textContent = `#${state.gameNumber}`;
    renderHints();
    renderAttemptsBar();
}

function renderHints() {
    els.hints.innerHTML = state.hints.map(renderHint).join('');
}

function renderHint(hint) {
    switch (hint.type) {
        case 'lyric':
            return `<div class="snd-hint snd-hint--lyric">
                        <span class="snd-hint__label">Letra</span>
                        <blockquote class="snd-hint__value">${esc(hint.value)}</blockquote>
                    </div>`;
        case 'year':
            return `<div class="snd-hint snd-hint--year">
                        <span class="snd-hint__label">Año</span>
                        <span class="snd-hint__value snd-hint__value--big">${hint.value}</span>
                    </div>`;
        case 'genre':
            return `<div class="snd-hint snd-hint--genre">
                        <span class="snd-hint__label">Género</span>
                        <span class="snd-hint__tag">${esc(hint.value)}</span>
                    </div>`;
        case 'artist':
            return `<div class="snd-hint snd-hint--artist">
                        <span class="snd-hint__label">Artista</span>
                        <span class="snd-hint__value">${esc(hint.value)}</span>
                    </div>`;
        case 'cover_pixel':
            return `<div class="snd-hint snd-hint--cover">
                        <span class="snd-hint__label">Portada</span>
                        <img class="snd-cover snd-cover--pixel"
                             src="${esc(hint.value)}" alt="Portada pixelada">
                    </div>`;
        case 'cover_medium':
            return `<div class="snd-hint snd-hint--cover">
                        <span class="snd-hint__label">Portada</span>
                        <img class="snd-cover snd-cover--medium"
                             src="${esc(hint.value)}" alt="Portada del álbum">
                    </div>`;
        default:
            return '';
    }
}

function renderAttemptsBar() {
    els.attemptsBar.innerHTML = Array.from({ length: state.maxAttempts }, (_, i) =>
        `<span class="snd-attempt-slot ${i < state.attemptsUsed ? 'snd-attempt-slot--used' : ''}"></span>`
    ).join('');
}

function renderResult({ solved, points, title, artist }) {
    els.inputArea.hidden = true;
    els.result.hidden    = false;

    els.verdict.textContent = solved
        ? '¡Lo has pillado! 🎉'
        : 'Esta vez no ha podido ser';

    if (title) {
        els.song.innerHTML = `<strong>${esc(title)}</strong> — ${esc(artist || '')}`;
    }

    els.stats.textContent = solved
        ? `En ${state.attemptsUsed} intento${state.attemptsUsed === 1 ? '' : 's'} · ${points} punto${points === 1 ? '' : 's'}`
        : 'Sin puntos hoy';

    renderCountdown();
}

function renderCountdown() {
    function update() {
        const now       = new Date();
        const midnight  = new Date();
        midnight.setHours(24, 0, 0, 0);
        const diff      = midnight - now;
        const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        els.countdown.textContent = `Nueva canción en ${h}:${m}:${s}`;
    }
    update();
    setInterval(update, 1000);
}

// ─── Jugar ────────────────────────────────────────────────────────────────────

els.submit.addEventListener('click', submitAttempt);
els.answer.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitAttempt();
});

async function submitAttempt() {
    const answer = state.selectedSong?.title || els.answer.value.trim();
    if (!answer || state.finished) return;

    els.submit.disabled = true;

    try {
        const res = await api('/game/attempt', 'POST', { answer });

        state.attemptsUsed = res.attempt_num;
        state.finished     = res.finished;
        state.solved       = res.solved;

        if (res.new_hint) {
            state.hints.push(res.new_hint);
            renderHints();
        }

        renderAttemptsBar();

        if (!res.is_correct) {
            shakeFeedback();
        }

        if (res.finished) {
            renderResult(res);
        }

    } catch (err) {
        console.error('[Sonadle] Error al enviar intento:', err);
    } finally {
        els.submit.disabled = false;
        els.answer.value    = '';
        state.selectedSong  = null;
        hideSuggestions();
    }
}

// ─── Autocompletado ───────────────────────────────────────────────────────────

let debounceTimer = null;

els.answer.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = els.answer.value.trim();

    if (q.length < 2) {
        hideSuggestions();
        return;
    }

    debounceTimer = setTimeout(() => fetchSuggestions(q), 300);
});

async function fetchSuggestions(q) {
    try {
        const results = await api(`/songs/search?q=${encodeURIComponent(q)}`);
        renderSuggestions(results);
    } catch (err) {
        hideSuggestions();
    }
}

function renderSuggestions(results) {
    if (!results.length) { hideSuggestions(); return; }

    els.suggestions.innerHTML = results.map((s, i) =>
        `<li class="snd-suggestion" data-index="${i}" tabindex="0">
            <strong>${esc(s.title)}</strong>
            <span>${esc(s.artist)}</span>
        </li>`
    ).join('');

    els.suggestions.hidden = false;

    els.suggestions.querySelectorAll('.snd-suggestion').forEach((li, i) => {
        li.addEventListener('click', () => selectSuggestion(results[i]));
    });
}

function selectSuggestion(song) {
    state.selectedSong = song;
    els.answer.value   = song.title;
    hideSuggestions();
}

function hideSuggestions() {
    els.suggestions.hidden   = true;
    els.suggestions.innerHTML = '';
}

document.addEventListener('click', e => {
    if (!e.target.closest('#snd-autocomplete')) hideSuggestions();
});

// ─── Compartir ────────────────────────────────────────────────────────────────

els.shareBtn.addEventListener('click', () => {
    const emojis = Array.from({ length: state.attemptsUsed }, (_, i) =>
        i === state.attemptsUsed - 1 && state.solved ? '🟩' : '⬜'
    ).join('');

    const streak = els.streak.hidden ? '' : `\nRacha: ${els.streak.querySelector('span').textContent} días`;

    const text = `Sonadle #${state.gameNumber} — ${state.solved ? state.attemptsUsed : 'X'}/${state.maxAttempts}\n${emojis}${streak}\njenesaispop.com/sonadle`;

    navigator.clipboard.writeText(text).then(() => {
        els.shareConfirm.hidden = false;
        setTimeout(() => { els.shareConfirm.hidden = true; }, 2000);
    });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function api(path, method = 'GET', body = null) {
    const opts = {
        method,
        headers: { 'X-WP-Nonce': NONCE, 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(API + path, opts);

    if (!res.ok && res.status !== 401) {
        throw new Error(`API error ${res.status}: ${path}`);
    }

    return res.json();
}

function esc(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function shakeFeedback() {
    els.inputArea.classList.add('snd-shake');
    setTimeout(() => els.inputArea.classList.remove('snd-shake'), 500);
}

// ─── Arrancar ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);
