import { apiErrorHandler } from '@/lib/error/error-handler';
import { logError } from '@/lib/error/error-logger';
import { ServiceServiceStatic as ServiceService } from '@/lib/supabase/services/service/service.service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const services = await ServiceService.getAll();
    return NextResponse.json({ services });
  } catch (error: any) {
    await logError(error, undefined, { route: 'GET /api/services' });
    const { body, status } = apiErrorHandler(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newService = await ServiceService.create(body);
    return NextResponse.json({ service: newService });
  } catch (error: any) {
    await logError(error, undefined, { 
      route: 'POST /api/services',
      requestBody: await request.clone().text().catch(() => 'Could not read body')
    });
    const { body, status } = apiErrorHandler(error);
    return NextResponse.json(body, { status });
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
    await logError(error, undefined, { 
      route: 'PUT /api/services',
      requestParams: new URL(request.url).searchParams.toString(),
      requestBody: await request.clone().text().catch(() => 'Could not read body')
    });
    const { body, status } = apiErrorHandler(error);
    return NextResponse.json(body, { status });
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
    await logError(error, undefined, { 
      route: 'DELETE /api/services',
      requestParams: new URL(request.url).searchParams.toString()
    });
    const { body, status } = apiErrorHandler(error);
    return NextResponse.json(body, { status });
  }
}
