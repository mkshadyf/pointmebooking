/**
 * Services index
 * Exports all services for easy access
 */

// Export auth services
export { AuthService, authService } from './auth/auth.service';

// Export profile services
export { ProfileService, profileService } from './profile/profile.service';

// Export booking services
export { bookingService } from './booking.service';
export { scheduleService } from './booking/schedule.service';

// Export business services
export {
    BusinessOnboardingService, businessCategoryService,
    businessOnboardingService
} from './business';

// Export service-related services
export { serviceCategoryService } from './categories/service-category.service';
export { serviceService } from './service/service.service';

// Export admin services
export { AdminService, adminService } from './admin/admin.service';

// Export search services
export { searchService } from './search/search.service';

// Export session services
export { sessionService } from './session/session.service';

// Export email services
export { EmailService } from './email/email.service';

// Export core services
export { supabaseClientService } from './core/supabase-client.service';

// Export analytics services
export { analyticsService } from './analytics/analytics.service';

// Note: Other services should be imported directly from their domain-specific locations
// to avoid naming conflicts and circular dependencies.

