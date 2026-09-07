<?php

namespace App\Services\N8n;

final class N8nResponse
{
    /**
     * @param  array<string, mixed>|null  $payload
     */
    public function __construct(
        public readonly bool $ok,
        public readonly ?array $payload,
        public readonly ?string $error = null,
        public readonly bool $transportFailed = false,
    ) {}

    public function isSuccessful(): bool
    {
        return $this->ok && $this->payload !== null && ! $this->transportFailed;
    }
}
