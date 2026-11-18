const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'src', 'app', 'api', 'activities', 'parse-image', 'route.ts');
let content = fs.readFileSync(file, 'utf8');

const target = `    const scriptPath = path.join(process.cwd(), "scripts", "parse_activity_image.py");`;

const replacement = `    const candidatePaths = [
      path.join(process.cwd(), "scripts", "parsers", "parse_activity_image.py"),
      path.join(process.cwd(), "scripts", "parse_activity_image.py"),
    ];
    const scriptPath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];`;

content = content.replace(/\r\n/g, '\n').replace(target.replace(/\r\n/g, '\n'), replacement.replace(/\r\n/g, '\n'));
fs.writeFileSync(file, content, 'utf8');
console.log('src/app/api/activities/parse-image/route.ts updated with resilient path');
