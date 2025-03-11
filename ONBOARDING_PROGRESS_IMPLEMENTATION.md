# Server-Side Onboarding Progress Implementation

This document outlines the implementation of server-side storage for business onboarding progress in the PointMe application.

## Overview

Previously, the business onboarding process relied solely on local storage for saving progress, which had several limitations:
- Progress was tied to the browser/device
- Data could be lost if local storage was cleared
- No synchronization between devices
- Limited persistence (7-day expiration)

The new implementation adds server-side storage while maintaining local storage as a fallback mechanism, providing a more robust and user-friendly experience.

## Implementation Details

### Database Changes

A new `onboarding_progress` table has been added to store onboarding progress data:

```sql
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (business_id, step_number)
);
```

The table includes:
- A unique constraint on `(business_id, step_number)` to ensure only one record per step per business
- Row-level security policies to ensure data access control
- Automatic timestamp updates via a trigger

### Service Layer Changes

The `BusinessOnboardingService` has been extended with methods to:
- Save onboarding progress for a specific step
- Retrieve progress for a specific step
- Retrieve all progress for a business
- Delete progress for a specific step

```typescript
// New methods in BusinessOnboardingService
saveOnboardingProgress(businessId: string, stepNumber: number, data: Record<string, any>): Promise<OnboardingProgressResponse>
getOnboardingProgressForStep(businessId: string, stepNumber: number): Promise<OnboardingProgressResponse>
getAllOnboardingProgress(businessId: string): Promise<OnboardingProgressResponse>
deleteOnboardingProgress(businessId: string, stepNumber: number): Promise<OnboardingProgressResponse>
```

### Hook Changes

The `useBusinessOnboarding` hook has been updated to:
- Accept a `businessId` parameter to identify the business
- Save progress to the server when step data is updated
- Load progress from the server on initialization
- Provide explicit methods for saving and loading progress
- Maintain backward compatibility with the existing API endpoints

### Component Changes

The `BusinessOnboardingWizard` component has been updated to:
- Use the server-side storage methods from the hook
- Implement auto-saving of progress every 2 minutes
- Use local storage as a fallback when server storage fails or is unavailable
- Provide improved user feedback about where progress is saved

## Usage

The onboarding process now works as follows:

1. When a user starts the onboarding process, the component attempts to load any existing progress from the server
2. If server loading fails or no data exists, it falls back to local storage
3. As the user progresses through the steps:
   - Progress is automatically saved to the server (if a business ID is available)
   - Progress is periodically auto-saved every 2 minutes
   - The "Save Progress & Exit" button explicitly saves to the server before redirecting
4. If server saving fails, progress is saved to local storage as a fallback

## Benefits

This implementation provides several benefits:
- Persistence across devices and browsers
- No data loss if local storage is cleared
- Improved user experience with automatic progress saving
- Graceful degradation to local storage when offline or when server errors occur
- Better security through row-level security policies

## Migration

Existing users with progress in local storage will have their data migrated to the server when they next use the onboarding process, as long as they are logged in and have a business ID.

## Future Improvements

Potential future improvements include:
- Adding conflict resolution for cases where both local and server data exist
- Implementing offline support with background synchronization
- Adding progress expiration policies for incomplete onboarding data
- Enhancing analytics to track onboarding completion rates and drop-off points 