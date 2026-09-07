<?php

namespace App\Services\Flows;

final class FlowDecision
{
    public function __construct(
        public readonly ?string $flowSlug,
        public readonly ?string $clarification = null,
    ) {}

    public function hasFlow(): bool
    {
        return $this->flowSlug !== null;
    }
}
