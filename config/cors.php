<?php

return [

    'paths' => ['api/*'],
    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:51295',
        'http://127.0.0.1:51295',
        'https://almiftah-real-estate.web.app',
        'https://recycling-buccaneer-outdoors.ngrok-free.dev',
        'https://al-miftah-production.up.railway.app',
    ],

    'allowed_origins_patterns' => [
        '#^https://[a-z0-9\-]+\.ngrok-free\.app$#',
        '#^http://localhost:\d+$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
