import { AuthProfile } from '@/types/database/auth';
import { Database } from '@/types/database/generated.types';
import { ProfileService } from './profile/profile.service';

// Define DbProfile type from Database
type DbProfile = Database['public']['Tables']['profiles']['Row'];

// Export the singleton instance
export const profileService = ProfileService.getInstance();

/**
 * Static wrapper for backward compatibility
 * Delegates to the singleton instance
 */
export class ProfileServiceStatic {
  static async updateProfile(id: string, data: Partial<AuthProfile>): Promise<DbProfile> {
    return profileService.updateProfile(id, data);
  }

  static async getAll() {
    return profileService.getAll();
  }

  static async getById(id: string) {
    return profileService.getById(id);
  }

  static async getByEmail(email: string) {
    return profileService.getByEmail(email);
  }

  static async create(profile: DbProfile) {
    return profileService.create(profile);
  }

  static async updateEmail(id: string, email: string) {
    return profileService.updateEmail(id, email);
  }

  static async getBusinesses() {
    return profileService.getBusinesses();
  }

  static async getBusinessesByCategory(categoryId: string) {
    return profileService.getBusinessesByCategory(categoryId);
  }

  static async searchBusinesses(query: string) {
    return profileService.searchBusinesses(query);
  }

  static async verifyEmail(id: string, code: string) {
    return profileService.verifyEmail(id, code);
  }

  static async completeOnboarding(id: string) {
    return profileService.completeOnboarding(id);
  }

  static async uploadAvatar(id: string, file: File) {
    return profileService.uploadAvatar(id, file);
  }

  static async uploadBusinessLogo(id: string, file: File) {
    return profileService.uploadBusinessLogo(id, file);
  }
} 