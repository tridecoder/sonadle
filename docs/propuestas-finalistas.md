# Sonadle: 3 Propuestas Finalistas

> Destiladas de las mecánicas A–R del documento de investigación.
> Criterios de selección: adictividad real, viabilidad técnica sin audio ni letras, encaje con jenesaispop.

---

## PROPUESTA 1: "Detective Musical" — Preguntas de sí/no + intentos libres

**Inspirada en: Mecánica N (Ronda sí/no) + Mecánica D (Ficha progresiva)**

### Cómo funciona

El jugador empieza viendo solo género y década. No hay estructura del título, no hay nada más.

Tiene **5 preguntas de sí/no** que puede gastar en cualquier momento de la partida, y **4 intentos de adivinanza libre** (con autocomplete). En total: 9 movimientos posibles, pero la distribución la elige el jugador.

**Preguntas disponibles** (el sistema responde sí/no automáticamente):
- ¿El título tiene más de 3 palabras?
- ¿El artista es una banda (no solista)?
- ¿La canción está en español?
- ¿El artista es mujer (o el grupo está liderado por una mujer)?
- ¿Es de antes de 1995?
- ¿Tiene una sola palabra en el título?
- ¿El artista tiene más de un nombre en el título? (feat., etc.)
- ¿Es una canción española o latinoamericana?

El jugador puede preguntar antes de intentar, entre intentos, o guardarse preguntas hasta el final.

### Por qué engancha

**La elección de qué preguntar y cuándo ES el juego.** Es tensión estratégica real. Si preguntas "¿es mujer?" y te dice sí, has eliminado la mitad del catálogo de golpe. Si lo gastas mal, te quedas sin munición. Genera ese "¿debería haber preguntado antes?" que hace que quieras repetir.

Es también muy de música: quien conoce bien los artistas del catálogo puede hacer preguntas más inteligentes.

### Ejemplo de partida

```
Género: Pop  |  Década: 2020s

→ Pregunta: ¿Es de una mujer?  →  Sí
→ Pregunta: ¿Tiene más de 3 palabras en el título?  →  No
→ Intento: "Good Luck, Babe!" — ❌
→ Pregunta: ¿Está en español?  →  No
→ Intento: "Break My Soul" — ✅
```

### Resultado compartible

```
Sonadle #12 — 2/4 intentos · 3 preguntas usadas
⬛⬛✅  (sin preguntas antes, 2 preguntas, acierto)
sonadle.jenesaispop.com
```

### Viabilidad técnica

**Alta.** Solo necesitas los campos que ya tienes (género, año, artista, título, idioma) más un campo `is_band: true/false` y `is_female: true/false` por canción. El sistema responde sí/no automáticamente, sin intervención editorial por canción.

### Lo que necesita

- Ampliar `songs.json` con 3-4 campos booleanos por canción (`is_band`, `is_female`, `language`, etc.)
- Interfaz de preguntas (chips clicables)
- Lógica de respuesta automática en el backend

---

## PROPUESTA 2: "Ardiendo" — Termómetro de cercanía

**Inspirada en: Mecánica I (Termómetro) + Mecánica A (Radar Musical)**

### Cómo funciona

El jugador empieza viendo solo género y número de palabras del título. Sin más.

Cada intento (6 en total) devuelve una **temperatura** que indica cuánto se parece lo que has puesto a la canción correcta:

| Temperatura | Rango | Visual |
|------------|-------|--------|
| Helado | 0–24% | 🧊 Helado |
| Tibio | 25–49% | 🌡️ Tibio |
| Caliente | 50–74% | 🔥 Caliente |
| Ardiendo | 75–99% | 🌋 Ardiendo |
| Correcto | 100% | ✅ |

**Fórmula de puntuación** (ponderada):
- Mismo artista → 40 puntos
- Misma década → 20 puntos
- Mismo género → 20 puntos
- Mismo número de palabras → 10 puntos
- Mismo idioma → 10 puntos

No se revela qué atributo has acertado. Solo la temperatura total. El jugador deduce qué cambiar.

**A partir del intento 3**, si sigue sin acertar, se revela una pista fría adicional (año exacto, o inicial del artista) para no frustrar.

### Por qué engancha

**El gradiente es dopamine puro.** "Helado... helado... tibio... CALIENTE... ¡correcto!" crea una curva emocional que el verde/rojo de Wordle no tiene. La temperatura es más misteriosa que el feedback exacto: sabes que te estás acercando pero no exactamente por dónde. Eso obliga a pensar.

Es anti-Google por diseño: no hay texto que buscar, solo una sensación de distancia.

### Ejemplo de partida

```
Género: Indie  |  Palabras en el título: 3

→ "Kill Bill" (SZA)  →  🧊 Helado (género: ❌, artista: ❌, palabras: ✅, década: ❌)
→ "Un buen día" (Los Planetas)  →  🌡️ Tibio (género: ✅, artista: ❌, palabras: ✅, década: ❌)
→ "All My Friends" (LCD Soundsystem)  →  🔥 Caliente (género: ✅, artista: ❌, palabras: ✅, década: ✅)
→ "Everything in Its Right Place" (Radiohead)  →  ✅ ¡Ardiendo! / correcto
```

### Resultado compartible

```
Sonadle #12 — 4/6
🧊🌡️🔥✅
sonadle.jenesaispop.com
```

### Viabilidad técnica

**Alta.** Todo con los campos ya existentes. Solo necesitas la fórmula de scoring en el backend. Sin trabajo editorial por canción.

### Lo que necesita

- Función de scoring ponderado en `songs.js`
- Respuesta de temperatura en `attempt.js`
- Nuevo componente visual de termómetro/temperatura
- Decidir si mostrar los atributos desglosados o solo la temperatura (recomiendo: solo temperatura, más misterioso)

---

## PROPUESTA 3: "La Pista JNSP" — Frase editorial como ancla principal

**Inspirada en: Mecánica M (Pista JNSP) + Mecánica D (Ficha progresiva)**

### Cómo funciona

La pista principal **no es un dato técnico**. Es una frase corta escrita con la voz de jenesaispop que describe la canción de forma cultural y emocional, sin citar letra, título ni artista.

**Pantalla inicial:**

```
"La que hizo que medio indie patrio se viniera arriba"
[intentar adivinar]
```

Si falla, se añade un dato frío:
- Intento 2: + Género + Década
- Intento 3: + Número de palabras del título
- Intento 4: + Inicial del artista
- Intento 5: + Estructura del título (K _ _ _  B _ _ _)
- Intento 6: + Artista completo (último intento)

### Por qué engancha

**Es el único juego musical en español que tiene voz propia.** La frase editorial no es googlear (no es un fragmento de letra ni un dato exacto), y obliga a pensar en términos culturales, no técnicos: "¿qué canción hizo que medio indie patrio se viniera arriba?" es una pregunta que solo un lector de jenesaispop puede responder bien.

El momento "aha!" es más fuerte que en cualquier otra mecánica porque no viene de datos sino de reconocimiento cultural. Eso es lo que fideliza.

Ejemplos de frases:
- "Esa que sonaba en todos los bares del verano aunque nadie la había pedido"
- "La que en 2022 hizo que te preguntaras si llevabas bien los últimos diez años"
- "Una de esas canciones que sobrevivieron mejor que el disco del que venían"
- "La que puso nombre a algo que no sabías que sentías"

### Lo que lo hace diferente de los demás

Ningún juego genérico puede tener esto con gracia. Cualquier clon puede copiar un termómetro o un árbol de pistas. Nadie puede copiar la voz de jenesaispop.

### Viabilidad técnica

**Media.** El código es trivial (es básicamente lo que ya existe con una pista nueva como tipo `jnsp`). El coste real es **editorial**: hay que escribir una frase por canción. Para el catálogo de 20 canciones actuales, son 20 frases. Luego una por día.

Opciones para reducir el trabajo:
- Escribir las frases en bloque cada semana (5 min por canción si lo conoces)
- Tener un banco de frases preparadas para los próximos 30 días
- Usar IA para borrador y editarlo (Claude puede generar propuestas con el tono del sitio, luego Sara aprueba/edita)

### Resultado compartible

```
Sonadle #12 — 3/6
💬🟥🟥✅
sonadle.jenesaispop.com
```

---

## Comparativa rápida

| | Detective (Sí/No) | Ardiendo (Termómetro) | Pista JNSP (Editorial) |
|---|---|---|---|
| **Adictividad** | Alta (estrategia) | Muy alta (emoción) | Muy alta (reconocimiento) |
| **Trabajo editorial** | Ninguno | Ninguno | 1 frase/día |
| **Anti-Google** | Muy alta | Muy alta | Excelente |
| **Encaje jnsp** | Bueno | Bueno | Perfecto |
| **Originalidad** | Media | Media-Alta | Máxima |
| **Implementación** | ~1 día | ~1 día | ~2 horas de código + frases |

---

## Recomendación

**Si quieres lo más adictivo sin trabajo editorial:** Propuesta 2 (Ardiendo). El termómetro crea la curva emocional más fuerte y es completamente automatizable.

**Si quieres lo más propio de jenesaispop:** Propuesta 3 (Pista JNSP). Es la única que no puede copiar nadie más. El trabajo editorial es menor de lo que parece si se hace en bloque.

**Combinación óptima:** Propuesta 3 como base (frase editorial como pista 1) + datos progresivos como en Propuesta 1/2. Lo editorial al frente, lo técnico como red de seguridad si no se acierta.

---

## RONDA 2 — Tres nuevas propuestas

> Generadas tras descartar las anteriores mecánicas. Restricciones confirmadas: sin audio, sin letras literales (filtro de contenido).

---

## PROPUESTA 4: "Hangman Musical"

### Cómo funciona

El título de la canción aparece oculto como guiones: `_ _ _ _   _ _ _ _`

El jugador propone letras del alfabeto una a una:
- Si la letra está en el título, aparece en todas sus posiciones
- Si no está, cuenta como fallo (máximo 6 fallos)

Se muestra género + década desde el principio. Con cada fallo se va revelando una "penalización" visual (notas musicales que se agotan, como el muñeco del ahorcado pero con iconografía musical).

### Por qué engancha

Todo el mundo sabe jugar sin instrucciones. El placer de completar huecos es inmediato — mismo loop que el crucigrama o el Wordle. Cada letra correcta da una pequeña descarga de dopamina. Los títulos en español funcionan especialmente bien porque tienen letras características (ñ, acento, etc.).

### Viabilidad

Alta. Sin datos externos, sin letras, sin audio. Solo el título de la canción y lógica de letras.

### Problema

Los títulos de una sola palabra (SAOKO, Ceremony, A-Punk) son muy difíciles. Los muy largos dan demasiada info rápido. Habría que calibrar el catálogo.

---

## PROPUESTA 5: "Reducción" — Múltiple opción que se estrecha ✅ IMPLEMENTADA

### Cómo funciona

Empiezas viendo 6 canciones. Una es la correcta. Las otras 5 son distractores del mismo género o época.

La pista principal es la frase JNSP (sin género ni década al inicio). Con cada fallo:
1. Se elimina la opción equivocada
2. Se revela una pista nueva (género → década → banda/solista → idioma)

Máximo 5 fallos. Si fallas los 5, pierdes aunque te quede una opción.

### Por qué engancha

Elimina la frustración de "no me sale el nombre" — siempre puedes ver las opciones. El juego es leer la frase JNSP y razonar qué opción encaja. La tensión sube a medida que el tablero se reduce. Muy visual.

### Viabilidad

Alta. Todo con los datos ya existentes. Los distractores se seleccionan automáticamente por género/década desde el catálogo.

---

## PROPUESTA 6: "Conexión Oculta"

### Cómo funciona

Ves 3 canciones muy conocidas. Las tres comparten algo con la canción del día: mismo productor, mismo año, mismo sello, mismo festival, misma colaboración, misma temática...

No se dice qué tienen en común. El jugador deduce:
1. Primero adivina la CONEXIÓN (qué comparten las 3 con la oculta)
2. Luego adivina la CANCIÓN

El momento de revelar la conexión ("¡todas son del verano de 2022!") es el pico emocional del juego.

### Por qué engancha

El "aha!" es el más fuerte de todos los formatos probados. Premia conocimiento real y profundo de música. Muy compartible: "hoy eran todas producidas por el mismo tío, ¿lo sabías?". Encaja perfectamente con la voz editorial de jenesaispop.

### Viabilidad

Media. Requiere curar manualmente las 3 canciones de referencia y la conexión para cada día. No es automatizable. Pero puede prepararse en bloques semanales.

### Recomendación de uso

Mejor como modo semanal especial (viernes, por ejemplo) que como juego diario. La carga editorial es manejable si se hace una vez a la semana.
