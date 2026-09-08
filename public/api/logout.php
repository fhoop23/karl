<?php
/**
 * Karl Peace Legacy Foundation - Logout API
 */

require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}
$_SESSION = [];
@session_destroy();

jsonResponse([
    'success' => true,
    'message' => 'Logged out successfully.'
]);
