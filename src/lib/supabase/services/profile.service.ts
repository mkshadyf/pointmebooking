import { AuthProfile } from '@/types/database/auth';
import { supabase } from '../client';
import { DbProfile } from '../types';
import { BaseService } from './BaseService';

export class ProfileService extends BaseService<'profiles'> {
  constructor() {
    super(supabase, 'profiles');
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
      return {
        ...profile,
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString(),
        working_hours: profile.working_hours || {},
        preferences: profile.preferences || {},
        social_media: profile.social_media || {}
      } as DbProfile;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAll() {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getByEmail(email: string) {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }

  async create(profile: DbProfile) {
    const { data, error } = await this.client
      .from(this.table)
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEmail(id: string, email: string) {
    const { error } = await this.client.auth.updateUser({ email });
    if (error) throw error;

    return this.update(id, { email });
  }

  async getBusinesses() {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('role', 'business')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getBusinessesByCategory(categoryId: string) {
    const { data, error } = await this.client
      .from(this.table)
      .select('*, services!inner(*)')
      .eq('role', 'business')
      .eq('services.category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async searchBusinesses(query: string) {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('role', 'business')
      .textSearch('business_name', query, {
        type: 'websearch',
        config: 'english',
      })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async verifyEmail(id: string, code: string) {
    const { data, error } = await this.client
      .from(this.table)
      .select('verification_code, verification_attempts')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Check verification code
    if (data.verification_code !== code) {
      // Increment attempts
      await this.update(id, {
        verification_attempts: (data.verification_attempts || 0) + 1,
      });
      throw new Error('Invalid verification code');
    }

    // Mark email as verified
    return this.update(id, {
      email_verified: true,
      verification_code: undefined,
      verification_attempts: 0,
    });
  }

  async completeOnboarding(id: string) {
    return this.update(id, { onboarding_completed: true });
  }

  async uploadAvatar(id: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file
    const { error: uploadError } = await this.client.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = this.client.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile
    return this.update(id, { avatar_url: data.publicUrl });
  }

  async uploadBusinessLogo(id: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Upload file
    const { error: uploadError } = await this.client.storage
      .from('logos')
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = this.client.storage
      .from('logos')
      .getPublicUrl(filePath);

    // Update profile with logo_url instead of business_logo
    return this.update(id, { logo_url: data.publicUrl });
  }
}

export const profileService = new ProfileService(); 