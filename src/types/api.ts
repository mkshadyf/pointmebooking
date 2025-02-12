import {
    ErrorSchema,
    loginSchema as LoginRequestSchema,
    PaginationSchema,
    registerSchema as RegisterRequestSchema,
    ServiceResponseSchema,
    profileSchema as UpdateProfileRequestSchema,
    UserResponseSchema,
} from '@/lib/supabase/utils/validators';
import { z } from 'zod';

// Re-export schemas
export {
    ErrorSchema, LoginRequestSchema, PaginationSchema, RegisterRequestSchema, ServiceResponseSchema, UpdateProfileRequestSchema,
    UserResponseSchema
};

// API Response types
export type ApiError = z.infer<typeof ErrorSchema>;
export type PaginationParams = z.infer<typeof PaginationSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type ServiceResponse = z.infer<typeof ServiceResponseSchema>;

// Generic API response type with pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationParams;
}

// API endpoints return types
export interface AuthEndpoints {
  login: {
    request: LoginRequest;
    response: UserResponse;
  };
  register: {
    request: RegisterRequest;
    response: UserResponse;
  };
  profile: {
    response: UserResponse;
  };
  updateProfile: {
    request: UpdateProfileRequest;
    response: UserResponse;
  };
}

// Helper type to extract request/response types
export type RequestType<T extends keyof AuthEndpoints> = AuthEndpoints[T] extends { request: infer R }
  ? R
  : never;

export type ResponseType<T extends keyof AuthEndpoints> = AuthEndpoints[T]['response'];