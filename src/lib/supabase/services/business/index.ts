/**
 * Business services index
 * Exports all business-related services
 */

// Export business services
export { BusinessCategoryService, businessCategoryService } from '../categories/business-category.service';
export { ServiceCategoryService, serviceCategoryService } from '../categories/service-category.service';

// Export business onboarding services
export {
    BusinessOnboardingService,
    businessOnboardingServiceNew, completeOnboardingStep,
    getOnboardingStatus, getOnboardingStep, getOnboardingSteps, updateOnboardingStep
} from './business-onboarding-new.service';

// Export business onboarding service (original)
export { businessOnboardingService } from './business-onboarding-service';

