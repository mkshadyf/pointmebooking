import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import FormData from 'form-data';

// Ensure the android directory exists
const androidDir = path.join(__dirname, '..', 'android');
if (!fs.existsSync(androidDir)) {
  fs.mkdirSync(androidDir);
}

// Read the manifest
const manifestPath = path.join(__dirname, '..', 'twa-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Build the APK using PWABuilder API
async function buildApk() {
  try {
    console.log('Building APK using PWABuilder API...');

    const form = new FormData();
    form.append('manifest', JSON.stringify(manifest));

    const options = {
      hostname: 'pwabuilder-api.azurewebsites.net',
      path: '/api/builder/android',
      method: 'POST',
      headers: form.getHeaders()
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        if (res.statusCode === 200) {
          console.log('APK build request successful');
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            const apkBuffer = Buffer.concat(chunks);
            const apkPath = path.join(androidDir, 'app-release.apk');
            fs.writeFileSync(apkPath, apkBuffer);
            console.log(`APK saved to ${apkPath}`);
            resolve(true);
          });
        } else {
          reject(new Error(`Failed to build APK: ${res.statusCode}`));
        }
      });

      req.on('error', (error) => {
        reject(error);
      });

      form.pipe(req);
    });
  } catch (error) {
    console.error('Error building APK:', error);
    process.exit(1);
  }
}

buildApk();
