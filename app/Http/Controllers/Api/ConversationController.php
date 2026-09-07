<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function store(StoreConversationRequest $request): JsonResponse
    {
        $conversation = Conversation::query()->create([
            'client_id' => $request->integer('client_id'),
            'user_id' => $request->user()->id,
            'title' => $request->string('title')->toString() ?: null,
        ]);

        $conversation->load(['client', 'messages']);

        return (new ConversationResource($conversation))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Conversation $conversation): ConversationResource
    {
        abort_unless($conversation->user_id === $request->user()->id, 403);

        $conversation->load(['client', 'messages' => fn ($query) => $query->orderBy('id')]);

        return new ConversationResource($conversation);
    }
}
