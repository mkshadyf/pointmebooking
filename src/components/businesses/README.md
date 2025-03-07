# Businesses Module

This module contains components related to business profiles and listings in the PointMe application.

## Components

### BusinessCard

The `BusinessCard` component displays information about a business in a card format, including:

- Business logo/image
- Business name and description
- Location information
- Category indicators
- Contact options

**Features:**
- Responsive design for different screen sizes
- Image optimization with proper loading strategy
- Rating display (if available)
- Category badge

## Usage

```tsx
import { BusinessCard } from '@/components/businesses';

// Basic usage
<BusinessCard business={business} />

// With event handlers
<BusinessCard 
  business={business}
  onClick={handleBusinessClick}
  onContactClick={handleContactClick}
/>
```

## Data Requirements

The businesses components expect a `Business` or `BusinessProfile` type from `@/types` which includes:

- Basic business information (name, description)
- Contact information
- Location details
- Visual assets (logo, cover image)
- Category information

## Styling

Businesses components use Tailwind CSS for styling with:

- Consistent card design with the application style
- Proper spacing and layout
- Responsive behavior for various screen sizes
- Hover and interactive states

## Best Practices

- Use proper image optimization for business images
- Implement loading states for async data fetching
- Display meaningful fallback content when data is missing
- Handle business data validation before rendering
- Keep business card components reusable across the application
- Maintain accessibility for all interactive elements

## Integration

Business components integrate with:

- Auth system for business-specific actions
- Services module for displaying related services
- Search functionality to find businesses
- Map displays (where applicable) for business locations 