<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE quote_requests MODIFY COLUMN service_type ENUM(
            'internet_plan',
            'hosting_package',
            'web_development',
            'cloud_services',
            'cyber_security',
            'network_infrastructure',
            'isp_services',
            'cpe_device',
            'satellite_connectivity',
            'media_services',
            'erp_services',
            'smart_integration',
            'other',
            'service'
        ) NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE quote_requests MODIFY COLUMN service_type ENUM(
            'internet_plan',
            'hosting_package',
            'web_development',
            'cloud_services',
            'cyber_security',
            'network_infrastructure',
            'isp_services',
            'cpe_device',
            'satellite_connectivity',
            'media_services',
            'erp_services',
            'smart_integration',
            'other'
        ) NOT NULL");
    }
};
