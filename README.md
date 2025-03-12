# PointMe! Booking System

A modern booking system built with Next.js, React, and Supabase.

## Features

- User Authentication (Email and Google Sign-in)
- Business and Customer Dashboards
- Service Management
- Booking Management
- Real-time Updates
- Responsive Design

## Tech Stack

- **Frontend**: Next.js 13+, React, TailwindCSS
- **Backend**: Supabase
- **State Management**: Zustand
- **UI Components**: Headless UI
- **Styling**: TailwindCSS
- **Notifications**: React Hot Toast

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_SECRET=your_service_role_secret
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (app)/             # Protected routes
│   ├── (auth)/            # Authentication routes
│   └── api/               # API routes
├── components/            # Reusable components
├── context/               # React context
├── hooks/                 # Custom React hooks
│   ├── auth/              # Authentication hooks
│   └── ...                # Other hooks
├── lib/                   # Utilities and store
│   ├── core/              # Core functionality
│   ├── error/             # Error handling utilities
│   ├── supabase/          # Supabase services
│   └── ...                # Other utilities
└── types/                 # TypeScript types
```

## Authentication System

The project uses a comprehensive authentication system built on top of Supabase Auth:

- **Authentication Hooks**: 
  - `useAuth`: The main hook for all authentication operations
  - Backward compatibility maintained for legacy code

- **Error Handling**:
  - Consistent error handling across all authentication flows
  - User-friendly error messages

- **Loading States**:
  - Visual feedback during authentication operations
  - Operation-specific loading messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Development Practices

- **TypeScript**: Strict type checking enabled
- **CI/CD**: Automated checks for TypeScript errors and linting
- **Conventional Commits**: Use semantic commit messages
- **Documentation**: Keep documentation updated with code changes

## License

MIT
