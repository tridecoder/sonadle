<?php
/**
 * Panel de administración — Sonadle
 */
defined('ABSPATH') || exit;

$songs    = snd_get_upcoming_songs();
$queue    = snd_queue_days_remaining();
$low_queue = $queue < 7;
?>

<div class="wrap" id="sonadle-admin">
    <h1>Sonadle — Canciones del día</h1>

    <?php if ($low_queue): ?>
        <div class="notice notice-warning">
            <p>
                <strong>Cola baja:</strong> quedan <?php echo esc_html($queue); ?> días programados.
                Añade canciones antes de quedarte sin margen.
            </p>
        </div>
    <?php endif; ?>

    <div class="snd-admin-layout">

        <!-- Columna izquierda: formulario -->
        <div class="snd-admin-form-col">
            <h2>Añadir canción</h2>

            <form method="post" action="">
                <?php wp_nonce_field('snd_save_song'); ?>
                <input type="hidden" name="snd_save_song" value="1">

                <table class="form-table">
                    <tr>
                        <th><label for="snd_play_date">Fecha</label></th>
                        <td>
                            <input type="date" name="snd_play_date" id="snd_play_date"
                                   min="<?php echo esc_attr(current_time('Y-m-d')); ?>"
                                   class="regular-text" required>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="snd_title">Título</label></th>
                        <td><input type="text" name="snd_title" id="snd_title" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th><label for="snd_artist">Artista</label></th>
                        <td><input type="text" name="snd_artist" id="snd_artist" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th><label for="snd_album">Álbum</label></th>
                        <td><input type="text" name="snd_album" id="snd_album" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th><label for="snd_year">Año</label></th>
                        <td><input type="number" name="snd_year" id="snd_year" min="1950" max="2030" class="small-text"></td>
                    </tr>
                    <tr>
                        <th><label for="snd_genre">Género</label></th>
                        <td>
                            <select name="snd_genre" id="snd_genre">
                                <option value="">— Seleccionar —</option>
                                <?php foreach (['Pop', 'Indie', 'Rock', 'Electrónica', 'Hip-hop', 'Soul / R&B', 'Folk', 'Punk', 'Metal', 'Jazz', 'Clásica', 'Otro'] as $g): ?>
                                    <option value="<?php echo esc_attr($g); ?>"><?php echo esc_html($g); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="snd_lyric_hint">Fragmento de letra <em>(Pista 1)</em></label></th>
                        <td>
                            <textarea name="snd_lyric_hint" id="snd_lyric_hint" rows="4" class="large-text" required></textarea>
                            <p class="description">Entre 2 y 4 versos. Sin el título ni el nombre del artista.</p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="snd_cover_url_remote">URL portada <em>(Pistas 5 y 6)</em></label></th>
                        <td>
                            <input type="url" name="snd_cover_url_remote" id="snd_cover_url_remote" class="large-text">
                            <p class="description">
                                Pega la URL de la portada del álbum. Se descargará al servidor automáticamente.
                                Búscala en <a href="https://coverartarchive.org" target="_blank">Cover Art Archive</a>
                                usando el MBID del álbum en MusicBrainz.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="snd_difficulty">Dificultad</label></th>
                        <td>
                            <select name="snd_difficulty" id="snd_difficulty">
                                <option value="1">1 — Muy fácil (hitazo universal)</option>
                                <option value="2">2 — Fácil</option>
                                <option value="3" selected>3 — Media</option>
                                <option value="4">4 — Difícil (deep cut)</option>
                                <option value="5">5 — Muy difícil (solo superfans)</option>
                            </select>
                        </td>
                    </tr>
                </table>

                <p class="submit">
                    <input type="submit" class="button button-primary" value="Guardar canción">
                </p>
            </form>
        </div>

        <!-- Columna derecha: cola -->
        <div class="snd-admin-queue-col">
            <h2>Cola programada <span class="snd-queue-count">(<?php echo esc_html($queue); ?> días)</span></h2>

            <?php if (empty($songs)): ?>
                <p>No hay canciones programadas.</p>
            <?php else: ?>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Canción</th>
                            <th>Dif.</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($songs as $song): ?>
                            <tr>
                                <td><?php echo esc_html($song['play_date']); ?></td>
                                <td>
                                    <strong><?php echo esc_html($song['title']); ?></strong><br>
                                    <small><?php echo esc_html($song['artist']); ?></small>
                                </td>
                                <td><?php echo (int) $song['difficulty']; ?>/5</td>
                                <td>
                                    <a href="<?php echo esc_url(wp_nonce_url(
                                        add_query_arg(['page' => 'sonadle-admin', 'delete' => $song['id']]),
                                        'snd_delete_song_' . $song['id']
                                    )); ?>"
                                       onclick="return confirm('¿Eliminar esta canción?')"
                                       class="button button-small">
                                        Eliminar
                                    </a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>

    </div><!-- /.snd-admin-layout -->
</div><!-- /#sonadle-admin -->

<style>
.snd-admin-layout { display: flex; gap: 2rem; align-items: flex-start; margin-top: 1rem; }
.snd-admin-form-col { flex: 0 0 55%; }
.snd-admin-queue-col { flex: 1; }
.snd-queue-count { font-weight: normal; font-size: 0.85em; color: #666; }
</style>
