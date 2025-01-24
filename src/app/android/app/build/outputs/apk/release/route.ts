import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const apkPath = path.join(process.cwd(), 'android/app/build/outputs/apk/release/app-release.apk');
    const apkBuffer = await readFile(apkPath);

    return new NextResponse(apkBuffer, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename=pointme.apk'
      }
    });
  } catch (error: unknown) {
    // If APK not found, redirect to Play Store
    console.error('Failed to serve APK:', error);
    return NextResponse.redirect('https://play.google.com/store/apps/details?id=com.pointme.app', {
      status: 302
    });
  }
}
