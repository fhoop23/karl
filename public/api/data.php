<?php
/**
 * Karl Peace Legacy Foundation - Foundation Data Management API
 * -------------------------------------------------------------
 * GET: Retrieve current foundation data (Public or Admin)
 * POST: Update foundation data (Protected: requires Admin token or session)
 */

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Handle GET: Return current database data
if ($method === 'GET') {
    $data = getFoundationData();
    jsonResponse([
        'success' => true,
        'data' => $data,
        'source' => 'php_json_store',
        'timestamp' => date('c')
    ]);
}

// Handle POST/PUT: Update database data
if ($method === 'POST' || $method === 'PUT') {
    if (!isAuthenticatedAdmin()) {
        jsonResponse([
            'success' => false,
            'error' => 'Unauthorized: Administrator authentication required to modify foundation data.'
        ], 401);
    }

    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!is_array($payload)) {
        jsonResponse(['error' => 'Invalid JSON payload provided.'], 400);
    }

    // Merge or overwrite with existing data
    $currentData = getFoundationData();
    $updatedData = array_merge($currentData, $payload);
    $updatedData['lastModified'] = date('c');

    $saved = saveFoundationData($updatedData);

    if ($saved !== false) {
        jsonResponse([
            'success' => true,
            'message' => 'Foundation data successfully updated.',
            'timestamp' => date('c'),
            'data' => $updatedData
        ]);
    } else {
        jsonResponse([
            'success' => false,
            'error' => 'Failed to write data to storage file. Check file permissions on data directory.'
        ], 500);
    }
}

jsonResponse(['error' => 'Method not allowed.'], 405);
