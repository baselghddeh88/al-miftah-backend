<?php

namespace App\Services;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'] ?? null,
            'password'  => Hash::make($data['password']),
            'phone'     => $data['phone'],
            'role'      => 'user',
            'is_active' => true,
        ]);

        return ['user' => $user];
    }

    public function login(array $data): array|false|null|string
    {
        $loginField = $data['login'];

        $user = User::withoutGlobalScopes()->where('email', $loginField)
            ->orWhere('phone', $loginField)
            ->first();
        if (!$user || !$user->password || !Hash::check($data['password'], $user->password)) {
            return null;
        }

        if (!$user->is_active) return false;
        if ($user->is_banned)  return 'banned';

        $token = $user->createToken('auth-token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    public function loginOrRegisterWithFirebase(array $firebaseUser, FirebaseAuthService $firebaseAuthService, ?string $requestPhone = null): array|false|string
    {
        $uid      = $firebaseUser['localId'];
        $email    = $firebaseUser['email'] ?? null;
        $phone    = isset($firebaseUser['phoneNumber'])
            ? $firebaseAuthService->normalizePhone($firebaseUser['phoneNumber'])
            : $requestPhone;
        $provider = $firebaseAuthService->detectProvider($firebaseUser);

        // 1. Find by firebase_uid
        $user = User::where('firebase_uid', $uid)->first();

        // 2. Find by email
        if (!$user && $email) {
            $user = User::where('email', $email)->first();
        }

        // 3. Find by phone
        if (!$user && $phone) {
            $user = User::where('phone', $phone)->first();
        }

        if ($user) {
            $updates = [];
            if (!$user->firebase_uid)                                        $updates['firebase_uid']  = $uid;
            if (!$user->auth_provider || $user->auth_provider === 'email')   $updates['auth_provider'] = $provider;
            if (!$user->phone && $phone)                                     $updates['phone']         = $phone;
            if (!empty($updates)) $user->update($updates);
        } else {
            if ($provider === 'google' && !$phone) {
                return 'needs_phone';
            }
            $user = $this->createFromFirebase($uid, $email, $phone, $provider, $firebaseUser);
        }

        if (!$user->is_active) return false;
        if ($user->is_banned)  return 'banned';

        $token = $user->createToken('auth-token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    private function createFromFirebase(string $uid, ?string $email, ?string $phone, string $provider, array $firebaseUser): User
    {
        $name = $firebaseUser['displayName'] ?? null;

        if (empty($name) && $email)  $name = explode('@', $email)[0];
        if (empty($name) && $phone)  $name = 'User_' . substr($phone, -4);
        if (empty($name))            $name = 'User';

        return User::create([
            'name'              => $name,
            'email'             => $email,
            'phone'             => $phone,
            'password'          => Hash::make(Str::random(32)),
            'firebase_uid'      => $uid,
            'auth_provider'     => $provider,
            'role'              => 'user',
            'is_active'         => true,
            'email_verified_at' => !empty($firebaseUser['emailVerified']) ? now() : null,
        ]);
    }

    public function setFirebasePassword(User $user, string $newPassword): bool
    {
        $user->update(['password' => Hash::make($newPassword)]);
        return true;
    }

    public function changePassword(User $user, array $data): bool
    {
        if (!$user->password || !Hash::check($data['current_password'], $user->password)) {
            return false;
        }

        $user->update(['password' => Hash::make($data['password'])]);
        $user->tokens()->delete();

        return true;
    }

    public function promoteToAdmin(array $data): ?User
    {
        $user = null;

        if (isset($data['id']))    $user = User::find($data['id']);
        elseif (isset($data['email'])) $user = User::where('email', $data['email'])->first();

        if (!$user) return null;

        if ($user->role === 'super_admin') return $user;
        $user->update(['role' => 'admin']);

        return $user;
    }

    public function createUser(array $data): User
    {
        return User::create([
            'name'      => $data['name'],
            'email'     => $data['email'] ?? null,
            'password'  => Hash::make($data['password']),
            'phone'     => $data['phone'],
            'role'      => $data['role'] ?? 'user',
            'is_active' => $data['is_active'] ?? true,
        ]);
    }
    private function normalize(string $value): string
    {
        return \Illuminate\Support\Str::lower(preg_replace('/\s+/', ' ', trim($value)));
    }



    public function updateSecurityAnswers(User $user, array $data)
    {
        $this->ensureUserIsEligible($user);

        $user->update([
            'security_answer_1' => Hash::make($this->normalize($data['answer_1'])),
            'security_answer_2' => Hash::make($this->normalize($data['answer_2'])),
        ]);

        return true;
    }


    public function getSecurityQuestions(string $identifier)
    {
        $user = $this->findUserByIdentifier($identifier);

        $this->ensureUserIsEligible($user);

        if (!$user->security_answer_1 || !$user->security_answer_2) {
            throw new Exception('questions_not_set', 400);
        }

        return [
            '1' => 'ما اسم جدك؟',
            '2' => 'ما لونك المفضل؟',
        ];
    }


    public function verifySecurityAnswers(string $identifier, string $ans1, string $ans2): array
    {
        $user = $this->findUserByIdentifier($identifier);

        $check1 = Hash::check($this->normalize($ans1), $user->security_answer_1);
        $check2 = Hash::check($this->normalize($ans2), $user->security_answer_2);

        if (!$check1 || !$check2) {
            throw new Exception('wrong_answers', 401);
        }

        $resetToken = Str::random(64);

        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($resetToken),
            'created_at' => now()
        ]);

        return ['reset_token' => $resetToken];
    }

    public function resetPasswordWithToken(array $data): bool
    {
        $resetData = DB::table('password_reset_tokens')
            ->where('created_at', '>', now()->subMinutes(15))
            ->get()
            ->filter(function ($row) use ($data) {
                return Hash::check($data['token'], $row->token);
            })->first();

        if (!$resetData) {
            throw new Exception('invalid_or_expired_token', 400);
        }

        $user = User::where('email', $resetData->email)->first();

        if (!$user) {
            throw new Exception('user_not_found', 404);
        }

        $user->update([
            'password' => Hash::make($data['password']),
        ]);

        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        $user->tokens()->delete();

        return true;
    }



    private function findUserByIdentifier(string $identifier): User
    {
        $user = User::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->first();

        if (!$user) {
            throw new Exception('user_not_found', 404);
        }

        return $user;
    }

    private function ensureUserIsEligible(User $user): void
    {
        if ($user->firebase_uid !== null || $user->auth_provider === 'firebase') {
            throw new Exception('firebase_user_not_allowed', 403);
        }

        if (isset($user->is_active) && !$user->is_active) {
            throw new Exception('account_inactive', 403);
        }

        if (isset($user->is_banned) && $user->is_banned) {
            throw new Exception('account_banned', 403);
        }
    }
}
