const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'src', 'components', 'training', 'CalendarDayCard.tsx');
let c = fs.readFileSync(filePath, 'utf8');

const needle = '{isCompleted && (\r\n                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-cycling)]" />\r\n                  )}\r\n                </div>';
const needleLF = '{isCompleted && (\n                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-cycling)]" />\n                  )}\n                </div>';

const toInsert = `\r\n\r\n                {w.is_key_session && (\r\n                  <div className="flex items-center gap-1 text-[8px] font-bold text-[var(--color-endurance)] bg-[var(--color-endurance)]/10 px-1.5 py-0.5 rounded border border-[var(--color-endurance)]/25">\r\n                    <Zap className="w-2.5 h-2.5 text-[var(--color-endurance)] shrink-0" />\r\n                    <span className="truncate">TONGGAK MINGGUAN {w.milestone_target_km ? \`(\${w.milestone_target_km} KM)\` : ''}</span>\r\n                  </div>\r\n                )}`;

if (c.includes(needle)) {
  c = c.replace(needle, needle + toInsert);
  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Successfully replaced CRLF version');
} else if (c.includes(needleLF)) {
  c = c.replace(needleLF, needleLF + toInsert.replace(/\r\n/g, '\n'));
  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Successfully replaced LF version');
} else {
  console.error('Target not found in CalendarDayCard.tsx');
}
