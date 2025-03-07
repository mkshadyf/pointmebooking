/*
UPDATED ARCHITECTURE DOCUMENTATION
================================

1. Service Architecture Consolidation:
   - Authentication: All authentication hooks have been consolidated into the AuthService singleton.
   - Supabase Client: All direct Supabase client usage has been replaced by the SupabaseClientService singleton to ensure a single source of truth.
   - Admin Services: Admin operations are now located in 'src/lib/supabase/services/admin'.
   - Other Services: Business, Booking, Auth, Categories, etc. remain in their respective domain-specific directories under 'src/lib/supabase/services/'.

2. Deprecated Files and Redundancies Removed:
   - Removed all deprecated authentication hooks files located under 'src/hooks/supabase/auth', 'src/hooks/auth', 'src/lib/supabase/hooks'.
   - Removed redundant Supabase client files from 'src/lib/supabase/client/' as they have been replaced by the SupabaseClientService.

3. Import Updates:
   - All references to the deprecated files should now point to the new locations. For example:
       * Use AuthService from 'src/lib/supabase/services/auth.service'.
       * Use AdminService from 'src/lib/supabase/services/admin/admin.service'.
       * Use SupabaseClientService from 'src/lib/supabase/services/core/supabase-client.service'.

4. Documentation and Compatibility Layers:
   - Compatibility layers have been introduced where necessary, and deprecation notices are included in files that still exist for transitional purposes.
   - Refer to REDUNDANCIES.md and CLEANUP_PLAN.md for a detailed list of removed files and remaining tasks.

5. Future Steps:
   - Continue to monitor the codebase for any residual imports or dependencies referencing removed files.
   - Update test suites and integration tests to reflect the new architecture if needed.

This documentation reflects the current state as per the latest cleanup and reorganization efforts.
*/ 