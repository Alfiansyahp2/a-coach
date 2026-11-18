const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.gemini' || file === '.vscode') continue;
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      getFiles(p, files);
    } else if (p.match(/\.(ts|tsx|js|jsx)$/)) {
      files.push(p);
    }
  }
  return files;
}

const allFiles = getFiles('src').concat(getFiles('scripts'));
const results = allFiles.map(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n').length;
  return { file: f.replace(/\\/g, '/'), lines };
});

results.sort((a, b) => b.lines - a.lines);

console.log('=== TOP 40 LARGEST FILES IN CODEBASE (BULK CODE AUDIT) ===\n');
results.slice(0, 40).forEach((r, idx) => {
  const num = (idx + 1).toString().padStart(2, ' ');
  const l = r.lines.toString().padStart(5, ' ');
  console.log(`${num}. ${l} lines | ${r.file}`);
});

console.log('\nTotal audited source files:', results.length);
const totalLines = results.reduce((acc, r) => acc + r.lines, 0);
console.log('Total source lines of code:', totalLines);
const bulkFiles = results.filter(r => r.lines > 300);
console.log(`Files with bulk lines (>300 lines): ${bulkFiles.length} files`);

