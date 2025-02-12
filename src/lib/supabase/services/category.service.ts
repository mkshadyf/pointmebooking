import { supabase } from '../client';
import { Database } from '../types/database';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export class CategoryService {
  static async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*, parent:categories(*)')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*, parent:categories(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getChildren(parentId: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async getRootCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async create(category: CategoryInsert) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select('*, parent:categories(*)')
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: CategoryUpdate) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select('*, parent:categories(*)')
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    // Check if category has children
    const children = await this.getChildren(id);
    if (children.length > 0) {
      throw new Error('Cannot delete category with children');
    }

    // Check if category has services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .eq('category_id', id);

    if (servicesError) throw servicesError;
    if (services.length > 0) {
      throw new Error('Cannot delete category with services');
    }

    // Delete category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  static async getCategoryTree() {
    // Get all categories
    const categories = await this.getAll();
    
    // Build tree
    const buildTree = (parentId: string | null = null): Category[] => {
      return categories
        .filter(category => category.parent_id === parentId)
        .map(category => ({
          ...category,
          children: buildTree(category.id),
        }));
    };

    return buildTree();
  }

  static async search(query: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*, parent:categories(*)')
      .textSearch('name', query, {
        type: 'websearch',
        config: 'english',
      })
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async getWithServiceCount() {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        services:services(count),
        parent:categories(*)
      `)
      .order('name', { ascending: true });

    if (error) throw error;
    return data.map(category => ({
      ...category,
      service_count: category.services?.[0]?.count ?? 0,
    }));
  }
} 