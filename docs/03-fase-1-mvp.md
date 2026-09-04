# Fase 1 — MVP conversacional (un solo flujo: reels)

Objetivo: un usuario se loguea, elige/crea un `Client` (marca), escribe
*"Créame un reel para Instagram"* en un chat, y recibe el guion + storyboard
generado por `reels-motion-designer` a través de este backend. Todo lo demás
(billing, multi-agente real, async) queda para fases posteriores.

## Decisión pendiente de confirmar antes de arrancar

- [ ] Framework de frontend para el chat (recomendado: Livewire + Alpine — ver
      `00-plan-general.md`, decisión 6). Bloquea las tareas de UI, no las de backend.

## Auth y base

- [ ] Instalar Laravel Fortify o Breeze (auth mínima: login/registro).
- [ ] Migración + modelo `Client` (marca): `nombre`, `slug`, `user_id` (dueño),
      `tono`, `voz`, `visual_paleta` (json), `visual_tipografia`, `visual_estilo`,
      `claims_aprobados` (json), `pilares_contenido` (json), `oferta`,
      `etapa_funnel`.
- [ ] CRUD simple de `Client` (crear/editar marca) — sin esto no hay contexto que
      mandarle al agente.

## Conversación

- [ ] Migración + modelo `Conversation` (`client_id`, `user_id`, `title` opcional).
- [ ] Migración + modelo `Message` (`conversation_id`, `role`, `content` json,
      `flow_slug` nullable, `error` nullable).
- [ ] Migración + modelo `WorkflowRun` (`message_id`, `flow_slug`, `status`,
      `request_payload` json, `response_payload` json, `error`, `duration_ms`).

## Integración n8n

- [ ] `config/flows.php` con la entrada de `reels-motion-designer` (ver
      `02-integracion-n8n.md`).
- [ ] `N8nClient` (servicio HTTP con timeout configurable y distinción entre error
      de transporte vs. `ok:false` de negocio).
- [ ] `FlowExecutor` que arma el payload `{ brief, cliente, marca, estrategia }` a
      partir de `Client` + el mensaje del usuario.
- [ ] `FlowRouter` V1 (`StaticFlowRouter`) — siempre resuelve a
      `reels-motion-designer`.
- [ ] Confirmar con el equipo si el webhook de n8n necesita un secreto compartido
      antes de exponerlo a usuarios reales (ver pendiente en
      `02-integracion-n8n.md`).

## API

- [ ] `POST /api/conversations` (requiere `client_id`).
- [ ] `POST /api/conversations/{id}/messages` — guarda el mensaje del usuario,
      ejecuta el flujo síncronamente, guarda y devuelve la respuesta del asistente.
- [ ] `GET /api/conversations/{id}` — historial completo.
- [ ] Manejo de errores según la tabla de `02-integracion-n8n.md` (nunca un 500
      crudo hacia el frontend).

## Frontend (una vez confirmado el stack)

- [ ] Vista de chat: input de mensaje + lista de mensajes (usuario/asistente).
- [ ] Selector de `Client` activo para la conversación.
- [ ] Render de `guion_markdown` (Markdown → HTML).
- [ ] Render de cada escena de `escenas[]` en un `<iframe sandbox>` (9:16) — el HTML
      que devuelve Claude es autocontenido, no requiere assets externos.
- [ ] Estado de "generando..." mientras se espera la respuesta síncrona (recordar:
      puede tardar 20-30s).
- [ ] Mostrar `pendientes[]` de forma visible (son datos de marca que el usuario
      debería completar en su `Client` para la próxima vez).

## Validación end-to-end

- [ ] Probar el flujo completo local: login → crear `Client` → nueva conversación →
      "Créame un reel para Instagram" → ver guion + escenas renderizadas.
- [ ] Probar el caso de error (ej. apagar temporalmente el acceso a n8n) y confirmar
      que el usuario ve un mensaje razonable, no una pantalla rota.

## Estado

⚪ **Pendiente** — no iniciado. Bloqueada únicamente por la decisión de frontend de
arriba; todo el trabajo de backend puede arrancar en paralelo.
