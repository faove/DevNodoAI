# Plan general — ai.devnodo.com

## Qué es este proyecto

`DevNodoAI` es el backend Laravel de **ai.devnodo.com**: un SaaS conversacional
(tipo ChatGPT) enfocado exclusivamente en **marketing digital**. El usuario escribe
un pedido en lenguaje natural — ej. *"Créame un reel para Instagram"* — y el sistema:

1. Recibe el mensaje en el backend (este repo).
2. Decide **qué agente/flujo** debe resolverlo.
3. Ejecuta ese flujo (los agentes viven como workflows de **n8n**, ver
   [`n8n-devnodo`](#relación-con-el-repo-n8n-devnodo)).
4. Persiste la conversación y el resultado, y se lo devuelve al usuario listo para
   revisión humana (guion, storyboard, copy, etc.).

No genera vídeo renderizado ni publica nada por sí solo — es una mesa de trabajo con
IA para producir insumos de marketing, no un publicador automático.

## Relación con el repo `n8n-devnodo`

Los **agentes son workflows de n8n**, desplegados en `n8n.devnodo.com`, cada uno
expuesto como `POST /webhook/<slug>`. Ese repo (`/srv/projects/n8n-devnodo` en
`devnodo-server`) ya tiene:

- Un plan propio (`docs/00-plan-general.md`) que convierte cada subagente de
  `.claude/agents/` del proyecto `OtroGalloMarketing` en un workflow n8n autónomo,
  genérico y multi-cliente (contexto de marca siempre viaja en el payload, nunca
  filesystem compartido).
- **Un solo workflow terminado y validado hoy**: `reels-motion-designer`
  (`workflows/agentes-content-engine/reels-motion-designer.json`). Probado en
  producción (`https://n8n.devnodo.com/webhook/reels-motion-designer`) contra la API
  real de Claude — responde `ok:true` con guion en Markdown + escenas en HTML 9:16
  animado.
- **3 agentes pendientes de construir** en n8n (mismo patrón): `youtube-script-write`,
  `youtube-title-generator`, `youtube-thumbnail-prompter`.

Importante — diferencia de diseño respecto al plan de `n8n-devnodo`: ese repo dejaba
para "fase futura" un *orquestador dentro de n8n* que decidiera a qué workflow llamar.
**Ese rol lo cumple este backend Laravel, no n8n.** n8n solo ejecuta agentes; decidir
cuál ejecutar, con qué contexto, y qué hacer con el resultado es responsabilidad del
SaaS. Motivo: el backend es quien tiene usuarios, clientes, historial de conversación,
brand kits y billing — n8n no debe cargar con ese estado.

## Arquitectura en una frase

```
Frontend (chat) → Laravel (decide flujo + arma contexto de marca) → n8n (ejecuta agente vía Claude) → Laravel (persiste + normaliza) → Frontend
```

Ver detalle técnico en [`01-arquitectura.md`](01-arquitectura.md) y el contrato de
integración con n8n en [`02-integracion-n8n.md`](02-integracion-n8n.md).

## Decisiones de arquitectura (tomadas en esta sesión, 2026-09-04)

1. **El backend enruta, n8n ejecuta.** Un `FlowRouter` en Laravel decide qué agente
   corresponde al mensaje del usuario. n8n no tiene lógica de negocio ni sabe qué es
   un "cliente" o un "plan de suscripción".
2. **Un flujo = un webhook n8n + un registro en Laravel.** Cada agente se registra en
   `config/flows.php` (slug, descripción, path del webhook, ejemplos de disparo).
   Añadir un agente nuevo = crear el workflow en n8n + una entrada de config, sin
   tocar el router.
3. **V1 = llamada síncrona.** El request HTTP de Laravel a n8n espera la respuesta
   (timeout generoso, ~90s). Es más simple y ya validamos que
   `reels-motion-designer` responde en ese orden de tiempo. Se deja documentada la
   evolución a ejecución asíncrona (cola + callback) para cuando haya flujos más
   lentos o se quiera evitar bloquear el request web — ver Fase 3.
4. **Enrutamiento V1 = trivial (un solo flujo).** Con un único agente disponible, el
   `FlowRouter` resuelve siempre a `reels-motion-designer` sin necesidad de clasificar
   con IA. Se define igual la interfaz `FlowRouter` para que, al agregar el segundo
   agente, se reemplace la implementación por clasificación real (Claude Haiku +
   tool-use forzado eligiendo entre los slugs registrados) sin tocar el resto del
   sistema.
5. **Modelo de dominio: agencia → clientes → conversaciones.** Igual que el contrato
   ya definido en `n8n-devnodo`, cada conversación ocurre en el contexto de un
   `Client` (marca) con su brand kit (tono, paleta, tipografía, claims aprobados) y
   estrategia (pilares de contenido, oferta vigente, etapa de funnel). Un `User` del
   SaaS puede gestionar varios `Client`. Esto encaja con el caso de uso real
   (agencias/freelancers de marketing gestionando múltiples marcas), no solo
   "una empresa, una cuenta".
6. **Frontend: por definir el framework, no el contrato.** El contrato del backend es
   una API JSON (`POST /api/conversations/{id}/messages`) independiente de qué
   consuma esa API. Recomendación para V1: **Livewire + Alpine** (ya viene con
   Tailwind/Vite en este repo, un solo stack, entrega rápida para un solo dev). Si
   más adelante se necesita una UI más "app" (animaciones de escritura, actualizaciones
   en tiempo real vía broadcasting), se evalúa migrar a Inertia + React/Vue sin romper
   el contrato de API. **Pendiente de confirmar antes de empezar Fase 1.**

## Estado actual (línea base, 2026-09-04)

- Repo Laravel: esqueleto por defecto (`laravel/framework ^13.17`), sin modelos de
  dominio, sin frontend framework elegido, sin auth instalada todavía.
- Docker local (`docker-compose-local.yml`): funcionando — app, nginx, vite, queue,
  scheduler, mysql, redis, mailpit. Ver nota de infraestructura abajo.
- n8n: 1 agente (`reels-motion-designer`) validado en producción. 3 agentes
  pendientes de construir en `n8n-devnodo`.
- Docs: esta carpeta, recién creada.

### Nota de infraestructura (para no perderla)

El host `devnodo-server` corre muchos proyectos Docker simultáneos (otras apps del
mismo dueño). Puertos por defecto pueden chocar entre stacks locales (ej. Redis
6379 ya usado por otro proyecto → este stack usa `REDIS_PORT_HOST=6380` como
override). El `docker-compose-local.yml` de este repo necesitó un alias de red
(`devnodoai-app`) en el servicio `app` porque `docker/nginx/default.conf` está
compartido con el compose de producción y apunta a ese `container_name` fijo.

## Roadmap por fases

| Fase | Objetivo | Estado |
|---|---|---|
| 0 | Fundación: Laravel base + Docker local + 1er agente n8n validado | 🟢 hecho |
| 1 | MVP conversacional de un solo flujo (reels) end-to-end | ⚪ pendiente — ver [`03-fase-1-mvp.md`](03-fase-1-mvp.md) |
| 2 | Multi-agente: sumar los 3 agentes restantes + router real con IA | ⚪ pendiente — ver [`04-fase-2-multiagente.md`](04-fase-2-multiagente.md) |
| 3 | Productización: multi-tenancy real, billing, ejecución async, observabilidad | ⚪ pendiente — ver [`05-fase-3-productizacion.md`](05-fase-3-productizacion.md) |

Leyenda: ⚪ pendiente · 🟡 en curso · 🟢 hecho

## Cómo seguir el avance

Cada fase tiene su propio archivo con checklist de tareas. Marcar cada tarea como
hecha (`[x]`) a medida que se completa, y actualizar la tabla de arriba cuando una
fase completa cambia de estado. Esto es lo que permite retomar el trabajo en una
sesión nueva sin releer todo el hilo de chat.
