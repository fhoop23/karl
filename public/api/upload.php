<?php
// /public/api/upload.php
require_once __DIR__ . '/config.php';

// Ensure uploads directory exists
$uploadDir = dirname(__DIR__) . '/uploads';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed. Only POST is supported.'], 405);
}

// 1. Check if multipart file upload
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $fileTmp = $_FILES['image']['tmp_name'];
    $fileName = $_FILES['image']['name'];
    $fileSize = $_FILES['image']['size'];

    // Validate mime type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $fileTmp);
    finfo_close($finfo);

    $allowedMimes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif'
    ];

    if (!isset($allowedMimes[$mime])) {
        jsonResponse(['error' => 'Invalid image format. Allowed: JPG, PNG, WEBP, GIF.'], 400);
    }

    $ext = $allowedMimes[$mime];
    $newFileName = 'img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $destination = $uploadDir . '/' . $newFileName;

    if (move_uploaded_file($fileTmp, $destination)) {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $relativeUrl = '/uploads/' . $newFileName;
        
        jsonResponse([
            'success' => true,
            'message' => 'Image uploaded successfully.',
            'url' => $relativeUrl,
            'fileName' => $newFileName,
            'size' => $fileSize
        ]);
    } else {
        jsonResponse(['error' => 'Failed to save uploaded file to disk.'], 500);
    }
}

// 2. Check if JSON with base64 payload
$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody, true);

if ($payload && !empty($payload['data'])) {
    $base64Data = $payload['data'];
    $fileNameInput = $payload['name'] ?? 'image.jpg';

    if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
        $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
        $type = strtolower($type[1]); // jpg, png, etc.
        if ($type === 'jpeg') $type = 'jpg';
    } else {
        $type = 'jpg';
    }

    $decoded = base64_decode($base64Data);
    if ($decoded === false) {
        jsonResponse(['error' => 'Base64 decode failed.'], 400);
    }

    $newFileName = 'img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $type;
    $destination = $uploadDir . '/' . $newFileName;

    if (file_put_contents($destination, $decoded)) {
        $relativeUrl = '/uploads/' . $newFileName;
        jsonResponse([
            'success' => true,
            'message' => 'Image uploaded successfully.',
            'url' => $relativeUrl,
            'fileName' => $newFileName
        ]);
    } else {
        jsonResponse(['error' => 'Could not write image to uploads folder.'], 500);
    }
}

jsonResponse(['error' => 'No image provided in request.'], 400);
