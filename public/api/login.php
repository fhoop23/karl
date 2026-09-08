<?php
/**
 * Karl Peace Legacy Foundation - PHP API Login Handler
 * ---------------------------------------------------
 * Authenticates administrators via email/username and password.
 * Returns a session token and user profile.
 */

require_once __DIR__ . '/config.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed. Only POST is accepted.'], 405);
}

// Parse JSON body or standard POST
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? trim($input['password']) : '';

if (empty($email) || empty($password)) {
    jsonResponse(['error' => 'Please provide both email/username and password.'], 400);
}

// Recognized administrative accounts
$validAdmins = [
    'admin@karlpeacelegacy.org' => [
        'name' => 'Karl Peace Foundation Admin',
        'role' => 'admin',
        'isSuper' => true
    ],
    'admin' => [
        'name' => 'Karl Peace Foundation Admin',
        'role' => 'admin',
        'isSuper' => true
    ],
    'gtech.websites@gmail.com' => [
        'name' => 'Super Administrator',
        'role' => 'admin',
        'isSuper' => true
    ]
];

$normalizedEmail = strtolower($email);
$isAdmin = isset($validAdmins[$normalizedEmail]) || str_ends_with($normalizedEmail, '@karlpeacelegacy.org');

// Default password is 'admin' or 'karlpeace2026'
$isPasswordValid = ($password === 'admin' || $password === 'karlpeace2026' || $password === 'admin123');

if ($isAdmin && $isPasswordValid) {
    // Generate secure session token
    $token = 'karl_token_' . bin2hex(random_bytes(24));
    
    // Set PHP Session for standalone admin.php
    if (session_status() === PHP_SESSION_NONE) {
        @session_start();
    }
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_email'] = $email;
    $_SESSION['admin_token'] = $token;

    $profile = $validAdmins[$normalizedEmail] ?? [
        'name' => 'Foundation Officer',
        'role' => 'admin',
        'isSuper' => false
    ];

    jsonResponse([
        'success' => true,
        'message' => 'Authentication successful.',
        'token' => $token,
        'user' => [
            'uid' => 'php_' . md5($email),
            'email' => $email,
            'displayName' => $profile['name'],
            'role' => $profile['role'],
            'isSuperAdmin' => $profile['isSuper'] ?? false,
            'authenticatedAt' => date('c')
        ]
    ]);
} else {
    jsonResponse([
        'success' => false,
        'error' => 'Invalid administrative credentials. Default username is admin@karlpeacelegacy.org and password is admin.'
    ], 401);
}
