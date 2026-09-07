<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(): Response
    {
        $clients = Client::query()
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Clients/Create');
    }

    public function store(StoreClientRequest $request): RedirectResponse
    {
        $name = $request->string('name')->toString();
        $slug = $request->string('slug')->toString();

        if ($slug === '') {
            $slug = Str::slug($name);
        }

        $baseSlug = $slug !== '' ? $slug : 'cliente';
        $uniqueSlug = $baseSlug;
        $suffix = 1;

        while (Client::query()->where('slug', $uniqueSlug)->exists()) {
            $uniqueSlug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        $client = Client::query()->create([
            ...$request->safe()->except(['slug']),
            'user_id' => $request->user()->id,
            'slug' => $uniqueSlug,
        ]);

        return redirect()
            ->route('chat.show', ['client' => $client->id])
            ->with('success', 'Marca creada.');
    }
}
