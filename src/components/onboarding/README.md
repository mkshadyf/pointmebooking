# Business Onboarding System

This module provides a complete business onboarding workflow for PointMe, guiding users through the process of creating and setting up their business profiles.

## Overview

The business onboarding system allows users to register as business owners and creates business profiles in a step-by-step guided process. It handles:

- Basic business information collection
- Contact and location details
- Media uploads (logo and banner)
- Initial service setup
- Profile review and submission

## Key Components

### 1. Server Actions & API

- **`createBusinessProfileAction`** - Server action for creating business profiles
- **`getBusinessCategoriesAction`** - Fetches available business categories
- **`getServiceCategoriesAction`** - Fetches service categories for a business category

### 2. Service Layer

- **`BusinessOnboardingService`** - Service for handling business onboarding operations

### 3. UI Components

- **`BusinessOnboardingWizard`** - Main wizard component that controls the flow
- Form components for each step:
  - `BusinessBasicInfoForm` - Basic business information
  - `BusinessContactForm` - Contact information
  - `BusinessLocationForm` - Location information
  - `BusinessMediaForm` - Logo and banner uploads
  - `BusinessServicesForm` - Initial service setup
  - `BusinessReviewForm` - Final review before submission

### 4. Hooks

- **`useBusinessOnboarding`** - Custom hook for managing the onboarding state and operations

### 5. Route Handling

- **Auth Callback** - Special handling for users coming from OAuth providers
- **Middleware** - Handles redirects and protections for onboarding pages

## Typical Flow

1. User signs up (email/password or OAuth provider)
2. User selects "Business" during registration
3. User is redirected to the onboarding flow
4. User completes all steps of the onboarding wizard
5. Business profile is created
6. User is redirected to their business dashboard

## OAuth Integration

The system handles users coming from OAuth providers (like Google) by:

1. Creating a profile for them if they're new
2. Checking if they're a business that needs to complete onboarding
3. Redirecting them to the appropriate page based on their status

## Data Persistence

Onboarding data is persisted in browser local storage, allowing users to:
- Leave and return to the onboarding process later
- Refresh the page without losing progress
- Navigate between steps without losing data

## Mobile Optimization

The onboarding flow is fully responsive and optimized for mobile devices:
- Step indicators adapt to smaller screens
- Form layouts adjust for touch interactions
- Image uploads work on mobile browsers

## Future Improvements

- **Service package creation** - Allow creation of service packages during onboarding
- **Staff management** - Add staff management during or after onboarding
- **Custom fields** - Add business category-specific custom fields
- **Import from other platforms** - Allow importing business data from other platforms

## Integration Points

- **Auth System** - Integrates with the auth system for user management
- **Storage** - Uses Supabase Storage for file uploads
- **Database** - Creates records in businesses, profiles, and related tables
- **Dashboard** - Redirects to the business dashboard upon completion

## Usage

To use this module in other parts of the application:

```tsx
// Navigate to the business onboarding page
router.push('/onboarding/business');

// Check if a user has completed business onboarding
const { isBusinessUser, onboardingCompleted } = 
  await BusinessOnboardingService.getOnboardingStatus();

// Get the user's business profile
const business = await BusinessOnboardingService.getBusinessProfile();
``` 