import { Service } from '@/types';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getService(id: string): Promise<Service | null> {
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  try {
    const { data, error } = await supabase
      .from('service_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) return null;

    return {
      id: data.id,
      business_id: data.business_id,
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      category_id: data.category_id,
      image_url: data.image_url,
      status: data.status || 'active',
      is_available: data.is_available,
      created_at: data.created_at,
      updated_at: data.updated_at,
      business: {
        id: data.business_id,
        name: data.business_name,
        description: data.business_description,
        address: data.business_address,
        city: data.business_city,
        phone: data.business_phone,
        email: data.business_email,
        logo_url: data.business_logo_url,
      },
      category: {
        name: data.category_name,
        icon: data.category_icon
      }
    };
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

export async function createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service | null> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data, error } = await supabase
      .from('services')
      .insert([{
        ...service,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        business:businesses (
          id,
          business_name,
          address,
          city,
          state,
          phone,
          email,
          logo_url
        ),
        category:categories (
          id,
          name,
          icon
        )
      `)
      .single();

    if (error) throw error;

    if (!data) return null;

    return {
      id: data.id,
      business_id: data.business_id,
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      category_id: data.category_id,
      image_url: data.image_url,
      status: data.status,
      is_available: data.is_available,
      created_at: data.created_at,
      updated_at: data.updated_at,
      business: data.business ? {
        id: data.business.id,
        name: data.business.business_name,
        address: data.business.address,
        city: data.business.city,
        state: data.business.state,
        phone: data.business.phone,
        email: data.business.email,
        logo_url: data.business.logo_url,
      } : undefined,
      category: data.category ? {
        name: data.category.name,
        icon: data.category.icon
      } : undefined
    };
  } catch (error) {
    console.error('Error creating service:', error);
    return null;
  }
}

export async function updateService(id: string, service: Partial<Service>): Promise<Service | null> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data, error } = await supabase
      .from('services')
      .update(service)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating service:', error);
    return null;
  }
}

export async function deleteService(id: string): Promise<boolean> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting service:', error);
    return false;
  }
}

export async function getFeaturedServices(): Promise<Service[]> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Add artificial delay in development
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Get services first
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    if (servicesError) {
      console.error('Error fetching services:', servicesError);
      return [];
    }

    if (!services || services.length === 0) {
      console.log('No services found');
      return [];
    }

    // Get businesses for these services
    const businessIds = [...new Set(services.map(s => s.business_id))];
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('*')
      .in('id', businessIds);

    if (businessesError) {
      console.error('Error fetching businesses:', businessesError);
    }

    // Get categories for these services
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      console.error('Categories error details:', JSON.stringify(categoriesError, null, 2));
    }

    if (!categories) {
      console.log('No categories found');
    } else {
      console.log('Found categories:', categories.length);
    }

    // Map the data together
    return services.map(service => {
      const business = businesses?.find(b => b.id === service.business_id);
      const category = categories?.find(c => c.id === service.category_id);

      // Log if category not found for a service
      if (service.category_id && !category) {
        console.log(`No matching category found for service ${service.id} with category_id ${service.category_id}`);
      }

      return {
        id: service.id,
        business_id: service.business_id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category_id: service.category_id,
        image_url: service.image_url,
        status: service.status || 'active',
        is_available: service.is_available,
        created_at: service.created_at,
        updated_at: service.updated_at,
        business: business ? {
          id: business.id,
          name: business.business_name || business.name,
          address: business.address,
          city: business.city,
          state: business.state,
          phone: business.phone,
          email: business.email,
          logo_url: business.logo_url,
        } : undefined,
        category: category ? {
          name: category.name,
          icon: category.icon
        } : undefined
      };
    });
  } catch (error) {
    console.error('Error in getFeaturedServices:', error);
    return [];
  }
}

export async function getServicesByBusiness(businessId: string): Promise<Service[]> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        business:businesses (
          id,
          business_name,
          address,
          city,
          state,
          phone,
          email,
          logo_url
        ),
        category:categories (
          id,
          name,
          icon
        )
      `)
      .eq('business_id', businessId)
      .eq('status', 'active');

    if (error) throw error;

    return services.map((item: any) => ({
      id: item.id,
      business_id: item.business_id,
      name: item.name,
      description: item.description,
      price: item.price,
      duration: item.duration,
      category_id: item.category_id,
      image_url: item.image_url,
      status: item.status,
      is_available: item.is_available,
      created_at: item.created_at,
      updated_at: item.updated_at,
      business: item.business ? {
        id: item.business.id,
        name: item.business.business_name,
        address: item.business.address,
        city: item.business.city,
        state: item.business.state,
        phone: item.business.phone,
        email: item.business.email,
        logo_url: item.business.logo_url,
      } : undefined,
      category: item.category ? {
        name: item.category.name,
        icon: item.category.icon
      } : undefined
    }));
  } catch (error) {
    console.error('Error fetching services by business:', error);
    return [];
  }
}
