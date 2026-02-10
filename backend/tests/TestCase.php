<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Spatie\Activitylog\Models\Activity;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Disable activity logging during tests by mocking the activity model
        $this->mockActivityLogging();
    }
    
    /**
     * Disable activity logging for tests
     */
    protected function mockActivityLogging(): void
    {
        // Disable logging by returning null from creating activities
        \Spatie\Activitylog\Facades\Activity::shouldReceive('log')
            ->andReturnUsing(function ($description = '') {
                $activity = new Activity();
                $activity->description = $description;
                return $activity;
            });
    }
}
