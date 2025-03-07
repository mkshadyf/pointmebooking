import { supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';
import { AuthProfile } from '@/types/database/auth';
import { DbProfile } from '../../types/index';
import { BaseService } from '../BaseService';

/**
 * Service for managing user profiles
 * Implements the singleton pattern for consistent instance usage
 */
export class ProfileService extends BaseService<'profiles'> {
  private static instance: ProfileService;

  private constructor() {
    // Get the browser client to pass to the BaseService
    const client = supabaseClientService.getBrowserClient();
    super(client, 'profiles');
  }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  async updateProfile(id: string, data: Partial<AuthProfile>): Promise<DbProfile> {
    try {
      const { data: profile, error } = await this.client
        .from(this.table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return profile as DbProfile;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAll() {
    const { data, error } = await this.client
      .from(this.table)
      .select('*');

    if (error) return this.handleError(error);
    return data as DbProfile[];
  }

  async getById(id: string) {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return this.handleError(error);
    return data as DbProfile;
  }

  async getByEmail(email: string) {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('email', email)
      .single();

    if (error) return this.handleError(error);
    return data as DbProfile;
  }

  async create(profile: DbProfile) {
    const { data, error } = await this.client
      .from(this.table)
      .insert(profile)
      .select()
      .single();

    if (error) return this.handleError(error);
    return data as DbProfile;
  }

  async updateEmail(id: string, email: string) {
    const { data, error } = await this.client
      .from(this.table)
      .update({ email })
      .eq('id', id)
      .select()
      .single();

    if (error) return this.handleError(error);
    return data as DbProfile;
  }

  async getBusinesses() {
    const { data, error } = await this.client
      .from('businesses')
      .select('*');

    if (error) return this.handleError(error);
    return data;
  }

  async getBusinessesByCategory(categoryId: string) {
    const { data, error } = await this.client
      .from('businesses')
      .select('*')
      .eq('business_category', categoryId);

    if (error) return this.handleError(error);
    return data;
  }

  async searchBusinesses(query: string) {
    const { data, error } = await this.client
      .from('businesses')
      .select('*')
      .ilike('name', `%${query}%`);

    if (error) return this.handleError(error);
    return data;
  }

  async verifyEmail(id: string, _code: string) {
    try {
      // Get the profile
      const { error: profileError } = await this.client
        .from(this.table)
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Update the profile to mark email as verified
      const { data, error } = await this.client
        .from(this.table)
        .update({ email_verified: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DbProfile;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async completeOnboarding(id: string) {
    const { data, error } = await this.client
      .from(this.table)
      .update({ onboarding_completed: true })
      .eq('id', id)
      .select()
      .single();

    if (error) return this.handleError(error);
    return data as DbProfile;
  }

  async uploadAvatar(id: string, file: File) {
    try {
      // Upload the file to storage
      const fileName = `avatar-${id}-${Date.now()}`;
      const { error: uploadError } = await this.client.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = this.client.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update the profile with the avatar URL
      const { data, error } = await this.client
        .from(this.table)
        .update({ avatar_url: publicUrl })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DbProfile;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async uploadBusinessLogo(id: string, file: File) {
    try {
      // First, get the business associated with this profile
      const { data: business, error: businessError } = await this.client
        .from('businesses')
        .select('id')
        .eq('owner_profile_id', id)
        .single();

      if (businessError) throw businessError;
      if (!business) throw new Error('No business found for this profile');

      // Upload the file to storage
      const fileName = `logo-${business.id}-${Date.now()}`;
      const { error: uploadError } = await this.client.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = this.client.storage
        .from('logos')
        .getPublicUrl(fileName);

      // Update the business with the logo URL
      const { data, error } = await this.client
        .from('businesses')
        .update({ logo_url: publicUrl })
        .eq('id', business.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

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