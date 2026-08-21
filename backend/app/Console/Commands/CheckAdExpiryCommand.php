<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\AdvertisementController;
use Illuminate\Console\Command;

class CheckAdExpiryCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ads:check-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan advertisements, expire out-of-date ads, and send smart renewal alerts to merchants.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting advertisements auto-expiry and renewal scan...');

        $controller = new AdvertisementController();
        $response = $controller->checkAndExpireAds();
        $data = $response->getData(true);

        $results = $data['results'] ?? [];
        $expiredCount = $results['expired_count'] ?? 0;
        $reminderCount = $results['reminder_count'] ?? 0;

        $this->info("✅ Scan complete: {$expiredCount} ads expired, {$reminderCount} renewal reminders sent.");

        return Command::SUCCESS;
    }
}
