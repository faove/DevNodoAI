<?php

namespace App\Services\Flows;

use App\Models\Conversation;

final class StaticFlowRouter implements FlowRouter
{
    public function route(Conversation $conversation, string $userMessage): FlowDecision
    {
        return new FlowDecision(flowSlug: 'reels-motion-designer');
    }
}
