import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Check if we're in production (Vercel)
    if (process.env.VERCEL) {
      return new NextResponse('APK not available in production environment', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    const apkPath = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    
    try {
      await fs.access(apkPath);
    } catch (error) {
      return new NextResponse('APK file not found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    const apkFile = await fs.readFile(apkPath);
    
    return new NextResponse(apkFile, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="app-release.apk"',
      },
    });
  } catch (error) {
    console.error('Error serving APK:', error);
    return new NextResponse('Error serving APK file', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
