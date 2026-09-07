<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', 'alpha_dash', Rule::unique('clients', 'slug')],
            'tono' => ['nullable', 'string', 'max:255'],
            'voz' => ['nullable', 'string', 'max:255'],
            'visual_paleta' => ['nullable', 'array'],
            'visual_paleta.*' => ['string', 'max:40'],
            'visual_tipografia' => ['nullable', 'string', 'max:120'],
            'visual_estilo' => ['nullable', 'string', 'max:255'],
            'claims_aprobados' => ['nullable', 'array'],
            'claims_aprobados.*' => ['string', 'max:255'],
            'pilares_contenido' => ['nullable', 'array'],
            'pilares_contenido.*' => ['string', 'max:255'],
            'oferta' => ['nullable', 'string', 'max:2000'],
            'etapa_funnel' => ['nullable', 'string', 'max:120'],
        ];
    }
}
