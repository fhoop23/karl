<?php
/**
 * Karl Peace Legacy Foundation - Data Export & Backup
 */

require_once __DIR__ . '/config.php';

if (!isAuthenticatedAdmin()) {
    jsonResponse(['error' => 'Unauthorized admin access.'], 401);
}

$data = getFoundationData();
$filename = 'karl_peace_foundation_backup_' . date('Y_m_d_His') . '.json';

header('Content-Type: application/json');
header('Content-Disposition: attachment; filename="' . $filename . '"');
echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
exit();
