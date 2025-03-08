/**
 * Business services index
 * Exports all business-related services
 */

// Export business category services
export { BusinessCategoryService, businessCategoryService } from '../categories/business-category.service';
export { ServiceCategoryService, serviceCategoryService } from '../categories/service-category.service';

// Export business onboarding service
export {
    BusinessOnboardingService, BusinessOnboardingServiceStatic, businessOnboardingService
} from './business-onboarding-service';

// Export helper functions for backward compatibility
export {
    completeOnboardingStep,
    getOnboardingStatus,
    getOnboardingStep,
    getOnboardingSteps,
    updateOnboardingStep
} from './business-onboarding-service';

