<?php

require_once 'vendor/autoload.php';

use Carbon\Carbon;
use Nats\Connection;
use Nats\ConnectionOptions;

/** @var ConnectionOptions $options */
$options = new ConnectionOptions();

$options->setHost('127.0.0.1')->setPort(4222);

/** @var Connection $client */
$client = new Connection($options);

//$to = $_GET['to'] ?? 1;
//$msg = $_GET['msg'] ?? 'New Notification';
$to = $argv[1] ?? 1;
$msg = $argv[2] ?? 'New Notification';

try {
    $client->connect();
    printf("[%s][INFO] - Connection opened. NATS Server ID: %s\r\n", Carbon::now('Europe/Istanbul')->toDateTimeString(), $client->connectedServerID());
} catch (\Exception $exception) {
    printf("[%s][ERROR] - Error when server connect: %s\r\n", Carbon::now('Europe/Istanbul')->toDateTimeString(), $exception->getMessage());
}

$msg = json_encode(['user_id' => $to, 'data' => $msg]);

try {
    printf("[%s][INFO] Publishing message: %s to channel: %s\r\n", $msg, 'notification_' . $to);
    $client->publish('notification_' . $to, $msg);

} catch (\Nats\Exception $exception) {
    printf("[%s][ERROR] Error when publishing: %s message: %s\r\n", $msg, $exception->getMessage());
}

$client->close();