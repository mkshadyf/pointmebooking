import { ServiceService } from '@/lib/supabase/services/service.service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const services = await ServiceService.getAll();
    return NextResponse.json({ services });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch services.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newService = await ServiceService.create(body);
    return NextResponse.json({ service: newService });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create service.' }, { status: 500 });
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
