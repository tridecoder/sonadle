# Sprint 4 — Diseno, banners, testing y lanzamiento

**Semana:** 4
**Objetivo:** El juego tiene el nivel de calidad visual y de experiencia necesario para lanzar publicamente. Los banners estan integrados. Se ha testeado en dispositivos reales. Esta listo.

## Prerequisitos (del Sprint 3)

- Juego core + auth + gamificacion funcionando
- Panel admin operativo
- Al menos 14 canciones cargadas en la cola

## Diseno y UI

- [ ] Aplicar identidad visual del juego (ver `diseno/brief.md`)
- [ ] Maquetar mobile-first:
  - Pantalla principal del juego (pistas + campo de respuesta)
  - Pantalla de resultado (compartir, racha, puntos)
  - Tabla de clasificacion
  - Perfil basico
- [ ] Asegurar que el diseno encaja con la estetica de jenesaispop.com
- [ ] Animaciones minimas: entrada de pistas, feedback de intento, celebracion en acierto
- [ ] Estado de primera visita (onboarding): explicacion rapida en 3 lineas
- [ ] Estado de "ya jugaste hoy" con resultado anterior + cuenta atras

## Banners

- [ ] Definir posicion del banner (debajo del resultado, no durante el juego)
- [ ] Implementar slot de banner compatible con el sistema de publicidad actual
- [ ] Verificar que el banner no rompe el layout en movil
- [ ] Testear que el banner carga sin afectar la velocidad del juego

## Testing

- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Escritorio: Chrome, Firefox, Safari
- [ ] Flujo completo: visitante anonimo → ve pista 1 → login → jugar → compartir
- [ ] Verificar que la cancion del dia no es accesible sin autenticacion (checklist de `tecnico/seguridad-anti-spoiler.md`)
- [ ] Verificar rate limiting en produccion
- [ ] Testear reset de racha (simular dia saltado)
- [ ] Revision de accesibilidad basica: contraste, tamano de texto, navegacion por teclado

## Preparacion del lanzamiento

- [ ] 14 canciones cargadas en la cola
- [ ] Crear post/anuncio en jenesaispop sobre el juego
- [ ] Preparar post para redes sociales con el primer dia del juego
- [ ] Configurar tracking: UTMs en el link de compartir, evento en GA para "partida completada" y "registro nuevo"
- [ ] Configurar log de errores (puede ser un log en la DB o error_log de PHP)
- [ ] Verificar que la pagina del juego no aparece en AMP
- [ ] **Soft launch:** Compartir con un grupo reducido (comunidad del foro) para detectar bugs antes del lanzamiento publico. 2-3 dias minimo.

## Criterios de aceptacion del Sprint 4 (= criterios de lanzamiento)

- [ ] Diseno aprobado por iko
- [ ] Funciona correctamente en iOS Safari y Android Chrome
- [ ] El banner aparece y no rompe el layout
- [ ] No hay errores de consola en el flujo principal
- [ ] 14 canciones cargadas en la cola
- [ ] Checklist de seguridad anti-spoiler completada
- [ ] El post de lanzamiento esta escrito
- [ ] Al menos 5 personas del foro han probado el soft launch sin bugs bloqueantes

## Si algo se ha retrasado

Orden de prioridad para recortar:
1. El juego funciona (no negociable)
2. Auth funciona (no negociable)
3. Compartir funciona (no negociable)
4. Rachas funcionan (muy deseable)
5. Tabla de clasificacion (puede ir en un update post-lanzamiento)
6. Diseno pulido (puede iterar post-lanzamiento)
7. Banners (puede ir en un update post-lanzamiento)
