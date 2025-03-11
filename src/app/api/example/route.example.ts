import { ErrorService } from '@/lib/core/error';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Example API route handler updated to use the new ErrorService
 */
export async function GET(request: NextRequest) {
  try {
    // Your API logic here
    const data = { message: 'Success' };
    
    return NextResponse.json(data);
  } catch (error) {
    // Log the error using the new ErrorService
    ErrorService.handleError(error, {
      context: 'API Route',
      additionalData: {
        path: request.nextUrl.pathname,
        method: request.method,
      },
    });
    
    // Return an appropriate error response
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Your API logic here
    const data = { message: 'Created successfully', id: '123' };
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    // Log the error using the new ErrorService
    const normalizedError = ErrorService.handleError(error, {
      context: 'API Route',
      additionalData: {
        path: request.nextUrl.pathname,
        method: request.method,
      },
    });
    
    // Determine the appropriate status code based on the error
    const status = normalizedError.message.includes('not found') ? 404 : 
                  normalizedError.message.includes('invalid') ? 400 : 500;
    
    // Return an appropriate error response
    return NextResponse.json(
      { error: normalizedError.message || 'An error occurred processing your request' },
      { status }
    );
  }
} 