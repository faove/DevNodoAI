# Integración con n8n

## Principio

Laravel nunca hardcodea URLs de n8n dispersas en el código. Todo agente disponible
se registra en un único lugar (`config/flows.php`), y todo el código que llama a n8n
pasa por un único cliente HTTP (`App\Services\N8n\N8nClient`).

## Configuración

`.env`:

```
N8N_BASE_URL=https://n8n.devnodo.com
N8N_HTTP_TIMEOUT=120
```

`config/flows.php` (registro de agentes disponibles — la única fuente de verdad de
"qué agentes existen"):

```php
return [
    'reels-motion-designer' => [
        'label' => 'Reel para Instagram/TikTok/Reels',
        'webhook_path' => 'webhook/reels-motion-designer',
        'trigger_examples' => [
            'Créame un reel para Instagram',
            'Necesito un reel para el lanzamiento de...',
        ],
    ],

    // Se agregan acá a medida que n8n-devnodo los construya y valide:
    // 'youtube-script-write' => [...],
    // 'youtube-title-generator' => [...],
    // 'youtube-thumbnail-prompter' => [...],
];
```

Agregar un agente nuevo = 1) construirlo y validarlo en `n8n-devnodo` (ver ese repo),
2) agregar su entrada acá. No requiere tocar `FlowRouter` ni `FlowExecutor`.

## `N8nClient`

Responsabilidad única: hacer el POST al webhook correcto con el payload dado, y
devolver la respuesta cruda (o lanzar una excepción tipada si n8n no respondió con
`ok:true`/`ok:false` parseable). No sabe nada de `Client`, `Conversation` ni de
brand kits — eso lo arma la capa de arriba (`FlowExecutor`).

```php
final class N8nClient
{
    public function call(string $webhookPath, array $payload): N8nResponse
    {
        $response = Http::baseUrl(config('services.n8n.base_url'))
            ->timeout(config('services.n8n.timeout'))
            ->post($webhookPath, $payload);

        // n8n devuelve 200 incluso en error de negocio (ok:false) — igual que
        // el contrato ya documentado en n8n-devnodo. Un fallo de transporte
        // (timeout, 5xx, conexión) sí debe distinguirse de un ok:false legítimo.
        // ...
    }
}
```

## `FlowExecutor`

Traduce un `Client` (modelo Laravel) + un brief al contrato de entrada exacto que
espera el workflow n8n:

```json
{
  "brief": "...",
  "cliente": { "nombre": "...", "slug": "..." },
  "marca": {
    "tono": "...",
    "visual": { "paleta": [], "tipografia": "...", "estilo": "..." },
    "claims_aprobados": []
  },
  "estrategia": { "pilares_contenido": [], "oferta": "...", "etapa_funnel": "..." }
}
```

Esto es 1:1 con el contrato ya fijado en
`n8n-devnodo/docs/01-reels-motion-designer.md`. Los agentes futuros
(`youtube-script-write`, etc.) deberán mantener el mismo shape de `cliente` /
`marca` / `estrategia` — es el contrato común entre *todos* los agentes según el
plan de `n8n-devnodo` (`docs/00-plan-general.md`, sección "Convenciones comunes").
Si un agente futuro necesita un campo adicional, se agrega como opcional dentro de
`marca` o `estrategia`, nunca rompiendo el contrato existente.

## `FlowRouter`

Interfaz mínima, para no atarnos a la implementación ingenua de V1:

```php
interface FlowRouter
{
    public function route(Conversation $conversation, string $userMessage): FlowDecision;
}
```

- **V1 (`StaticFlowRouter`)**: devuelve siempre `reels-motion-designer` (único
  registrado). Cero lógica de clasificación.
- **V2 (`ClaudeFlowRouter`)**, cuando haya ≥2 agentes: llama a Claude (modelo barato,
  ej. Haiku) con una tool forzada `route_to_flow` cuyo `enum` de flujos válidos se
  genera dinámicamente desde `config('flows')`. Si Claude no encuentra un flujo
  aplicable, `FlowDecision` trae `flow_slug: null` y un mensaje aclaratorio para
  devolver al usuario en vez de forzar un agente incorrecto.

Cambiar de V1 a V2 es un bind distinto en el service container
(`FlowRouter::class => ClaudeFlowRouter::class`), no un cambio en los controllers.

## Manejo de errores — contrato

| Situación | Qué hace Laravel |
|---|---|
| n8n responde `ok:true` | Guarda `WorkflowRun` en `success`, crea `Message` assistant con el contenido. |
| n8n responde `ok:false` (Claude no devolvió tool_use, o error de Anthropic) | Guarda `WorkflowRun` en `failed` con el `error` de n8n, `Message` assistant con `content: null` y ese error. |
| Timeout / n8n no responde / 5xx de n8n | Guarda `WorkflowRun` en `failed` con error de transporte. El usuario ve un mensaje genérico ("no pudimos generar tu reel, intentá de nuevo"), nunca un 500 crudo. |
| Faltan datos de marca críticos | Esto ya lo resuelve el propio workflow n8n (`pendientes[]`) — Laravel solo lo muestra, no lo valida de nuevo. |

## Pendientes para probar esto en Fase 1

- [ ] Confirmar si `n8n.devnodo.com` requiere autenticación adicional a nivel de
      webhook (hoy no la tiene — cualquiera que conozca la URL puede invocarlo). Antes
      de exponerlo detrás de un SaaS con usuarios reales, evaluar agregar un header
      secreto compartido (`X-Internal-Token`) validado en el primer nodo del workflow,
      para que solo este backend pueda invocarlo.
  