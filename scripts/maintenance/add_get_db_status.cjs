const fs = require('fs');
const path = require('path');

// 1. Add getDatabaseStatus to src/lib/db/client.ts
const clientFile = path.join(__dirname, '..', 'src', 'lib', 'db', 'client.ts');
let clientContent = fs.readFileSync(clientFile, 'utf8');

const statusFunction = `
export async function getDatabaseStatus(): Promise<{ type: 'PostgreSQL' | 'Local Store'; connected: boolean; info: string }> {
  if (pgPool) {
    try {
      const res = await pgPool.query('SELECT NOW() as current_time');
      return {
        type: 'PostgreSQL',
        connected: true,
        info: \`Connected to PostgreSQL (\${res.rows[0].current_time})\`,
      };
    } catch (err: any) {
      return {
        type: 'PostgreSQL',
        connected: false,
        info: \`Connection error: \${err.message}\`,
      };
    }
  }
  return {
    type: 'Local Store',
    connected: true,
    info: 'Using file-backed atomic store (.data/store.json). Set DATABASE_URL to connect to PostgreSQL.',
  };
}
`;

if (!clientContent.includes('function getDatabaseStatus')) {
  clientContent = clientContent + '\n' + statusFunction;
  fs.writeFileSync(clientFile, clientContent, 'utf8');
  console.log('Added getDatabaseStatus to src/lib/db/client.ts');
}

// 2. Fix type in src/app/page.tsx
const pageFile = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
let pageContent = fs.readFileSync(pageFile, 'utf8');
pageContent = pageContent.replace('prs.map((p) => {', 'prs.map((p: any) => {');
fs.writeFileSync(pageFile, pageContent, 'utf8');
console.log('Fixed prs.map type in src/app/page.tsx');

