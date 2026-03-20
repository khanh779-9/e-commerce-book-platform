import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load environment variables for Angular build.
 * Reads .env (development) or .env.production (production) based on NG_BUILD_MODE.
 * Outputs a define object for Angular's builder.
 */

// Determine mode: 'production' | 'development'
const mode = process.env['NG_BUILD_MODE'] || 'development';
const envFile = mode === 'production' ? '.env.production' : '.env';
const envPath = path.resolve(process.cwd(), envFile);

// Load .env file if exists
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn(`⚠️  Failed to load ${envFile}:`, result.error.message);
  } else {
    console.log(`✅ Loaded ${envFile} for ${mode} build`);
  }
} else {
  console.warn(`⚠️  ${envFile} not found at ${envPath}, using defaults`);
}

// Build define object with JSON-stringified values
const define = {
  'ng.env.PORT': JSON.stringify(process.env['PORT'] || '5000'),
  'ng.env.FRONTEND_URL_DEV': JSON.stringify(process.env['FRONTEND_URL_DEV'] || 'http://localhost:4200'),
  'ng.env.FRONTEND_URL_SSR': JSON.stringify(process.env['FRONTEND_URL_SSR'] || 'http://localhost:5000'),
  'ng.env.BACKEND_URL': JSON.stringify(process.env['BACKEND_URL'] || 'http://localhost:5132'),
};

// Log for debugging
console.log('🔧 Angular define:', JSON.stringify(define, null, 2));

export default define;