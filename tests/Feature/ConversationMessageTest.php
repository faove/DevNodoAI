<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ConversationMessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_send_message_and_receive_assistant_reply(): void
    {
        Http::fake([
            'https://n8n.devnodo.com/*' => Http::response([
                'ok' => true,
                'guion_markdown' => '# Reel de prueba',
                'escenas' => [
                    [
                        'numero' => 1,
                        'titulo' => 'Hook',
                        'html' => '<!doctype html><html><body>Hola</body></html>',
                    ],
                ],
                'pendientes' => [],
                'fuentes' => ['marca.tono'],
            ], 200),
        ]);

        $user = User::factory()->create();
        $client = Client::factory()->create(['user_id' => $user->id]);
        $conversation = Conversation::factory()->create([
            'user_id' => $user->id,
            'client_id' => $client->id,
            'title' => null,
        ]);

        $response = $this->actingAs($user)->postJson(
            "/api/conversations/{$conversation->id}/messages",
            ['content' => 'Créame un reel para Instagram'],
        );

        $response->assertOk()
            ->assertJsonPath('message.role', 'assistant')
            ->assertJsonPath('message.flow_slug', 'reels-motion-designer')
            ->assertJsonPath('message.content.guion_markdown', '# Reel de prueba');

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'role' => 'user',
        ]);

        $this->assertDatabaseHas('workflow_runs', [
            'flow_slug' => 'reels-motion-designer',
            'status' => 'success',
        ]);
    }

    public function test_n8n_transport_failure_returns_friendly_assistant_error(): void
    {
        Http::fake([
            'https://n8n.devnodo.com/*' => Http::response('down', 503),
        ]);

        $user = User::factory()->create();
        $client = Client::factory()->create(['user_id' => $user->id]);
        $conversation = Conversation::factory()->create([
            'user_id' => $user->id,
            'client_id' => $client->id,
        ]);

        $response = $this->actingAs($user)->postJson(
            "/api/conversations/{$conversation->id}/messages",
            ['content' => 'Créame un reel para Instagram'],
        );

        $response->assertOk()
            ->assertJsonPath('message.role', 'assistant')
            ->assertJsonPath('message.content', null);

        $this->assertNotNull($response->json('message.error'));
        $this->assertDatabaseHas('workflow_runs', [
            'status' => 'failed',
        ]);
    }
}
