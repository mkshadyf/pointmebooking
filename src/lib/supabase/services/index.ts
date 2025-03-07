/**
 * Services index
 * Exports all services for easy access
 */

// Export all services
export { adminService } from './admin/admin.service';
export { authService } from './auth/auth.service';
export { scheduleService } from './booking/schedule.service';
export { profileService } from './profile/profile.service';
export { searchService } from './search/search.service';
export { serviceService } from './service/service.service';
export { sessionService } from './session/session.service';

// Export business services
export {
    businessCategoryService, businessOnboardingService,
    businessOnboardingServiceNew, completeOnboardingStep,
    getOnboardingStatus, getOnboardingStep, getOnboardingSteps, serviceCategoryService, updateOnboardingStep
} from './business';

// Export core services
export { supabaseClientService } from './core/supabase-client.service';

// Note: Other services should be imported directly from their domain-specific locations
// to avoid naming conflicts and circular dependencies.

