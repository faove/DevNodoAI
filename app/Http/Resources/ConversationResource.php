<?php

namespace App\Http\Resources;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Conversation
 */
class ConversationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_id' => $this->client_id,
            'title' => $this->title,
            'created_at' => $this->created_at?->toIso8601String(),
            'messages' => MessageResource::collection($this->whenLoaded('messages')),
            'client' => new ClientResource($this->whenLoaded('client')),
        ];
    }
}
