# Agentes — Instrucciones para subagentes de Claude

Estos archivos contienen las instrucciones para lanzar subagentes de Claude en paralelo durante el Sprint 0. Cada archivo es autónomo: el agente recibe ese fichero como prompt y produce un output directamente en los documentos técnicos del proyecto.

## Cómo lanzarlos

Los dos agentes se lanzan **a la vez**, al inicio del Sprint 0, mientras iko configura el entorno.

En Claude Code:
1. Abrir una conversación nueva para cada agente
2. Adjuntar el archivo de instrucciones correspondiente
3. Dar acceso de lectura/escritura a la carpeta `sonadle/`
4. Dejar que trabajen en paralelo

## Agentes disponibles

| Archivo | Tarea | Output |
|---------|-------|--------|
| `agente-01-flarum-sso.md` | Investigar e implementar SSO con Flarum | `tecnico/integracion-flarum.md` actualizado con código PHP |
| `agente-02-api-musical.md` | Evaluar y elegir API musical, escribir proxy PHP | `tecnico/integracion-api-musical.md` actualizado con código PHP |

## Cuándo revisar los resultados

Al final del día 1-2 del Sprint 0. Antes de empezar el Sprint 1, iko revisa los dos documentos actualizados y valida:
- [ ] ¿La solución SSO de Flarum es implementable en el plazo?
- [ ] ¿La API musical elegida devuelve los datos que necesitamos?
- [ ] ¿El código PHP de ejemplo es coherente con el plugin de WordPress?

Si algo no cuadra, ajustar antes de entrar en el Sprint 1.
