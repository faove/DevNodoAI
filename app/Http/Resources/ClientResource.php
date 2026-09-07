<?php

namespace App\Http\Resources;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Client
 */
class ClientResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'tono' => $this->tono,
            'voz' => $this->voz,
            'visual_paleta' => $this->visual_paleta,
            'visual_tipografia' => $this->visual_tipografia,
            'visual_estilo' => $this->visual_estilo,
            'claims_aprobados' => $this->claims_aprobados,
            'pilares_contenido' => $this->pilares_contenido,
            'oferta' => $this->oferta,
            'etapa_funnel' => $this->etapa_funnel,
        ];
    }
}
