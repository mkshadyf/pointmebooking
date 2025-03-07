# Directory Structure Reorganization Plan

This document outlines a comprehensive plan for reorganizing the directory structure to improve maintainability and reduce redundancy.

## Current Issues

1. **Scattered Authentication Logic**: Auth-related code is spread across multiple directories:
   - `src/hooks/auth/`
   - `src/hooks/supabase/auth/`
   - `src/lib/supabase/auth/`
   - `src/lib/supabase/hooks/`

2. **Inconsistent Service Organization**: Services are not organized by domain or functionality.

3. **Redundant Hooks Implementations**: Multiple implementations of the same hooks in different locations.

4. **Unclear Boundaries**: No clear separation between client/server code and between different domains.

## Target Directory Structure

```
src/
├── lib/
│   ├── supabase/
│   │   ├── services/           # All singleton services
│   │   │   ├── auth/           # Auth-related services
│   │   │   ├── business/       # Business-related services
│   │   │   ├── booking/        # Booking-related services
│   │   │   ├── admin/          # Admin-related services
│   │   │   ├── core/           # Core infrastructure services (like SupabaseClientService)
│   │   │   └── index.ts        # Exports all services
│   │   ├── client.ts           # Exports SupabaseClientService (with deprecation notice)
│   │   └── types/              # Supabase-specific types
│   ├── auth/                   # Consolidated auth utilities
│   │   ├── context/            # Auth context provider
│   │   ├── guards/             # Auth guards and protections
│   │   └── errors/             # Auth error handling
│   └── error/                  # Error handling utilities
├── hooks/                      # Application hooks
│   ├── auth/                   # Auth hooks (single source of truth)
│   ├── business/               # Business hooks
│   ├── booking/                # Booking hooks
│   ├── ui/                     # UI-related hooks
│   └── core/                   # Core utility hooks
└── components/                 # React components
    ├── auth/                   # Auth components
    ├── business/               # Business components
    └── booking/                # Booking components
```

## Migration Steps

### Step 1: Create Core Infrastructure

1. Create `src/lib/supabase/services/core/supabase-client.service.ts`
2. Update `src/lib/supabase/client.ts` to export from the new service with deprecation notice

### Step 2: Reorganize Services by Domain

1. Create domain-specific directories under `src/lib/supabase/services/`:
   - `auth/`
   - `business/`
   - `booking/`
   - `admin/`
   - `core/`

2. Move services to their appropriate domains:
   - Move `auth.service.ts` to `auth/auth.service.ts`
   - Move `business-*.service.ts` to `business/`
   - Move `booking.service.ts` to `booking/`
   - Move `admin.service.ts` to `admin/`

3. Create index.ts files in each domain directory to export all services

### Step 3: Consolidate Auth Utilities

1. Move `src/lib/supabase/auth/context/` to `src/lib/auth/context/`
2. Move `src/lib/supabase/auth/guards/` to `src/lib/auth/guards/`
3. Move `src/lib/supabase/auth/errors/` to `src/lib/auth/errors/`
4. Update imports across the codebase

### Step 4: Consolidate Hooks

1. Ensure `src/hooks/auth/useAuth.ts` is the single source of truth
2. Create compatibility layers in other locations that re-export from the canonical location
3. Add deprecation notices to all compatibility layers

### Step 5: Clean Up Redundant Directories

1. After all files are moved and imports updated, remove empty directories
2. Remove redundant index.ts files

## Implementation Timeline

### Week 1: Core Infrastructure
- Implement SupabaseClientService
- Update client.ts with deprecation notice
- Create domain directories under services/

### Week 2: Service Reorganization
- Move services to domain-specific directories
- Create index.ts files for each domain
- Update imports

### Week 3: Auth Consolidation
- Move auth utilities to src/lib/auth/
- Consolidate hooks
- Create compatibility layers

### Week 4: Cleanup and Testing
- Remove empty directories
- Remove redundant files
- Comprehensive testing

## Success Criteria

1. **Clear Domain Boundaries**: Each domain has its own directory with related services
2. **Single Source of Truth**: One canonical implementation for each piece of functionality
3. **Consistent Patterns**: All services follow the singleton pattern
4. **Reduced Duplication**: No duplicate implementations of the same functionality
5. **Improved Developer Experience**: Clear import paths and organization 