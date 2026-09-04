# Fase 1 — MVP conversacional (un solo flujo: reels)

Objetivo: un usuario se loguea, elige/crea un `Client` (marca), escribe
*"Créame un reel para Instagram"* en un chat, y recibe el guion + storyboard
generado por `reels-motion-designer` a través de este backend. Todo lo demás
(billing, multi-agente real, async) queda para fases posteriores.

## Frontend — hecho (2026-09-04)

- [x] Framework de frontend decidido: **Inertia + React** (ver `00-plan-general.md`,
      decisión 6).
- [x] Instalado vía `laravel/breeze` preset `react` (TypeScript, dark mode,
      ESLint/Prettier) — trae auth scaffolding completo (login, registro, reset de
      contraseña, verificación de email, perfil) en `resources/js/Pages/`.
- [x] Bugs de scaffolding encontrados y corregidos durante la instalación:
  - `resources/js/app.tsx` importaba `./bootstrap`, un archivo que el propio
    paquete `laravel/breeze` v2.4.2 no incluye para este stack — import colgante
    eliminado (nada más en el código depende de axios/`window.axios`).
  - `vite.config.js` no fijaba `server.origin` — con el contenedor bindeando
    `0.0.0.0`, las URLs de assets inyectadas en el HTML apuntaban a
    `http://0.0.0.0:5173/...` (no confiable desde el navegador del host). Se fijó
    `server.origin: 'http://localhost:5173'`.
  - `@vitejs/plugin-react` (`^4.2.0` que trae Breeze) no soporta `vite@^8` (ya
    fijado en este repo desde antes de Breeze) — se subió a `^6.1.1`.
  - `@types/node@^18` no satisface el peer de `vite@8` (`^20.19 || >=22.12`) — se
    subió a `^22.12.0`.
  - `@laravel/multiplex` (optionalDependency del scaffold en blanco original, solo
    mejora cosmética de `php artisan dev`) exigía React 19, chocando con el stack
    React 18 de Breeze — se quitó (`php artisan dev` cae a `concurrently` sin él).
  - `@tailwindcss/vite@^4` quedó como dependencia sin uso (Breeze usa Tailwind 3
    clásico vía `postcss.config.js` + `tailwind.config.js`, no el plugin v4) — se
    quitó.
  - `.env`: `APP_URL` apuntaba a `http://localhost:8000` (default de
    `php artisan serve`) en vez de `http://localhost:8080` (puerto real de nginx en
    `docker-compose-local.yml`) — corregido.
- [x] Validado end-to-end vía HTTP (sin navegador disponible en este entorno):
      `GET /register` sirve el HTML de Inertia con el script de React apuntando a
      `localhost:5173`; `POST /register` con headers `X-XSRF-TOKEN`/`X-Inertia`
      crea el usuario y redirige a `/dashboard`; `GET /dashboard` autenticado
      devuelve el `data-page` de Inertia con el usuario correcto. **Pendiente**:
      confirmar visualmente en un navegador real que la UI se ve/interactúa bien
      (esta sesión no tuvo la extensión de Chrome conectada).

## Auth y base

- [x] Auth instalada (Breeze: login/registro/reset/verify/perfil).
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
