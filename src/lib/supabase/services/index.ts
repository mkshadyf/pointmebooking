/**
 * Services index
 * Exports all services for easy access
 */

/**
 * Central export point for all service singletons
 * Use these exported instances throughout the application
 */

// Auth service
export { authService } from './auth';

// Profile service
export { profileService } from './profile/profile.service';

// Business services
export { BusinessOnboardingService, businessOnboardingService } from './business';

// Booking services
export { bookingService } from './booking.service';
export { scheduleService } from './booking/schedule.service';

// Admin services
export { AdminService, adminService } from './admin/admin.service';

// Search services
export { searchService } from './search/search.service';

// Session services
export { sessionService } from './session/session.service';

// Email services
export { EmailService } from './email/email.service';

// Core services
export { supabaseClientService } from './core/supabase-client.service';

// Import and export singletons that need to be created from getInstance()
import { BusinessCategoryService } from './categories/business-category.service';
import { ServiceCategoryService } from './categories/service-category.service';
import { ServiceService } from './service/service.service';

// Analytics service
export { analyticsService } from './analytics/analytics.service';

// Service singletons
export const serviceService = ServiceService.getInstance();
export const businessCategoryService = BusinessCategoryService.getInstance();
export const serviceCategoryService = ServiceCategoryService.getInstance();

// Note: Other services should be imported directly from their domain-specific locations
// to avoid naming conflicts and circular dependencies.

