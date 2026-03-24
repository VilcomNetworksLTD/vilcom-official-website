<?php

namespace App\Console\Commands;

use App\Models\Lead;
use App\Models\WhatsappMessage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncWhatsAppToLeads extends Command
{
    protected $signature = 'leads:sync-whatsapp';
    protected $description = 'Sync existing WhatsApp messages to the Leads table based on email/phone';

    public function handle()
    {
        $this->info('Starting WhatsApp to Lead sync...');

        // Get all WhatsApp messages that are NOT linked yet
        // (Since we don't have a lead_id column in whatsapp_messages, we check if a lead exists for this contact)
        $messages = WhatsappMessage::all();

        $syncedCount = 0;
        $updatedCount = 0;

        foreach ($messages as $message) {
            // 1. Check for duplicate lead using the Model's scope
            $duplicates = Lead::findDuplicates($message->email, $message->phone);

            if ($duplicates->isNotEmpty()) {
                // UPDATE: Merge data into existing lead
                $lead = $duplicates->first();

                $lead->update(array_filter([
                    'name' => $lead->name ?: $message->name,
                    'phone' => $lead->phone ?: $message->phone,
                    'email' => $lead->email ?: $message->email,
                    'source' => 'whatsapp', // Update source to reflect latest interaction
                    'message' => $message->message, // Update message to latest WhatsApp text
                    'device_type' => $message->source === 'mobile_app' ? 'mobile' : 'desktop',
                ]));

                $this->line("✏️ Updated existing Lead #{$lead->id} for {$message->name} ({$message->email})");
                $updatedCount++;
            } else {
                // CREATE: New Lead from WhatsApp message
                $lead = Lead::create([
                    'vlc_vid' => 'wa_import_' . $message->id,
                    'name' => $message->name,
                    'email' => $message->email,
                    'phone' => $message->phone,
                    'source' => 'whatsapp',
                    'message' => $message->message,
                    'status' => 'new', // Default status for new leads
                    'device_type' => 'desktop', // Default fallback
                ]);

                $this->line("➕ Created new Lead #{$lead->id} for {$message->name}");
                $syncedCount++;
            }

            // 3. Trigger Scoring & Auto-Assignment
            $lead->calculateScore();
            if (!$lead->assigned_staff_id) {
                $lead->autoAssign();
            }
        }

        $this->info('Sync Complete!');
        $this->info("New Leads Created: {$syncedCount}");
        $this->info("Existing Leads Updated: {$updatedCount}");

        return Command::SUCCESS;
    }
}
