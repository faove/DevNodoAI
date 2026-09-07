<?php

namespace App\Services\Flows;

use App\Models\Conversation;

interface FlowRouter
{
    public function route(Conversation $conversation, string $userMessage): FlowDecision;
}
