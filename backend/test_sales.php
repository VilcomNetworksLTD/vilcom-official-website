<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\VilcomSafetikaService;
use Illuminate\Support\Facades\Http;

$service = new VilcomSafetikaService();
$token = $service->getToken();
$response = Http::withToken($token)->get('https://apisafetika.vilcom.co.ke/api/dropdowns/sales-persons');
echo json_encode($response->json(), JSON_PRETTY_PRINT);
