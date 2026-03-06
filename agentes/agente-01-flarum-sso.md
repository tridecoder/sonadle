# Instrucciones — Agente 1: Investigación Flarum SSO

**Cuándo lanzar:** Al inicio del Sprint 0, en paralelo con el Agente 2.
**Tiempo estimado:** 1-2 horas de trabajo del agente.
**Output esperado:** `tecnico/integracion-flarum.md` actualizado con la solución elegida, ejemplos de código PHP y plan de implementación concreto.

---

## Contexto que necesitas conocer

Estás investigando cómo integrar la autenticación de un foro Flarum con un juego web en PHP.

- **El sitio:** jenesaispop.com — web musical española con WordPress
- **El foro:** Flarum en `jenesaispop.com/foros` (mismo dominio que el juego)
- **El juego:** Se llamará Sonadle, vivirá en `jenesaispop.com/sonadle`
- **Objetivo del SSO:** Que un usuario logueado en el foro esté automáticamente logueado en el juego. Sin doble login, sin crear una cuenta nueva.
- **Stack del juego:** PHP (WordPress REST API), MySQL, Vanilla JS en el frontend
- **Datos que necesitamos de Flarum:** `user_id`, `username`, `avatar_url`, `is_admin`

El documento de referencia con las opciones ya identificadas está en:
`/Users/saralegui/Documents/proyectos/jenesaispop/sonadle/tecnico/integracion-flarum.md`

Léelo antes de empezar. Tu trabajo es pasar de "opciones a investigar" a "solución elegida con implementación".

---

## Tareas a realizar, en orden

### 1. Determinar la versión de Flarum

Lee el archivo `tecnico/integracion-flarum.md` para entender el contexto.

Luego, intenta determinar la versión de Flarum buscando información sobre la API de Flarum:
- Busca documentación oficial de la Flarum REST API
- Investiga qué versiones de Flarum tienen soporte nativo de tokens JWT
- Documenta qué endpoint de autenticación existe: `POST /api/token`

### 2. Investigar la Opción A — JWT nativo de Flarum

Busca en la documentación oficial de Flarum (`docs.flarum.org`) y en fuentes técnicas:

**Preguntas a responder:**
- ¿Existe el endpoint `POST /foros/api/token`? ¿Qué parámetros acepta?
- ¿Qué devuelve exactamente? ¿Un JWT o un token opaco?
- ¿El token incluye `userId` y `attributes.username`?
- ¿Cuánto dura el token? ¿Hay refresh token?
- ¿Cómo se valida el token desde PHP sin hacer una llamada a Flarum en cada request?

Busca ejemplos reales de código PHP que validen tokens de Flarum.

### 3. Investigar la Opción C — Cookie compartida

Como el foro y el juego están en el mismo dominio (`jenesaispop.com`), la cookie de sesión de Flarum podría ser accesible desde el juego.

**Preguntas a responder:**
- ¿Qué nombre tiene la cookie de sesión de Flarum? ¿`flarum_session` o similar?
- ¿Cómo se puede validar esa cookie desde PHP para obtener el usuario?
- ¿Requiere acceso a la base de datos de Flarum directamente?
- ¿Qué tabla de Flarum almacena las sesiones?

Busca en el código fuente de Flarum (GitHub: `flarum/framework`) cómo gestiona las sesiones.

### 4. Comparar las opciones y elegir una

Con la información recopilada, evalúa:

| Criterio | Opción A (JWT) | Opción C (Cookie) |
|----------|---------------|-------------------|
| Complejidad de implementación | | |
| Requiere modificar Flarum | | |
| Funciona si Flarum está caído | | |
| Riesgo de seguridad | | |
| Tiempo estimado de implementación | | |

**Criterio de decisión:** Para un MVP con plazo de 1 mes y un solo desarrollador, prioriza la opción más simple y con menos superficie de error. La elegancia es secundaria.

### 5. Escribir el plan de implementación en PHP

Una vez elegida la opción, escribe el código PHP de ejemplo para:

1. **Validar la sesión del usuario** al recibir un request a la API del juego
2. **Obtener los datos del usuario** (id, username, avatar, is_admin) a partir de la sesión
3. **Manejar el caso de sesión inválida** (devolver 401)

El código irá en `wp-content/plugins/sonadle/includes/auth.php`. Escríbelo pensando en ese contexto (WordPress + PHP).

Ejemplo de estructura esperada:

```php
// auth.php
function snd_get_current_user() {
    // Validar sesión de Flarum
    // Devolver array con user_id, username, avatar_url, is_admin
    // O devolver null si no hay sesión válida
}

function snd_require_auth(WP_REST_Request $request) {
    $user = snd_get_current_user();
    if (!$user) {
        return new WP_Error('unauthorized', 'Se requiere login', ['status' => 401]);
    }
    return true;
}
```

---

## Output esperado

Actualiza el archivo `/Users/saralegui/Documents/proyectos/jenesaispop/sonadle/tecnico/integracion-flarum.md` con:

1. **Estado actualizado** — ya no es "por investigar", es "solución elegida: [Opción X]"
2. **Respuesta a todas las preguntas** de la sección de investigación
3. **La opción elegida con justificación** (2-3 frases)
4. **Código PHP de implementación** para `auth.php`
5. **Riesgos conocidos** de la solución elegida
6. **Fallback** si la solución falla durante el Sprint 2

Si encuentras que ninguna de las opciones A o C es viable sin modificar Flarum, documenta por qué y detalla la Opción D (login propio) con su implementación.

---

## Criterio de éxito

Al terminar, iko debe poder leer el documento y saber exactamente qué código escribir en el Sprint 2 sin tener que investigar nada más.
