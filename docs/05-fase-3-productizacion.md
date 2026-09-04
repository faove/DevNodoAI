# Fase 3 — Productización SaaS

Objetivo: convertir el MVP multi-agente en un producto que se le puede cobrar a
terceros. No arranca hasta tener validado con uso real (aunque sea interno/beta)
que el flujo conversacional resuelve el problema.

## Multi-tenancy real

- [ ] Definir si el modelo es "equipo/agencia con miembros" (varios `User` comparten
      `Client`s) o "una cuenta = un dueño" para V1 de billing. Esto cambia el
      esquema (`teams` + `team_user` vs. solo `user_id` en `Client`).
- [ ] Roles/permisos si aplica multi-usuario por cuenta (ej. dueño vs. editor).

## Billing

- [ ] Integrar Stripe (o Paddle) — planes por volumen de generaciones/mes.
- [ ] Límites de uso por plan, enforced antes de llamar a `FlowExecutor` (no
      después de gastar tokens de Claude).
- [ ] Medir costo real por `WorkflowRun` (tokens de la respuesta de Claude, si n8n
      los expone) para poder fijar precios con margen real, no estimado.

## Ejecución asíncrona

Justificación completa en `01-arquitectura.md` ("Por qué síncrono en V1"). Cuando
se dispare cualquiera de esas condiciones:

- [ ] `FlowExecutor` pasa a despachar un Job en cola (ya hay Redis + worker de queue
      en `docker-compose-local.yml`) en vez de esperar la respuesta inline.
- [ ] El workflow n8n pasa a notificar a un endpoint de callback
      (`POST /api/workflow-runs/{id}/callback`) en vez de responder directo al
      webhook original — o se mantiene el webhook síncrono pero el Job de Laravel
      es quien lo invoca (más simple, no requiere tocar n8n).
- [ ] Notificar al frontend cuando el resultado está listo: Laravel Reverb
      (broadcasting) si la UI es Livewire/Inertia, o polling simple como fallback.

## Observabilidad

- [ ] Dashboard interno (aunque sea una vista Livewire simple) sobre `WorkflowRun`:
      tasa de éxito por flujo, duración promedio, errores más comunes.
- [ ] Alertar si `reels-motion-designer` (o cualquier agente) empieza a fallar
      sistemáticamente (posible cambio de contrato en n8n, credencial vencida, etc.).

## Seguridad

- [ ] Secreto compartido entre Laravel y los webhooks de n8n (pendiente ya anotado
      en `02-integracion-n8n.md`) — para este punto es no-negociable, no opcional.
- [ ] Rate limiting por cuenta en la API de mensajes (evitar abuso de la cuota de
      Claude por un solo usuario).

## Estado

⚪ **Pendiente** — no arranca hasta validar el MVP multi-agente con uso real.
