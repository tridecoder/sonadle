# src/ — Código del proyecto

Esta carpeta contendrá el código del juego. La estructura definitiva se decide en el Sprint 0 según el stack elegido.

## Estructura prevista

```
src/
├── frontend/       — SPA del juego (JS + CSS)
│   ├── js/
│   │   ├── game.js         — lógica principal del juego
│   │   ├── api.js          — comunicación con el backend
│   │   ├── auth.js         — gestión de sesión / Flarum
│   │   └── ui.js           — manipulación del DOM
│   └── css/
│       └── game.css
├── backend/        — API REST (PHP o Node, por decidir)
│   ├── index.php (o index.js)
│   ├── routes/
│   ├── controllers/
│   └── db/
└── admin/          — Panel de administración de contenido
    ├── templates/
    └── js/
```

## Pendiente del Sprint 0

- [ ] Elegir stack (PHP vs Node para backend, Vanilla JS vs Preact para frontend)
- [ ] Crear estructura definitiva de carpetas
- [ ] Configurar el entorno de desarrollo
- [ ] Inicializar el repositorio Git (si no está ya)
