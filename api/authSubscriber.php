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

try {
    $client->connect(-1);
    printf("[%s][INFO] - Connection opened. NATS Server ID: %s\r\n", Carbon::now('Europe/Istanbul')->toDateTimeString(), $client->connectedServerID());
} catch (\Exception $exception) {
    printf("[%s][ERROR] - Error when server connect: %s\r\n", Carbon::now('Europe/Istanbul')->toDateTimeString(), $exception->getMessage());
}

$hash_key = "0wCNwGRwJ58sJdZBzUNyP6ogJVSw2OzoTYhDNl5Cnvz8rWfok5Y0yPPA2Uy2HXFj";

$client->subscribe('authentication', function ($message) use ($hash_key) {

    printf("[%s][INFO] Message arrived: %s\r\n", Carbon::now('Europe/Istanbul')->toDateTimeString(), $message->getBody());

    $decoded = json_decode(openssl_decrypt($message->getBody(), "AES-128-ECB", $hash_key), true);

    if (isset($decoded['user_id'])) {
        $reply = json_encode(['success' => true, 'user_id' => $decoded['user_id']]);
    } else {
        $reply = json_encode(['success' => false, 'user_id' => null]);
    }

    $message->reply($reply);

    printf("[%s][INFO] Passing message reply: %s\r\n", Carbon::now('Europe/Istanbul')->toDateTimeString(), $reply);
});

$client->wait();