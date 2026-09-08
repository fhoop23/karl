<?php
/**
 * Karl Peace Legacy Foundation - Scholarship Alert Subscribers API
 * ----------------------------------------------------------------
 * POST: Public submission of student scholarship alerts
 * GET: Admin-only retrieval of subscriber list
 * DELETE: Admin-only removal of subscriber
 */

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Public POST: Add subscriber
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $email = trim($input['email'] ?? '');
    $name = trim($input['name'] ?? 'Prospective Scholar');
    $institution = trim($input['institution'] ?? '');
    $course = trim($input['course'] ?? '');

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Please provide a valid email address.'], 400);
    }

    $data = getFoundationData();
    if (!isset($data['subscribers']) || !is_array($data['subscribers'])) {
        $data['subscribers'] = [];
    }

    // Check if already subscribed
    foreach ($data['subscribers'] as $sub) {
        if (strtolower($sub['email'] ?? '') === strtolower($email)) {
            jsonResponse([
                'success' => true,
                'message' => 'You are already registered for scholarship dispatch notifications.',
                'item' => $sub
            ]);
        }
    }

    $newSubscriber = [
        'id' => 'sub_' . time() . '_' . rand(1000, 9999),
        'name' => $name,
        'email' => $email,
        'institution' => $institution,
        'course' => $course,
        'createdAt' => date('c'),
        'status' => 'new'
    ];

    array_unshift($data['subscribers'], $newSubscriber);
    saveFoundationData($data);

    jsonResponse([
        'success' => true,
        'message' => 'Successfully registered for official scholarship notices.',
        'item' => $newSubscriber
    ], 201);
}

// Protected GET: List all subscribers
if ($method === 'GET') {
    if (!isAuthenticatedAdmin()) {
        jsonResponse(['error' => 'Unauthorized admin access.'], 401);
    }
    $data = getFoundationData();
    jsonResponse([
        'success' => true,
        'subscribers' => $data['subscribers'] ?? []
    ]);
}

// Protected DELETE: Remove a subscriber
if ($method === 'DELETE') {
    if (!isAuthenticatedAdmin()) {
        jsonResponse(['error' => 'Unauthorized admin access.'], 401);
    }
    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        jsonResponse(['error' => 'Subscriber ID required.'], 400);
    }

    $data = getFoundationData();
    $subscribers = $data['subscribers'] ?? [];
    $data['subscribers'] = array_values(array_filter($subscribers, function($s) use ($id) {
        return ($s['id'] ?? '') !== $id;
    }));
    saveFoundationData($data);

    jsonResponse(['success' => true, 'message' => 'Subscriber removed successfully.']);
}

jsonResponse(['error' => 'Method not allowed.'], 405);
