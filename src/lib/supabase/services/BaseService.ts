import { Database } from '@/types/database/generated.types';
import { SupabaseClient } from '@supabase/supabase-js';

type TableName = keyof Database['public']['Tables'];
type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];
type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type Update<T extends TableName> = Database['public']['Tables'][T]['Update'];

export abstract class BaseService<T extends TableName> {
  constructor(
    protected readonly client: SupabaseClient<Database>,
    protected readonly table: T
  ) {}

  protected async handleError(error: unknown): Promise<never> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(errorMessage);
  }

  async getAll(): Promise<Row<T>[]> {
    try {
      const { data, error } = await this.client
        .from(this.table)
        .select('*');

      if (error) throw error;
      return data as unknown as Row<T>[];
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getById(id: string): Promise<Row<T>> {
    try {
      const { data, error } = await this.client
        .from(this.table)
        .select('*')
        .eq('id', id as any)
        .single();

      if (error) throw error;
      return data as unknown as Row<T>;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async create(data: Insert<T>): Promise<Row<T>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: created, error } = await this.client
        .from(this.table)
        .insert(data as unknown as any)
        .select()
        .single();

      if (error) throw error;
      return created as unknown as Row<T>;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(id: string, data: Update<T>): Promise<Row<T>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated, error } = await this.client
        .from(this.table)
        .update(data as unknown as any)
        .eq('id', id as any)
        .select()
        .single();

      if (error) throw error;
      return updated as unknown as Row<T>;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(this.table)
        .delete()
        .eq('id', id as any);

      if (error) throw error;
      return true;
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async exists(id: string): Promise<boolean> {
    try {
      const { count, error } = await this.client
        .from(this.table)
        .select('*', { count: 'exact', head: true })
        .eq('id', id as any);

      if (error) throw error;
      return (count ?? 0) > 0;
    } catch (error) {
      return this.handleError(error);
    }
  }
}