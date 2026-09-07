<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Services\Flows\FlowExecutor;
use App\Services\Flows\FlowRouter;
use Illuminate\Http\JsonResponse;

class MessageController extends Controller
{
    public function store(
        StoreMessageRequest $request,
        Conversation $conversation,
        FlowRouter $flowRouter,
        FlowExecutor $flowExecutor,
    ): JsonResponse {
        abort_unless($conversation->user_id === $request->user()->id, 403);

        $text = $request->string('content')->toString();

        $userMessage = $conversation->messages()->create([
            'role' => 'user',
            'content' => ['text' => $text],
        ]);

        if ($conversation->title === null) {
            $conversation->update([
                'title' => mb_substr($text, 0, 80),
            ]);
        }

        $decision = $flowRouter->route($conversation, $text);

        if (! $decision->hasFlow()) {
            $assistantMessage = $conversation->messages()->create([
                'role' => 'assistant',
                'content' => ['text' => $decision->clarification ?? 'No encontré un flujo para ese pedido.'],
                'error' => null,
            ]);

            return response()->json([
                'message' => new MessageResource($assistantMessage),
            ]);
        }

        $assistantMessage = $flowExecutor->execute(
            $conversation,
            $userMessage,
            (string) $decision->flowSlug,
        );

        return response()->json([
            'message' => new MessageResource($assistantMessage),
        ]);
    }
}
