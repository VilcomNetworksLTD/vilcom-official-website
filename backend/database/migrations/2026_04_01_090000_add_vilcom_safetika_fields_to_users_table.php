<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds Vilcom Safetika (production API) provisioning fields to the users table.
 *
 * Columns stored:
 *   vilcom_safetika_customer_id   — Emerald customer_id from create-mbr
 *   vilcom_safetika_record_id     — Our local record_id on their system (used for add-service & inventory)
 *   vilcom_safetika_address_id    — address_id from create-mbr
 *   vilcom_safetika_service_acc_id— account_id after add-service
 *   vilcom_safetika_assignment_id — assignment_id after inventory assignment
 *   vilcom_safetika_serial_number — Homes_Tracker serial number assigned
 *   vilcom_safetika_provisioned_at— Timestamp of successful full provision
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // From Step 2: create-mbr
            $table->string('vilcom_safetika_customer_id', 50)->nullable()
                  ->after('emerald_approval_notes')
                  ->comment('Emerald customer_id from Vilcom Safetika create-mbr');

            $table->unsignedInteger('vilcom_safetika_record_id')->nullable()
                  ->after('vilcom_safetika_customer_id')
                  ->comment('Local record_id on Vilcom Safetika system');

            $table->string('vilcom_safetika_address_id', 50)->nullable()
                  ->after('vilcom_safetika_record_id')
                  ->comment('address_id from Vilcom Safetika create-mbr');

            // From Step 3: add-service
            $table->string('vilcom_safetika_service_acc_id', 50)->nullable()
                  ->after('vilcom_safetika_address_id')
                  ->comment('account_id after Vilcom Safetika add-service');

            // From Step 6: assign-inventory
            $table->unsignedInteger('vilcom_safetika_assignment_id')->nullable()
                  ->after('vilcom_safetika_service_acc_id')
                  ->comment('assignment_id after Homes_Tracker inventory assignment');

            $table->string('vilcom_safetika_serial_number', 100)->nullable()
                  ->after('vilcom_safetika_assignment_id')
                  ->comment('Homes_Tracker device serial number assigned to this user');

            // Audit timestamp
            $table->timestamp('vilcom_safetika_provisioned_at')->nullable()
                  ->after('vilcom_safetika_serial_number')
                  ->comment('When the full Vilcom Safetika provision completed successfully');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'vilcom_safetika_customer_id',
                'vilcom_safetika_record_id',
                'vilcom_safetika_address_id',
                'vilcom_safetika_service_acc_id',
                'vilcom_safetika_assignment_id',
                'vilcom_safetika_serial_number',
                'vilcom_safetika_provisioned_at',
            ]);
        });
    }
};
