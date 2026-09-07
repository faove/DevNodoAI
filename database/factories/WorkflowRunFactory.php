<?php

namespace Database\Factories;

use App\Enums\WorkflowRunStatus;
use App\Models\Message;
use App\Models\WorkflowRun;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkflowRun>
 */
class WorkflowRunFactory extends Factory
{
    protected $model = WorkflowRun::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'message_id' => Message::factory(),
            'flow_slug' => 'reels-motion-designer',
            'status' => WorkflowRunStatus::Success,
            'request_payload' => ['brief' => 'test'],
            'response_payload' => ['ok' => true],
            'error' => null,
            'duration_ms' => 1200,
        ];
    }
}
