# Fase 2 — Multi-agente

Objetivo: pasar de "un flujo hardcodeado" a un sistema que realmente elige entre
varios agentes según lo que pida el usuario. No arranca hasta que la Fase 1 esté
funcionando end-to-end con `reels-motion-designer`.

## En `n8n-devnodo` (repo separado, prerequisito)

Según `n8n-devnodo/docs/00-plan-general.md`, faltan 3 agentes por construir con el
mismo patrón que `reels-motion-designer` (webhook → normalizar input → prompt con
tool-use forzado → llamada a Claude → extraer resultado → responder):

- [ ] `youtube-script-write` (origen: `.claude/agents/youtube-script-write.md` en
      OtroGalloMarketing).
- [ ] `youtube-title-generator` (origen: `.claude/agents/youtube-title-generator.md`).
- [ ] `youtube-thumbnail-prompter` (origen:
      `.claude/agents/youtube-thumbnail-prompter.md` — nota: el prompt de imagen va
      en inglés por requisito técnico de las herramientas de generación de imagen,
      ya documentado en ese repo).

Cada uno se valida igual que se validó `reels-motion-designer` (POST directo al
webhook con un payload de ejemplo, confirmar `ok:true` con contenido real de Claude)
antes de registrarlo en este backend.

## En este backend (`DevNodoAI`)

- [ ] Agregar cada agente nuevo a `config/flows.php` a medida que se valida en n8n
      (label, webhook_path, trigger_examples — estos últimos son insumo directo
      para el prompt del router).
- [ ] Implementar `ClaudeFlowRouter` (reemplaza `StaticFlowRouter`): tool-use forzado
      `route_to_flow` con un `enum` generado dinámicamente desde
      `array_keys(config('flows'))`, usando un modelo económico (Haiku). Bind en el
      service container.
- [ ] Definir qué pasa cuando ningún flujo aplica: `FlowDecision` con `flow_slug:
      null` + mensaje aclaratorio devuelto como `Message` de rol `assistant` sin
      crear `WorkflowRun` (no se llama a n8n si no hay a quién enrutar).
- [ ] Ajustar la UI para mostrar de forma diferenciada una respuesta de agente
      (guion + escenas, o título/thumbnail prompt) vs. un mensaje aclaratorio del
      router.
- [ ] Métricas mínimas: cuántas veces el router elige cada flujo, cuántas veces no
      encuentra ninguno — esto informa si faltan agentes o si el router necesita
      mejor prompt.

## Riesgo a vigilar

El `FlowRouter` con IA puede clasificar mal. Antes de confiar ciegamente en su
salida, loguear siempre `WorkflowRun`-like (o una tabla `RouterDecision` separada)
con el mensaje original + flujo elegido, para poder auditar mal-clasificaciones
reales una vez haya usuarios de verdad.

## Estado

⚪ **Pendiente** — depende de Fase 1 completa + al menos 1 agente adicional validado
en `n8n-devnodo`.
