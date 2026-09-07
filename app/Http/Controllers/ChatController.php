<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->renderChat($request, null);
    }

    public function show(Request $request, Client $client): Response
    {
        abort_unless($client->user_id === $request->user()->id, 403);

        return $this->renderChat($request, $client);
    }

    private function renderChat(Request $request, ?Client $activeClient): Response
    {
        $clients = Client::query()
            ->where('user_id', $request->user()->id)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        $client = $activeClient ?? $clients->first();

        $conversation = null;

        if ($client !== null) {
            $conversation = Conversation::query()
                ->where('user_id', $request->user()->id)
                ->where('client_id', $client->id)
                ->with(['messages' => fn ($query) => $query->orderBy('id')])
                ->latest()
                ->first();

            if ($conversation === null) {
                $conversation = Conversation::query()->create([
                    'user_id' => $request->user()->id,
                    'client_id' => $client->id,
                    'title' => null,
                ]);
                $conversation->setRelation('messages', collect());
            }
        }

        return Inertia::render('Chat/Index', [
            'clients' => $clients,
            'activeClientId' => $client?->id,
            'conversation' => $conversation,
            'triggerExamples' => config('flows.reels-motion-designer.trigger_examples', []),
        ]);
    }
}
