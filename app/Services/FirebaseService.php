<?php

namespace App\Services;

use App\Models\UserFcmToken;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    private $projectId;
    private $clientEmail;
    private $privateKey;
    private const NOTIFICATIONS_CHANNEL_ID = 'almiftah_notifications';

    public function __construct()
    {
        $this->loadCredentials();
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function loadCredentials()
    {
        $credentialsFile = config('firebase.credentials_file', base_path('firebase-credentials.json'));
        
        if (file_exists($credentialsFile)) {
            $credentials = json_decode(file_get_contents($credentialsFile), true);
            if ($credentials) {
                $this->projectId = $credentials['project_id'] ?? 'almoftahapp';
                $this->clientEmail = $credentials['client_email'] ?? '';
                $this->privateKey = $credentials['private_key'] ?? '';
                return;
            }
        }

        $this->projectId = config('firebase.project_id', 'almoftahapp');
        $this->clientEmail = config('firebase.client_email', 'firebase-adminsdk-fbsvc@almoftahapp.iam.gserviceaccount.com');
        $key = config('firebase.private_key', '');
        $this->privateKey = str_replace('\n', "\n", $key);
    }

    private function getAccessToken()
    {
        if (empty($this->privateKey) || empty($this->clientEmail)) {
            Log::warning('Firebase credentials not configured');
            return null;
        }
        
        $jwt = $this->createJwt();
        if (empty($jwt)) {
            return null;
        }
        
        $response = Http::post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]);
        
        if ($response->successful()) {
            return $response->json('access_token');
        }
        
        Log::error('Failed to get Firebase access token', [
            'status' => $response->status(),
            'body' => $response->json(),
        ]);
        return null;
    }

    private function createJwt()
    {
        $now = time();
        $exp = $now + 3600;
        
        $headerJson = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
        if ($headerJson === false) {
            $headerJson = '{"alg":"RS256","typ":"JWT"}';
        }
        $header = $this->base64UrlEncode($headerJson);
        
        $payloadJson = json_encode([
            'iss' => $this->clientEmail,
            'sub' => $this->clientEmail,
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $exp,
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/cloud-platform',
        ]);
        if ($payloadJson === false) {
            Log::error('Failed to encode Firebase JWT payload');
            return '';
        }
        $payload = $this->base64UrlEncode($payloadJson);
        
        $signature = '';
        $signed = openssl_sign("$header.$payload", $signature, $this->privateKey, OPENSSL_ALGO_SHA256);
        if ($signed !== true) {
            Log::error('Failed to sign Firebase JWT');
            return '';
        }
        
        return "$header.$payload." . $this->base64UrlEncode($signature);
    }

    private function normalizeData(array $data): array
    {
        $out = [];

        foreach ($data as $key => $value) {
            if ($value === null) continue;

            $k = is_string($key) ? $key : (string) $key;

            if (is_bool($value)) {
                $out[$k] = $value ? '1' : '0';
                continue;
            }

            if (is_scalar($value)) {
                $out[$k] = (string) $value;
                continue;
            }

            try {
                $encoded = json_encode($value, JSON_UNESCAPED_UNICODE);
                $out[$k] = $encoded === false ? (string) $value : $encoded;
            } catch (\Throwable $_) {
                $out[$k] = (string) $value;
            }
        }

        return $out;
    }

    public function sendNotification($token, $title, $body, $data = [])
    {
        $accessToken = $this->getAccessToken();
        
        if (!$accessToken) {
            return false;
        }

        $data = is_array($data) ? $this->normalizeData($data) : [];
        
        $response = Http::withToken($accessToken)
            ->post('https://fcm.googleapis.com/v1/projects/' . $this->projectId . '/messages:send', [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => $data,
                    'android' => [
                        'priority' => 'HIGH',
                        'notification' => [
                            'channel_id' => self::NOTIFICATIONS_CHANNEL_ID,
                            'sound' => 'default',
                        ],
                    ],
                    'apns' => [
                        'headers' => [
                            'apns-push-type' => 'alert',
                            'apns-priority' => '10',
                        ],
                        'payload' => [
                            'aps' => [
                                'sound' => 'default',
                            ],
                        ],
                    ],
                ],
            ]);
        
        if ($response->successful()) {
            return true;
        }
        
        Log::error('Failed to send Firebase notification', [
            'status' => $response->status(),
            'body' => $response->json(),
        ]);
        return false;
    }

    public function sendToTopic($topic, $title, $body, $data = [])
    {
        $accessToken = $this->getAccessToken();
        
        if (!$accessToken) {
            return false;
        }

        $data = is_array($data) ? $this->normalizeData($data) : [];
        
        $response = Http::withToken($accessToken)
            ->post('https://fcm.googleapis.com/v1/projects/' . $this->projectId . '/messages:send', [
                'message' => [
                    'topic' => $topic,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => $data,
                    'android' => [
                        'priority' => 'HIGH',
                        'notification' => [
                            'channel_id' => self::NOTIFICATIONS_CHANNEL_ID,
                            'sound' => 'default',
                        ],
                    ],
                    'apns' => [
                        'headers' => [
                            'apns-push-type' => 'alert',
                            'apns-priority' => '10',
                        ],
                        'payload' => [
                            'aps' => [
                                'sound' => 'default',
                            ],
                        ],
                    ],
                ],
            ]);
        
        if ($response->successful()) {
            return true;
        }
        
        Log::error('Failed to send Firebase notification to topic', [
            'status' => $response->status(),
            'body' => $response->json(),
        ]);
        return false;
    }

    public function sendToUser($userId, $title, $body, $data = [])
    {
        Notification::create([
            'user_id' => $userId,
            'type' => $data['type'] ?? 'general',
            'title' => $title,
            'body' => $body,
            'is_read' => false,
            'related_id' => $data['id'] ?? null,
            'related_type' => $data['type'] ?? null,
        ]);

        $tokens = UserFcmToken::where('user_id', $userId)->pluck('token')->toArray();
        
        $ok = true;
        foreach ($tokens as $token) {
            $sent = $this->sendNotification($token, $title, $body, $data);
            $ok = $ok && $sent;
        }
        
        return $ok;
    }

    public function sendToAdmins($title, $body, $data = [])
    {
        $adminIds = User::where('role', 'admin')->pluck('id')->toArray();
        
        foreach ($adminIds as $adminId) {
            $this->sendToUser($adminId, $title, $body, $data);
        }
        
        return true;
    }
}
