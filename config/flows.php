<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Available agent flows (n8n webhooks)
    |--------------------------------------------------------------------------
    |
    | Each entry maps a slug to its n8n webhook path. Adding a new agent =
    | build + validate the workflow in n8n-devnodo, then add an entry here.
    |
    */

    'reels-motion-designer' => [
        'label' => 'Reel para Instagram/TikTok/Reels',
        'webhook_path' => 'webhook/reels-motion-designer',
        'trigger_examples' => [
            'Créame un reel para Instagram',
            'Necesito un reel para el lanzamiento de...',
        ],
    ],

];
