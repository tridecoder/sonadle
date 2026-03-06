<?php
/**
 * Template del juego — se monta via shortcode [sonadle]
 */
defined('ABSPATH') || exit;
?>
<div id="sonadle-app" class="snd-app">

    <!-- Estado de carga -->
    <div class="snd-loading" id="snd-loading">
        <span>Cargando...</span>
    </div>

    <!-- Estado sin login -->
    <div class="snd-gate" id="snd-gate" hidden>
        <div class="snd-gate__hint" id="snd-gate-hint">
            <!-- Pista 1 visible para el visitante -->
        </div>
        <div class="snd-gate__cta">
            <p>Inicia sesión para jugar</p>
            <a href="<?php echo esc_url(snd_get_login_url()); ?>" class="snd-btn snd-btn--primary">
                Entrar con tu cuenta del foro
            </a>
        </div>
    </div>

    <!-- Juego activo -->
    <div class="snd-game" id="snd-game" hidden>

        <header class="snd-header">
            <h1 class="snd-title"><!-- Nombre del juego --></h1>
            <div class="snd-meta">
                <span class="snd-game-number" id="snd-game-number"></span>
                <span class="snd-streak" id="snd-streak" hidden>🔥 <span></span></span>
            </div>
        </header>

        <!-- Pistas -->
        <div class="snd-hints" id="snd-hints">
            <!-- Las pistas se inyectan aquí via JS -->
        </div>

        <!-- Campo de respuesta -->
        <div class="snd-input-area" id="snd-input-area">
            <div class="snd-autocomplete">
                <input
                    type="text"
                    id="snd-answer"
                    class="snd-input"
                    placeholder="Busca la canción..."
                    autocomplete="off"
                    spellcheck="false"
                />
                <ul class="snd-suggestions" id="snd-suggestions" hidden></ul>
            </div>
            <button class="snd-btn snd-btn--primary" id="snd-submit">
                Intentar
            </button>
        </div>

        <!-- Intentos usados -->
        <div class="snd-attempts-bar" id="snd-attempts-bar">
            <!-- 6 slots generados por JS -->
        </div>

    </div>

    <!-- Resultado final -->
    <div class="snd-result" id="snd-result" hidden>
        <div class="snd-result__verdict" id="snd-result-verdict"></div>
        <div class="snd-result__song" id="snd-result-song"></div>
        <div class="snd-result__stats" id="snd-result-stats"></div>
        <div class="snd-result__share">
            <button class="snd-btn snd-btn--share" id="snd-share-btn">
                Compartir resultado
            </button>
            <span class="snd-share-confirm" id="snd-share-confirm" hidden>¡Copiado!</span>
        </div>
        <div class="snd-result__countdown" id="snd-result-countdown">
            <!-- Cuenta atrás hasta la siguiente canción -->
        </div>
        <!-- Slot de banner — solo se muestra cuando la partida ha terminado -->
        <div class="snd-banner" id="snd-banner">
            <?php
            // TODO: insertar el código del banner aquí
            // Coordinar con el sistema de publicidad actual del sitio
            ?>
        </div>
    </div>

</div><!-- /#sonadle-app -->
