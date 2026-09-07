<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    protected $model = Client::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'user_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('###'),
            'tono' => 'cercano y profesional',
            'voz' => 'tú',
            'visual_paleta' => ['#0F172A', '#38BDF8', '#F8FAFC'],
            'visual_tipografia' => 'Inter',
            'visual_estilo' => 'minimalista',
            'claims_aprobados' => ['Resultados medibles en 30 días'],
            'pilares_contenido' => ['educación', 'prueba social'],
            'oferta' => 'Auditoría de marketing digital',
            'etapa_funnel' => 'consideracion',
        ];
    }
}
