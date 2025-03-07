# Services Module

This module contains components related to service management and display in the PointMe application.

## Components

### ServiceCard

The `ServiceCard` component is a memoized component that displays a card for a service. It shows:

- Service image with optimized loading
- Service name and description
- Price and duration information
- Business information (if available)
- Booking button

**Features:**
- Performance optimized with React.memo
- Image loading optimization with lazy loading and blur placeholder
- Mobile-responsive design with proper sizing
- Accessibility improvements

### ServiceCardSkeletonGrid

A loading placeholder component that shows a grid of skeleton cards while service data is being loaded.

### ServicesGrid

A component that renders a grid of `ServiceCard` components, handling proper spacing and responsive layout.

## Usage

```tsx
import { ServiceCard, ServicesGrid } from '@/components/services';

// Single service card
<ServiceCard service={service} />

// Grid of services
<ServicesGrid 
  services={services} 
  loading={loading} 
  emptyMessage="No services found"
/>
```

## Types

The services components expect a `Service` type from `@/types` which includes:

- Basic service information (name, description, price, etc.)
- Status information
- Business information (optional)
- Category information (optional)

## Styling

Services components use Tailwind CSS for styling and are consistent with the application's design system. Key style features:

- Responsive card layout
- Hover and transition effects
- Image handling with proper aspect ratios
- Text truncation for long descriptions

## Best Practices

- Use memoization to prevent unnecessary re-renders
- Implement proper image optimization techniques
- Always include accessibility attributes
- Ensure consistent styling across service representations 