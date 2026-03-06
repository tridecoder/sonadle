/**
 * Normaliza texto para comparacion fuzzy de respuestas.
 * Elimina acentos, articulos, parentesis, puntuacion y espacios extra.
 */
export function normalize(text) {
  return (text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')             // quitar acentos
    .replace(/\(.*?\)/g, '')                      // quitar contenido entre parentesis
    .replace(/\b(the|a|an|el|la|los|las|un|una)\b/gi, '') // quitar articulos
    .replace(/[^a-z0-9\s]/g, '')                 // quitar puntuacion
    .replace(/\s+/g, ' ')                         // colapsar espacios
    .trim()
}

/**
 * Compara la respuesta del jugador con el titulo correcto.
 */
export function checkAnswer(userAnswer, correctTitle) {
  return normalize(userAnswer) === normalize(correctTitle)
}
