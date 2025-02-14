import { supabase } from '../client';
import { Database } from '../types/database';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class ProfileService {
  static async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(profile: ProfileInsert) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateEmail(id: string, email: string) {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw error;

    return this.update(id, { email });
  }

  static async getBusinesses() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'business')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getBusinessesByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, services!inner(*)')
      .eq('role', 'business')
      .eq('services.category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async searchBusinesses(query: string) {
    const { data, error } = await supabase
      .from('profiles')
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

  static async verifyEmail(id: string, code: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('verification_code, verification_attempts, last_verification_attempt')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Check verification code
    if (data.verification_code !== code) {
      // Increment attempts
      await this.update(id, {
        verification_attempts: (data.verification_attempts || 0) + 1,
        last_verification_attempt: new Date().toISOString(),
      });
      throw new Error('Invalid verification code');
    }

    // Mark email as verified
    return this.update(id, {
      email_verified: true,
      verification_code: undefined,
      verification_attempts: 0,
      last_verification_attempt: undefined,
    });
  }

  static async completeOnboarding(id: string) {
    return this.update(id, { onboarding_completed: true });
  }

  static async uploadAvatar(id: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile
    return this.update(id, { avatar_url: data.publicUrl });
  }

  static async uploadBusinessLogo(id: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);

    // Update profile
    return this.update(id, { business_logo: data.publicUrl });
  }
} 