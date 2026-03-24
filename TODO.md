# Fix Newsletter Signup 500 Error (vlc_vid unique constraint violation)

## Status: [IN PROGRESS] 

### Steps:
1. [x] Add `ensureUniqueVisitorId()` static method to `backend/app/Models/Lead.php`
2. [x] Update `backend/app/Http/Controllers/Api/LeadController.php` newsletter() method:
   - Use `Lead::ensureUniqueVisitorId($data['vlc_vid'])` 
   - Wrap `Lead::create()` in try-catch for DB errors
   - Log detailed error if fails
3. [ ] Test: Trigger newsletter signup from frontend
4. [ ] Verify logs: `cd backend && tail -f storage/logs/laravel.log`
5. [ ] Clear caches: `cd backend && php artisan cache:clear config:clear route:clear view:clear`
6. [ ] [COMPLETE] Remove TODO.md or mark done

**Root cause:** Race condition on Str::uuid() when vlc_vid null → duplicate unique vlc_vid → SQL integrity error → 500 crash.
