# Sonadle: Investigacion de Mecanicas de Juego

> Investigacion exhaustiva de mecanicas para un juego diario de adivinar canciones sin audio, para jenesaispop.com.
> Fecha: 7 de marzo de 2026

---

## 1. Panorama: Juegos Existentes de Adivinar Canciones

### 1.1 Juegos basados en audio (referencia, no replicables directamente)

| Juego | Mecanica principal | Que se puede adaptar |
|-------|-------------------|----------------------|
| **Heardle** | Clip de audio progresivo: 1s, 2s, 4s, 8s, 16s, 30s. 6 intentos. | La **estructura progresiva** de pistas es oro puro. Cada intento revela mas. Funciona con cualquier tipo de pista, no solo audio. |
| **Bandle** | Empieza con un instrumento (bateria), va sumando (bajo, guitarra, voz). 6 intentos. Incluye bonus rounds con BPM, letra, trivia. | **Capas progresivas** de informacion. Adaptar a capas de datos: primero un dato, luego otro, luego otro. |
| **Bandiz** | Similar a Bandle: track by track, instrumento a instrumento. | Misma idea de capas. |
| **Songless** | Clip instrumental sin letra. Multiplayer en tiempo real. | Demuestra que quitar un elemento (la letra) ya crea un reto distinto. Aplicable al reves: dar solo la letra, quitar todo lo demas. |

### 1.2 Juegos basados en texto/visual (directamente relevantes)

| Juego | Mecanica | Googleable? | Notas |
|-------|----------|-------------|-------|
| **Spotle** | Adivina el artista con 10 intentos. Cada intento revela metadata: genero, nacionalidad, decada debut, grupo/solista, ranking de oyentes. Colores verde/amarillo/gris. | Dificil de googlear porque no da texto buscable, solo feedback comparativo. | **MUY relevante.** La mecanica tipo Wordle con atributos comparados es adaptable a canciones. |
| **Albumle** | Portada pixelada. 6 intentos. Cada error reduce la pixelacion. Pistas adicionales: genero, popularidad, fecha, artista. Feedback por colores. | Dificil hasta que la imagen se despixela bastante. | **Directamente aplicable** si conseguimos portadas. |
| **PopIdle** | Identica a Albumle: portada pixelada progresiva, 6 intentos. | Idem. | Misma mecanica, diferente catalogo. |
| **COVER'D** | Portada dividida en tiles. Revelas tiles estrategicamente. Menos tiles = mejor puntuacion. | Algo googeable si revelas zona reconocible. | La mecanica de tiles es mas interactiva que pixelar progresivamente. |
| **AlbumGuessr** | Cada intento revela atributos compartidos entre tu guess y la respuesta: artista, genero, anno, sello. Sin limite de intentos. | Dificil de googlear, es deductivo. | **Muy interesante.** Es como Wordle de atributos musicales. |
| **Lyricle** | Se revela la primera linea de la letra. Vas rellenando las demas. Lifelines dan la siguiente letra. | **MUY googeable** si copias la linea de letra. | Bonita mecanica pero el problema de Google es grave. |
| **Blurrd** | Primer verso de la letra borroso/blurred. 3 intentos. | Googeable si desblurreas mentalmente. | Concepto visual interesante, ejecucion limitada. |
| **SongCloud** | Nube de palabras generada a partir de la letra. 3 intentos. Las palabras mas frecuentes aparecen mas grandes. | **Parcialmente googeable** pero mas dificil que una frase literal. | **IDEA MUY INTERESANTE para Sonadle.** |
| **Harmonies** (SongTrivia2) | Tipo NYT Connections: 16 elementos musicales, agrupa en 4 categorias de 4. | No aplicable directamente (es otro formato). | Podria ser un modo bonus. |

### 1.3 Juegos de otros medios con mecanicas adaptables

| Juego | Mecanica | Aplicacion a musica |
|-------|----------|---------------------|
| **Framed** (peliculas) | 6 fotogramas progresivos de una pelicula. | Equivalente visual: 6 "fotogramas" de una cancion (portada pixelada, fragmento de letra, dato del artista...). |
| **Wordle** | Feedback por letras: verde (posicion correcta), amarillo (letra existe), gris (no existe). | Adaptar feedback a atributos de cancion: decada correcta, genero correcto, artista incorrecto, etc. |
| **NYT Connections** | Agrupa 16 palabras en 4 categorias. | Modo alternativo: agrupa canciones por conexion oculta (mismo productor, misma tematica, mismo anno...). |

---

## 2. Estrategias Anti-Google

Antes de evaluar mecanicas, el problema central: **si la pista es googeable, el juego muere.** Aqui van las estrategias que funcionan:

### Lo que SI se puede googlear facilmente
- Un fragmento literal de letra (copia-pega en Google = respuesta instantanea)
- El titulo parcial con las primeras letras
- Datos muy especificos (duracion exacta + anno = muy buscable)

### Lo que NO se googlea facilmente
- **Feedback comparativo**: "esta cancion es del mismo genero pero de una decada anterior" -- no hay query de Google para eso
- **Nubes de palabras**: las palabras sueltas sin orden no dan un resultado unico en Google
- **Imagenes pixeladas/distorsionadas**: Google Lens no funciona bien con imagenes muy degradadas
- **Combinaciones de atributos ambiguos**: "pop, mujer, 2010s, 3 palabras en el titulo" describe muchas canciones
- **Pistas interpretativas/subjetivas**: "esta cancion habla de una ruptura y tiene un estribillo euforico" -- no googeable
- **Datos numericos aislados**: BPM, duracion, numero de palabras en el titulo sin contexto adicional

### La regla de oro
**La pista ideal es aquella que un fan reconoce por conocimiento propio pero que no produce un resultado unico en Google.**

---

## 3. Mecanicas Propuestas para Sonadle

### MECANICA A: "Radar Musical" (Wordle de Atributos)
**Inspirada en: Spotle + AlbumGuessr**

**Como funciona:**
1. El jugador introduce el nombre de una cancion como primer intento
2. El juego muestra feedback comparativo para varios atributos:
   - **Artista**: Correcto / Incorrecto (si es del mismo artista, verde)
   - **Decada**: Correcta / Anterior / Posterior
   - **Genero**: Correcto / Incorrecto
   - **Popularidad**: Mayor / Menor (comparada con la cancion objetivo)
   - **Numero de palabras del titulo**: Correcto / Mayor / Menor
3. Con cada intento, el jugador usa la informacion para afinar
4. 6 intentos

**Evaluacion:**
- **Diversion**: Alta. Es adictivo intentar deducir por eliminacion. Genera conversacion ("era pop pero anterior a los 2000...")
- **Justicia**: Buena. Al principio es abierto, pero cada pista acota mucho. Requiere conocimiento musical amplio.
- **Googleabilidad**: MUY BAJA. No hay texto que buscar, solo feedback relacional.
- **Viabilidad tecnica**: ALTA. Solo necesitas metadata de canciones (anno, genero, artista, popularidad). Lo tienes todo.
- **Encaje con jenesaispop**: PERFECTO. Premia a quien conoce musica de verdad. Es el tipo de juego que genera debate en comentarios.

**Variante recomendada**: Ademas de los atributos base, anadir uno o dos "especiales" como sello discografico, pais del artista, o si tiene featuring.

---

### MECANICA B: "Nube de Letras" (Word Cloud)
**Inspirada en: SongCloud**

**Como funciona:**
1. Se genera una nube de palabras con las 15-20 palabras mas frecuentes de la letra (excluyendo stopwords como "the", "a", "de", "que", "no")
2. Las palabras aparecen en diferentes tamanos segun frecuencia, pero **desordenadas** y sin contexto
3. El jugador tiene 6 intentos
4. Con cada error, se revela una pista adicional: primero la decada, luego el genero, luego la inicial del artista, etc.

**Evaluacion:**
- **Diversion**: ALTA. Es muy satisfactorio cuando "ves" la cancion en la nube. Genera ese momento "aha!" que engancha.
- **Justicia**: BUENA. Las canciones con vocabulario distintivo son mas faciles; las que repiten palabras genericas son mas dificiles. Se puede calibrar la seleccion de canciones.
- **Googleabilidad**: MEDIA-BAJA. Buscar una combinacion de palabras sueltas raramente da la cancion exacta. Es mucho mas dificil de googlear que un verso completo. Eso si, si la nube incluye una palabra muy unica/rara, podria ser buscable.
- **Viabilidad tecnica**: ALTA. Tienes las letras. Generar una word cloud es trivial con librerias JS (wordcloud2.js, d3-cloud).
- **Encaje con jenesaispop**: MUY BUENO. Los fans de musica que se saben las letras tienen ventaja real. Combina visual con conocimiento lirico.

**Trucos anti-Google:**
- Excluir del cloud el titulo de la cancion y el nombre del artista
- Excluir palabras que solo aparecen en esa cancion (hapax)
- Incluir solo palabras que aparecen 2+ veces

---

### MECANICA C: "Portada Progresiva" (Pixelado + Tiles)
**Inspirada en: Albumle + PopIdle + COVER'D**

**Como funciona:**
1. La portada del album aparece extremadamente pixelada (4x4 bloques de color)
2. Cada intento fallido mejora la resolucion: 4x4 -> 8x8 -> 16x16 -> 32x32 -> 64x64 -> imagen completa
3. Opcionalmente, en vez de pixelado uniforme, dividir en tiles y revelar tiles aleatorios

**Evaluacion:**
- **Diversion**: ALTA. El placer visual de ver una imagen revelarse es universal.
- **Justicia**: BUENA. Las portadas iconicas (Nevermind, OK Computer, Abbey Road) son reconocibles antes. Las portadas minimalistas o poco conocidas necesitan mas pistas.
- **Googleabilidad**: BAJA en los primeros intentos (Google Lens no reconoce 4x4 pixeles). ALTA en los ultimos (ya casi ves la portada).
- **Viabilidad tecnica**: MEDIA. Necesitas las imagenes de portada. **Actualmente no las tienes.** Pero se pueden obtener via APIs (Spotify, MusicBrainz, Last.fm) o scrapearlas. Es un problema resolvible.
- **Encaje con jenesaispop**: EXCELENTE. Los fans de musica reconocen portadas. Es visualmente atractivo para compartir en redes.

**Nota importante**: Esta mecanica SOLA puede no ser suficiente (hay portadas que no se reconocen ni en alta resolucion). Funciona mejor **como pista complementaria** dentro de otra mecanica.

---

### MECANICA D: "Ficha Progresiva" (Revelacion por capas de datos)
**Inspirada en: Bandle (capas de instrumentos) + juegos de trivia progresiva**

**Como funciona:**
Cada intento revela una nueva "capa" de informacion sobre la cancion. La informacion va de mas abstracta a mas concreta:

1. **Intento 1 (sin pistas previas)**: Solo ves la estructura del titulo (numero de palabras, representado con guiones: `_ _ _ _ _`)
2. **Intento 2**: Se revela el **anno de lanzamiento**
3. **Intento 3**: Se revela el **genero musical**
4. **Intento 4**: Se revela una **pista tematica** escrita a mano ("habla de un amor imposible en verano")
5. **Intento 5**: Se revela la **primera letra del artista** + la **portada muy pixelada**
6. **Intento 6**: Se revela el **artista completo**

**Evaluacion:**
- **Diversion**: MEDIA-ALTA. Es como un juego de acertijos. Cada capa aporta un "rush" de nueva informacion.
- **Justicia**: BUENA si las pistas estan bien calibradas. La pista tematica es la clave: tiene que ser reconocible sin ser obvia.
- **Googleabilidad**: BAJA en los primeros niveles. MEDIA en el nivel 4 (la descripcion tematica podria ser buscable si es muy especifica). ALTA en el nivel 6 (artista + anno + genero ya es muy acotado).
- **Viabilidad tecnica**: MEDIA. La mayoria es automatizable, EXCEPTO la pista tematica del intento 4. Esa requiere **escritura manual** por parte de la redaccion de jnsp. Eso es trabajo, pero tambien es la magia: le da personalidad al juego.
- **Encaje con jenesaispop**: EXCELENTE si las pistas tematicas las escribe alguien del equipo con el tono del sitio. Es lo que diferenciaria Sonadle de un juego generico.

**Problema**: Requiere contenido editorial manual para cada cancion (la pista tematica). Es lo que lo hace especial pero tambien lo que lo hace costoso de mantener.

---

### MECANICA E: "Verso a Verso" (Letra progresiva anti-Google)
**Inspirada en: Lyricle + Blurrd, con proteccion anti-Google**

**Como funciona:**
En vez de mostrar la letra literal (que se googlea), se transforma:

**Opcion E1: Letra con huecos**
- Se muestra un verso de la cancion con la mitad de las palabras reemplazadas por `____`
- Las palabras eliminadas son las mas "googleables" (sustantivos propios, palabras raras)
- Se mantienen las palabras comunes y las de estructura
- Ejemplo: `"____ in the ____ tonight, everybody's gonna ____ a ____ time"`
- Cada intento revela una palabra mas

**Opcion E2: Letra traducida/parafraseada**
- Se muestra una parafrasis del significado del verso, no el verso literal
- Ejemplo: para "Bohemian Rhapsody": *"Un joven le confiesa un crimen a su madre"*
- Imposible de googlear porque no es la letra real
- Cada intento revela una parafrasis de otro verso

**Opcion E3: Letra en emojis (version mejorada)**
- En vez de intentar representar toda la cancion con emojis (que ya dijiste que no funciona), representar **solo el estribillo** con emojis
- Anadir pistas textuales con cada intento

**Evaluacion general de E:**
- **Diversion**: ALTA (E1, E2). Los fans que se saben la letra reconoceran los patrones.
- **Justicia**: BUENA para E1 (los huecos dan suficiente contexto). VARIABLE para E2 (depende de la calidad de la parafrasis).
- **Googleabilidad**: BAJA para E1 (las palabras que quedan son demasiado genericas para buscar). MUY BAJA para E2 (es texto original, no la letra real).
- **Viabilidad**: E1 es automatizable. E2 requiere escritura manual. E3 vuelve al problema que ya descartaste.
- **Encaje con jnsp**: E2 es oro si las parafrasis las escribe alguien con el tono del sitio. E1 es una buena alternativa automatizable.

---

### MECANICA F: "Sonadle Connections" (Modo alternativo grupal)
**Inspirada en: NYT Connections + Harmonies**

**Como funciona:**
- Se presentan 16 titulos de canciones
- El jugador debe agruparlos en 4 grupos de 4
- Las conexiones pueden ser: mismo artista, mismo anno, mismo genero, misma tematica, mismo productor, canciones que se sampleo, etc.
- 4 errores y pierdes

**Evaluacion:**
- **Diversion**: MUY ALTA. Connections es adictivo y genera mucha conversacion.
- **Justicia**: Depende de lo obvias/obscuras que sean las conexiones.
- **Googleabilidad**: MEDIA. Se pueden buscar las canciones individuales, pero encontrar la conexion oculta es otro tema.
- **Viabilidad tecnica**: ALTA. Solo necesitas la lista de canciones y sus atributos.
- **Encaje con jnsp**: FANTASTICO como modo complementario. No reemplaza al juego diario principal pero es un anaadido con mucho potencial.

**Nota**: Este es un formato diferente (no es "adivina una cancion") asi que funcionaria mejor como un **modo bonus semanal**, no como el juego diario principal.

---

### MECANICA G: "Identidad Secreta" (Adivina el artista -> Adivina la cancion)
**Mecanica original**

**Como funciona:**
Dos fases en un mismo juego:
1. **Fase 1 (intentos 1-3)**: Adivina el ARTISTA. Se revelan pistas progresivas:
   - Pista 1: Pais de origen + decada de debut
   - Pista 2: Genero + solista/banda + num. de miembros
   - Pista 3: Inicial del nombre + un dato curioso ("ha colaborado con X")
2. **Fase 2 (intentos 4-6)**: Ya sabes el artista (o se revela). Adivina la CANCION:
   - Pista 4: Anno de la cancion + numero de palabras del titulo
   - Pista 5: Nube de palabras de la letra (5 palabras)
   - Pista 6: Primera linea del estribillo con huecos

**Evaluacion:**
- **Diversion**: ALTA. Dos retos en uno. Si adivinas el artista pronto, tienes mas intentos para la cancion.
- **Justicia**: BUENA. Dividir en dos fases hace que el juego sea mas accesible.
- **Googleabilidad**: BAJA en fase 1. MEDIA en fase 2.
- **Viabilidad tecnica**: ALTA. Todo basado en metadata y texto.
- **Encaje con jnsp**: MUY BUENO. Premia conocimiento profundo de artistas Y canciones.

---

### MECANICA H: "Silueta Sonora" (Visualizacion abstracta)
**Mecanica experimental**

**Como funciona:**
Se muestra una representacion visual abstracta de la cancion basada en sus datos:
- Una **barra de duracion** (cancion corta? larga?)
- **Indicador de BPM** (lenta? rapida? media?)
- **Mapa de "mood"**: un grafico radar con ejes como energia, bailabilidad, acustica, valencia (datos disponibles via Spotify API)
- **Timeline visual**: puntos que marcan donde estan los estribillos, versos, puente

Cada intento revela un dato mas concreto: genero, decada, pais, etc.

**Evaluacion:**
- **Diversion**: MEDIA. Es original pero puede ser demasiado abstracto para la mayoria.
- **Justicia**: BAJA-MEDIA. Solo los mas frikis de la musica pueden deducir una cancion por su BPM y mood. Es interesante como pista complementaria, no como mecanica principal.
- **Googleabilidad**: BAJA (no hay texto que buscar).
- **Viabilidad tecnica**: MEDIA. Requiere datos de Spotify API (audio features). El endpoint de audio features fue deprecado parcialmente, verificar disponibilidad.
- **Encaje con jnsp**: INTERESANTE como pista dentro de otra mecanica. Demasiado niche para ser el juego completo.

---

## 4. Tabla Comparativa Final

| Mecanica | Diversion | Justicia | Anti-Google | Viabilidad | Encaje jnsp | Trabajo manual |
|----------|-----------|----------|-------------|------------|-------------|----------------|
| **A: Radar Musical** (atributos Wordle) | Alta | Buena | Excelente | Alta | Perfecto | Bajo (automatizable) |
| **B: Nube de Letras** (word cloud) | Alta | Buena | Buena | Alta | Muy bueno | Bajo (automatizable) |
| **C: Portada Progresiva** | Alta | Buena | Buena | Media (necesitas imagenes) | Excelente | Bajo |
| **D: Ficha Progresiva** (capas) | Media-Alta | Buena | Buena | Media (pista manual) | Excelente | Alto (pista editorial) |
| **E1: Letra con huecos** | Alta | Buena | Buena | Alta | Bueno | Bajo |
| **E2: Letra parafraseada** | Alta | Variable | Excelente | Baja (manual) | Excelente | Muy alto |
| **F: Connections** | Muy alta | Variable | Media | Alta | Fantastico | Medio (curar grupos) |
| **G: Identidad Secreta** (2 fases) | Alta | Buena | Buena | Alta | Muy bueno | Bajo |
| **H: Silueta Sonora** | Media | Baja-Media | Excelente | Media | Niche | Bajo |

---

## 5. Recomendacion

### Opcion ganadora: MECANICA A (Radar Musical) como base, con elementos de B y C

El juego principal seria un **Wordle de atributos musicales**:

1. El jugador escribe el nombre de una cancion
2. Recibe feedback comparativo: artista (correcto/incorrecto), decada (anterior/correcta/posterior), genero (correcto/incorrecto), popularidad (mayor/menor), num. palabras del titulo (mayor/igual/menor)
3. 6 intentos para acertar
4. Opcionalmente, a partir del intento 3, se revela una **mini nube de palabras** (5-8 palabras de la letra) como pista extra
5. Si se consiguen portadas, a partir del intento 4 se muestra la portada pixelada que se va aclarando

**Por que esta combinacion:**
- **Es anti-Google por disenno**: no hay texto que copiar y pegar
- **Es automatizable al 100%**: no requiere contenido editorial manual diario
- **Es adictiva**: la mecanica de deduccion por feedback es lo que hace que Wordle funcione, y aqui se aplica al terreno musical
- **Premia conocimiento real**: tienes que conocer suficientes canciones como para hacer guesses inteligentes
- **Es compartible**: el grid de colores (verde/amarillo/rojo) es perfecto para compartir resultados en redes
- **Escala sin esfuerzo**: cada dia se selecciona una cancion de la base de datos automaticamente

### Plan B: MECANICA D (Ficha Progresiva)

Si el equipo de jnsp quiere un juego con **mas personalidad editorial** y estan dispuestos a escribir una pista tematica por cancion por dia, la Ficha Progresiva es imbatible en encaje con la marca. Es mas trabajo pero mas unico.

### Modo bonus semanal: MECANICA F (Connections)

Independientemente de cual sea el juego diario, un **"Sonadle Connections" semanal** (cada viernes, por ejemplo) seria un complemento fantastico que genera su propia traccion.

---

## 6. Proximos Pasos

1. **Prototipar la Mecanica A** con 10-20 canciones para probar el gameplay
2. **Definir los atributos** exactos del feedback (decidir cuales generan el mejor equilibrio entre informacion y ambiguedad)
3. **Conseguir portadas de album** (Spotify API, MusicBrainz, Last.fm) para integrar la mecanica C como complemento
4. **Testear la googleabilidad**: coger las pistas de 5 canciones y pedirle a alguien que intente googlearlas
5. **Disenar la pantalla de resultados** compartible (el "grid de colores" tipo Wordle)

---

## Fuentes

- [Heardle - Music Guessing Game](https://heardlewordle.io)
- [Spotle - Daily Music Artist Guessing Game](https://spotle.io/)
- [Albumle - Album Cover Guessing Game](https://albumle.app/)
- [AlbumGuessr - Daily Music Album Guessing Game](https://albumguessr.com/)
- [PopIdle - Daily Album Cover Guessing Game](https://popidle.the-sound.co.uk/)
- [COVER'D - Album Cover Puzzle Game](https://coverd.space)
- [Bandle - Guess the Song One Instrument at a Time](https://bandle.app/)
- [Bandiz - Daily Music Guessing Game](https://bandiz.app/)
- [Lyricle - Daily Lyrics Guessing Game](https://lyricle.io/)
- [Blurrd - Guess the Song from Blurred Lyrics](https://blurrd.vercel.app/)
- [SongCloud - Daily Lyric Word Cloud Game](https://songcloud.eu/)
- [Harmonies - Music Connections Game](https://songtrivia2.io/harmonies-connections)
- [Musicle - Album Guessing Game](https://musicle.app/)
- [Framed - Movie Guessing Game](https://framed.wtf/)
- [Bandle Creator Interview - Berklee](https://online.berklee.edu/takenote/bandle-creator-johann-levy-on-the-music-quiz-100k-daily-players-love/)
- [Guess the Song by Word Cloud - CustomerThink](https://customerthink.com/can-you-guess-a-song-by-its-word-cloud/)
- [Spotle Game Guide - AI Trendy Game](https://aitrendygame.com/blog/spotle-spotify-artist-guessing-game-guide)
