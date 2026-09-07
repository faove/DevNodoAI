<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_client_and_is_redirected_to_chat(): void
    {
        $user = User::factory()->create();

        $response = $this->withoutMiddleware(PreventRequestForgery::class)
            ->actingAs($user)
            ->post('/clients', [
                'name' => 'DevNodo Studio',
                'tono' => 'cercano',
                'oferta' => 'Auditoría mensual',
                'etapa_funnel' => 'consideracion',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('clients', [
            'user_id' => $user->id,
            'name' => 'DevNodo Studio',
        ]);
    }
}
