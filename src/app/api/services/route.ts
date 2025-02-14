import { createRouteHandler } from '@/lib/api/route-handler';
import { ServiceService } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';


export const POST = createRouteHandler(
  async (req: NextRequest, supabase) => {
    const body = await req.json();
    const { data, error } = await supabase
      .from('services')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return Response.json(data);
  },
  { requireAuth: true, roles: ['business'] }
);

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
