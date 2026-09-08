<?php
/**
 * Karl Peace Legacy Foundation - PHP API Configuration
 * ----------------------------------------------------
 * This file handles CORS, authentication tokens, session management,
 * and data persistence (JSON file or SQLite/MySQL).
 */

// 1. CORS Headers for cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle pre-flight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Secret Key for simple token hashing (Change this in production)
define('SECRET_KEY', 'karl_peace_legacy_foundation_secret_key_2026');

// 3. Admin Credentials (can also be stored in DB)
define('DEFAULT_ADMIN_EMAIL', 'admin@karlpeacelegacy.org');
define('DEFAULT_ADMIN_PASS_HASH', password_hash('admin', PASSWORD_BCRYPT));

// 4. Data File Path (JSON storage engine)
define('DATA_DIR', __DIR__ . '/../data');
define('DATA_FILE', DATA_DIR . '/foundation_data.json');

// Ensure data directory exists
if (!file_exists(DATA_DIR)) {
    @mkdir(DATA_DIR, 0755, true);
}

/**
 * Read the JSON data store
 */
function getFoundationData() {
    if (file_exists(DATA_FILE)) {
        $content = file_get_contents(DATA_FILE);
        $data = json_decode($content, true);
        if (is_array($data)) {
            return $data;
        }
    }
    return [];
}

/**
 * Save data to JSON data store
 */
function saveFoundationData($data) {
    if (!file_exists(DATA_DIR)) {
        @mkdir(DATA_DIR, 0755, true);
    }
    return file_put_contents(DATA_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

/**
 * Verify authorization token from headers
 */
function getBearerToken() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } else if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }

    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

/**
 * Validate token
 */
function isAuthenticatedAdmin() {
    $token = getBearerToken();
    if (!$token) {
        // Also check query param or cookie if available
        if (isset($_GET['token'])) {
            $token = $_GET['token'];
        }
    }

    if ($token && str_starts_with($token, 'karl_token_')) {
        return true;
    }

    // Check PHP session if standalone admin.php
    if (session_status() === PHP_SESSION_NONE) {
        @session_start();
    }
    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        return true;
    }

    return false;
}

/**
 * Send JSON response
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}
