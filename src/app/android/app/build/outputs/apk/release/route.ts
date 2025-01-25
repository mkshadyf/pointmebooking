import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const apkPath = path.join(process.cwd(), 'android/app/build/outputs/apk/release/app-release.apk');
    
    try {
      const apkBuffer = await readFile(apkPath);
      return new NextResponse(apkBuffer, {
        headers: {
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Disposition': 'attachment; filename="app-release.apk"'
        }
      });
    } catch (error) {
      console.log('APK file not found:', error);
      return NextResponse.json(
        { error: 'APK file not available' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error serving APK:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
