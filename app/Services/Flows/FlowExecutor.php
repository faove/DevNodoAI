<?php

namespace App\Services\Flows;

use App\Enums\WorkflowRunStatus;
use App\Models\Client;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\WorkflowRun;
use App\Services\N8n\N8nClient;
use InvalidArgumentException;
use RuntimeException;

final class FlowExecutor
{
    public function __construct(private N8nClient $n8nClient) {}

    public function execute(Conversation $conversation, Message $userMessage, string $flowSlug): Message
    {
        $flow = config("flows.{$flowSlug}");

        if (! is_array($flow) || ! isset($flow['webhook_path'])) {
            throw new InvalidArgumentException("Unknown flow [{$flowSlug}].");
        }

        $conversation->loadMissing('client');
        $client = $conversation->client;

        if (! $client instanceof Client) {
            throw new RuntimeException('Conversation is missing a client.');
        }

        $payload = $this->buildPayload($client, (string) ($userMessage->content['text'] ?? ''));

        $assistantMessage = $conversation->messages()->create([
            'role' => 'assistant',
            'content' => null,
            'flow_slug' => $flowSlug,
            'error' => null,
        ]);

        $run = WorkflowRun::query()->create([
            'message_id' => $assistantMessage->id,
            'flow_slug' => $flowSlug,
            'status' => WorkflowRunStatus::Running,
            'request_payload' => $payload,
        ]);

        $startedAt = hrtime(true);
        $response = $this->n8nClient->call((string) $flow['webhook_path'], $payload);
        $durationMs = (int) ((hrtime(true) - $startedAt) / 1_000_000);

        if ($response->isSuccessful()) {
            $run->update([
                'status' => WorkflowRunStatus::Success,
                'response_payload' => $response->payload,
                'duration_ms' => $durationMs,
            ]);

            $assistantMessage->update([
                'content' => [
                    'guion_markdown' => $response->payload['guion_markdown'] ?? '',
                    'escenas' => $response->payload['escenas'] ?? [],
                    'pendientes' => $response->payload['pendientes'] ?? [],
                    'fuentes' => $response->payload['fuentes'] ?? [],
                ],
                'error' => null,
            ]);

            return $assistantMessage->fresh();
        }

        $error = $response->error ?? 'No pudimos generar tu reel, intentá de nuevo.';

        $run->update([
            'status' => WorkflowRunStatus::Failed,
            'response_payload' => $response->payload,
            'error' => $error,
            'duration_ms' => $durationMs,
        ]);

        $assistantMessage->update([
            'content' => null,
            'error' => $error,
        ]);

        return $assistantMessage->fresh();
    }

    /**
     * @return array<string, mixed>
     */
    public function buildPayload(Client $client, string $brief): array
    {
        return [
            'brief' => $brief,
            'cliente' => [
                'nombre' => $client->name,
                'slug' => $client->slug,
            ],
            'marca' => [
                'tono' => $client->tono,
                'voz' => $client->voz,
                'visual' => [
                    'paleta' => $client->visual_paleta ?? [],
                    'tipografia' => $client->visual_tipografia,
                    'estilo' => $client->visual_estilo,
                ],
                'claims_aprobados' => $client->claims_aprobados ?? [],
            ],
            'estrategia' => [
                'pilares_contenido' => $client->pilares_contenido ?? [],
                'oferta' => $client->oferta,
                'etapa_funnel' => $client->etapa_funnel,
            ],
        ];
    }
}
