<?php

namespace App\Services\N8n;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Throwable;

final class N8nClient
{
    public function call(string $webhookPath, array $payload): N8nResponse
    {
        try {
            $response = Http::baseUrl((string) config('services.n8n.base_url'))
                ->timeout((int) config('services.n8n.timeout', 120))
                ->acceptJson()
                ->asJson()
                ->post($webhookPath, $payload);

            if ($response->serverError()) {
                return new N8nResponse(
                    ok: false,
                    payload: null,
                    error: 'El servicio de automatización no está disponible ahora. Intentá de nuevo.',
                    transportFailed: true,
                );
            }

            /** @var array<string, mixed>|null $body */
            $body = $response->json();

            if (! is_array($body) || ! array_key_exists('ok', $body)) {
                return new N8nResponse(
                    ok: false,
                    payload: is_array($body) ? $body : null,
                    error: 'La automatización devolvió una respuesta inválida.',
                    transportFailed: true,
                );
            }

            if ($body['ok'] === true) {
                return new N8nResponse(ok: true, payload: $body);
            }

            $error = is_string($body['error'] ?? null)
                ? $body['error']
                : 'No pudimos generar el resultado. Intentá de nuevo.';

            return new N8nResponse(ok: false, payload: $body, error: $error);
        } catch (ConnectionException|RequestException) {
            return new N8nResponse(
                ok: false,
                payload: null,
                error: 'No pudimos contactar la automatización. Intentá de nuevo.',
                transportFailed: true,
            );
        } catch (Throwable) {
            return new N8nResponse(
                ok: false,
                payload: null,
                error: 'Ocurrió un error inesperado al generar la respuesta.',
                transportFailed: true,
            );
        }
    }
}
