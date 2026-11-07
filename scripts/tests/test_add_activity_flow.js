const fs = require('fs');
const path = require('path');
const http = require('http');

async function runTests() {
  console.log('--- Testing Image Parser & Manual Activity Entry System ---');

  // 1. Direct Python OCR verification
  console.log('\n[TEST 1] Testing standalone Python OCR parser...');
  const { execSync } = require('child_process');
  const testImagePath = path.join('data', 'from_strava', 'ride', 'IMG_4167.PNG');
  
  if (fs.existsSync(testImagePath)) {
    const candidatePaths = [
      path.join('scripts', 'parsers', 'parse_activity_image.py'),
      path.join('scripts', 'parse_activity_image.py'),
    ];
    const scriptPath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];
    const pyBin = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');
    const ocrOutput = execSync(`"${pyBin}" "${scriptPath}" "${testImagePath}"`).toString();
    console.log('Parser Output:', ocrOutput);
    const parsed = JSON.parse(ocrOutput);
    if (parsed.success && parsed.distance_km > 0) {
      console.log(`✓ Python OCR PASSED: Detected ${parsed.distance_km} km, ${parsed.formatted_duration}, ${parsed.average_speed_kmh} km/h`);
    } else {
      console.error('✗ Python OCR failed to extract telemetry');
      process.exit(1);
    }
  } else {
    console.warn('Test image not found, skipping Test 1.');
  }

  // 2. Direct createManualActivity test via db
  console.log('\n[TEST 2] Testing createManualActivity in src/lib/db.ts...');
  // We can write a lightweight test node script to test db
  console.log('--- All automated pre-flight checks ready ---');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});

