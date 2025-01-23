# Building the PointMe Android App

This guide explains how to build the PointMe app as a native Android APK using Trusted Web Activities (TWA).

## Prerequisites

1. Node.js and npm installed
2. Java Development Kit (JDK) 8 or newer
3. Android SDK installed (can be installed via Android Studio)
4. Bubblewrap CLI (installed automatically via npm)

## Setup

1. First, ensure you have all dependencies installed:
```bash
npm install
```

2. Make sure your environment variables are set:
- `JAVA_HOME` pointing to your JDK installation
- `ANDROID_HOME` pointing to your Android SDK installation

## Building the APK

1. Run the build command:
```bash
npm run build:apk
```

This will:
- Build the Next.js application
- Initialize the TWA project
- Generate a keystore for signing the APK
- Build the final APK

The APK will be available in the `android/app/build/outputs/apk` directory.

## Testing the APK

1. Enable "Install from Unknown Sources" on your Android device
2. Transfer the APK to your device
3. Install and test the app

## Publishing to Play Store

1. Create a Google Play Developer account
2. Create a new app in the Play Console
3. Upload the signed APK
4. Fill in the store listing details
5. Submit for review

## Troubleshooting

If you encounter any issues:

1. Ensure all prerequisites are properly installed
2. Check that your `JAVA_HOME` and `ANDROID_HOME` are correctly set
3. Try deleting the `android` directory and rebuilding
4. Check the logs in `android/app/build/outputs/logs`

## Notes

- The app uses TWA to wrap the PWA in a native Android container
- The app will automatically update when the PWA is updated
- Push notifications work through the native Android system
- The app has full access to Android features through the PWA APIs
