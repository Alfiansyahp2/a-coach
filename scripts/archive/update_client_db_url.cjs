const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'src', 'lib', 'db', 'client.ts');
let c = fs.readFileSync(filePath, 'utf8');

const target = "const databaseUrl = process.env.DATABASE_URL;";
const replacement = "const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/sport_training';";

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Successfully updated client.ts databaseUrl fallback');
} else {
  console.error('Target not found in client.ts');
}
