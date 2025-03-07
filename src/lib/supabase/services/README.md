/*
 * UPDATED ARCHITECTURE NOTICE:
 * - Authentication hooks have been consolidated into the AuthService singleton.
 * - Supabase client usage is now managed via the SupabaseClientService singleton.
 * - Deprecated and redundant files have been removed as per the cleanup and deletion plan.
 */

# Pointme Services Architecture

This directory contains the service layer for the Pointme application, which handles all interactions with the Supabase backend.

## Service Organization

The services are organized into the following categories:

### Base Services

- **BaseService**: Abstract base class for all services that interact with Supabase tables
- **BaseServiceUtils**: Utility class with retry logic and error handling
- **BaseSearchService**: Base class for search-related services
- **BaseEmailService**: Base class for email-related services

### Auth and User Services

- **AuthService**: Handles user authentication and registration
- **ProfileService**: Manages user profiles
- **SessionService**: Manages user sessions

### Business and Service Related Services

- **BusinessOnboardingService**: Handles business onboarding workflow
- **ServiceService**: Manages services offered by businesses
- **BusinessCategoryService**: Manages business categories
- **ServiceCategoryService**: Manages service categories
- **AdminService**: Handles admin-specific operations

### Booking Related Services

- **BookingService**: Manages customer bookings
- **ScheduleService**: Manages business schedules and availability

### Utility Services

- **EmailService**: Handles email sending
- **SearchService**: Provides search functionality
- **AnalyticsService**: Provides analytics data
- **ServerEmailService**: Server-side email functionality

## Service Implementation Patterns

### Singleton Pattern

All services now follow the singleton pattern to ensure a single instance is used throughout the application:

```typescript
export class ExampleService extends BaseService<'example_table'> {
  private static instance: ExampleService;

  private constructor() {
    super(supabase, 'example_table');
  }

  public static getInstance(): ExampleService {
    if (!ExampleService.instance) {
      ExampleService.instance = new ExampleService();
    }
    return ExampleService.instance;
  }
  
  // Instance methods...
}

// Export the singleton instance
export const exampleService = ExampleService.getInstance();
```

### Static Wrapper for Backward Compatibility

For backward compatibility, all services also provide a static wrapper class:

```typescript
// Static wrapper for backward compatibility
export class ExampleServiceStatic {
  static async someMethod(param: string): Promise<Result> {
    return exampleService.someMethod(param);
  }
  
  // Other static methods...
}

// Export the static wrapper with the original service name
export { ExampleServiceStatic as ExampleService };
```

This allows existing code to continue using the static methods while new code can use the singleton instance.

## Refactored Services

The following services have been refactored to use the singleton pattern:

1. **ServiceService** → `serviceService` singleton and `ServiceServiceStatic` wrapper
2. **BusinessOnboardingService** → `businessOnboardingService` singleton and `BusinessOnboardingServiceStatic` wrapper
3. **BookingService** → `bookingService` singleton and `BookingServiceStatic` wrapper
4. **ScheduleService** → `scheduleService` singleton and `ScheduleServiceStatic` wrapper
5. **AdminService** → `adminService` singleton and `AdminServiceStatic` wrapper

## Service Relationships

### Category Hierarchy

1. **Business Categories** (managed by `BusinessCategoryService`)
   - Created and managed by admins
   - Top-level categories for businesses

2. **Businesses** (managed by `BusinessOnboardingService`)
   - Created by business users
   - Linked to a business category

3. **Service Categories** (managed by `ServiceCategoryService`)
   - Created and managed by admins
   - Linked to business categories

4. **Services** (managed by `ServiceService`)
   - Created by business users
   - Linked to service categories and businesses
   - Require admin approval

### Admin Approval Flow

1. Business user creates a service
2. Service is created with `approval_status: 'pending'`
3. Admin reviews pending services using `adminService.getPendingServices()`
4. Admin approves or rejects the service using `adminService.updateServiceApproval()`

## Best Practices

1. **Single Source of Truth**: Each entity should be managed by a single service
2. **Proper Authorization**: Admin operations should use `AdminService`
3. **Caching**: Read operations should use caching where appropriate
4. **Error Handling**: All operations should include proper error handling
5. **Type Safety**: All services should use the generated Supabase types
6. **Singleton Pattern**: Use the singleton pattern for service instances
7. **Inheritance**: Extend BaseService for common database operations
8. **Backward Compatibility**: Maintain static wrappers for backward compatibility

## Usage Examples

### Business Onboarding

```typescript
// Using the singleton instance (recommended)
const categories = await businessOnboardingService.getBusinessCategories();

// Using the static wrapper (backward compatibility)
const categories = await BusinessOnboardingService.getBusinessCategories();

// Create a business profile
const businessData = {
  name: 'My Business',
  business_category: selectedCategoryId,
  // other business data
};
const business = await businessOnboardingService.createBusinessProfile(businessData);
```

### Service Management

```typescript
// Using the singleton instance (recommended)
const service = await serviceService.create({
  name: 'My Service',
  business_id: businessId,
  category_id: serviceCategoryId,
  price: 100,
  duration: 60,
  // other service data
});

// Using the static wrapper (backward compatibility)
const service = await ServiceService.create({
  name: 'My Service',
  business_id: businessId,
  category_id: serviceCategoryId,
  price: 100,
  duration: 60,
  // other service data
});

// Get services for a business
const services = await serviceService.getByBusiness(businessId);
```

### Admin Operations

```typescript
// Using the singleton instance (recommended)
const pendingServices = await adminService.getPendingServices();

// Using the static wrapper (backward compatibility)
const pendingServices = await AdminService.getPendingServices();

// Approve a service
await adminService.updateServiceApproval(serviceId, 'approved', 'Looks good!');

// Create a business category
const category = await adminService.createBusinessCategory({
  name: 'New Category',
  description: 'Description of the category',
  status: 'active'
});
```

### Booking Management

```typescript
// Using the singleton instance (recommended)
const booking = await bookingService.create({
  service_id: serviceId,
  customer_id: customerId,
  start_time: startTime,
  end_time: endTime,
  // other booking data
});

// Using the static wrapper (backward compatibility)
const booking = await BookingService.create({
  service_id: serviceId,
  customer_id: customerId,
  start_time: startTime,
  end_time: endTime,
  // other booking data
});

// Get bookings for a business
const bookings = await bookingService.getByBusiness(businessId);
```

### Schedule Management

```typescript
// Using the singleton instance (recommended)
const schedule = await scheduleService.getStaffSchedule(staffId);

// Using the static wrapper (backward compatibility)
const schedule = await ScheduleService.getStaffSchedule(staffId);

// Update staff schedule
await scheduleService.updateStaffSchedule(staffId, newSchedule);

// Get available slots
const slots = await scheduleService.getAvailableSlots(serviceId, date);
``` 