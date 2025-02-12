import { SearchService, ServiceService } from '@/lib/supabase/services';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (query) {
      const results = await SearchService.searchServices(query, { category, page, limit });
      return NextResponse.json(results);
    }

    if (category) {
      const services = await ServiceService.getByCategory(category);
      return NextResponse.json({ data: services });
    }

    const services = await ServiceService.getAll();
    return NextResponse.json({ data: services });
  } catch (error) {
    console.error('Error in services API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const service = await ServiceService.create(body);
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error in services API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const service = await ServiceService.update(id, body);
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error in services API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    await ServiceService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in services API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
