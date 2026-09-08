<?php
/**
 * Karl Peace Legacy Foundation - Check Auth Token
 */

require_once __DIR__ . '/config.php';

if (isAuthenticatedAdmin()) {
    if (session_status() === PHP_SESSION_NONE) {
        @session_start();
    }
    $email = $_SESSION['admin_email'] ?? 'admin@karlpeacelegacy.org';

    jsonResponse([
        'authenticated' => true,
        'user' => [
            'uid' => 'php_' . md5($email),
            'email' => $email,
            'role' => 'admin',
            'isSuperAdmin' => true
        ]
    ]);
} else {
    jsonResponse([
        'authenticated' => false,
        'error' => 'Not authenticated'
    ], 401);
}
