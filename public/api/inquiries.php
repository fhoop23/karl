<?php
/**
 * Karl Peace Legacy Foundation - Contact Inquiries API
 */

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Public POST: Submit contact inquiry
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $subject = trim($input['subject'] ?? 'General Inquiry');
    $message = trim($input['message'] ?? '');
    $role = trim($input['role'] ?? 'Student');

    if (empty($name) || empty($email) || empty($message)) {
        jsonResponse(['error' => 'Please fill in your name, email, and message.'], 400);
    }

    $data = getFoundationData();
    if (!isset($data['inquiries']) || !is_array($data['inquiries'])) {
        $data['inquiries'] = [];
    }

    $newInquiry = [
        'id' => 'inq_' . time() . '_' . rand(1000, 9999),
        'name' => $name,
        'email' => $email,
        'subject' => $subject,
        'message' => $message,
        'role' => $role,
        'createdAt' => date('c'),
        'status' => 'unread'
    ];

    array_unshift($data['inquiries'], $newInquiry);
    saveFoundationData($data);

    jsonResponse([
        'success' => true,
        'message' => 'Your message has been safely transmitted to the foundation secretariat.',
        'inquiry' => $newInquiry
    ], 201);
}

// Protected GET: List all inquiries
if ($method === 'GET') {
    if (!isAuthenticatedAdmin()) {
        jsonResponse(['error' => 'Unauthorized admin access.'], 401);
    }
    $data = getFoundationData();
    jsonResponse([
        'success' => true,
        'inquiries' => $data['inquiries'] ?? []
    ]);
}

// Protected PATCH/POST status update or DELETE
if ($method === 'PATCH' || $method === 'PUT') {
    if (!isAuthenticatedAdmin()) {
        jsonResponse(['error' => 'Unauthorized admin access.'], 401);
    }
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $id = $input['id'] ?? '';
    $status = $input['status'] ?? 'replied';

    $data = getFoundationData();
    if (isset($data['inquiries'])) {
        foreach ($data['inquiries'] as &$inq) {
            if (($inq['id'] ?? '') === $id) {
                $inq['status'] = $status;
                break;
            }
        }
        saveFoundationData($data);
    }

    jsonResponse(['success' => true, 'message' => 'Inquiry status updated.']);
}

if ($method === 'DELETE') {
    if (!isAuthenticatedAdmin()) {
        jsonResponse(['error' => 'Unauthorized admin access.'], 401);
    }
    $id = $_GET['id'] ?? '';
    $data = getFoundationData();
    if (isset($data['inquiries'])) {
        $data['inquiries'] = array_values(array_filter($data['inquiries'], function($inq) use ($id) {
            return ($inq['id'] ?? '') !== $id;
        }));
        saveFoundationData($data);
    }
    jsonResponse(['success' => true, 'message' => 'Inquiry deleted.']);
}

jsonResponse(['error' => 'Method not allowed.'], 405);
