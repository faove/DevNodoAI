<?php

namespace App\Models;

use Database\Factories\ClientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    /** @use HasFactory<ClientFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'tono',
        'voz',
        'visual_paleta',
        'visual_tipografia',
        'visual_estilo',
        'claims_aprobados',
        'pilares_contenido',
        'oferta',
        'etapa_funnel',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'visual_paleta' => 'array',
            'claims_aprobados' => 'array',
            'pilares_contenido' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Conversation, $this>
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }
}
