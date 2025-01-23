import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure the android directory exists
const androidDir = path.join(__dirname, '..', 'android');
if (!fs.existsSync(androidDir)) {
  fs.mkdirSync(androidDir);
}

// Install bubblewrap if not already installed
try {
  execSync('bubblewrap --version');
} catch {
  console.log('Installing @bubblewrap/cli...');
  execSync('npm install -g @bubblewrap/cli');
}

// Initialize TWA project
console.log('Initializing TWA project...');
execSync('bubblewrap init --manifest https://pointme.app/manifest.json');

// Update app signing key
console.log('Generating keystore...');
execSync('keytool -genkey -v -keystore android.keystore -alias pointme -keyalg RSA -keysize 2048 -validity 10000');

// Build the APK
console.log('Building APK...');
execSync('bubblewrap build');

console.log('APK build complete! Check the android/app/build/outputs/apk directory for your APK files.');
