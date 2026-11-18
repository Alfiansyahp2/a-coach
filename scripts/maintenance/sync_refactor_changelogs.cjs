const fs = require('fs');
const path = require('path');

const refactorDir = path.join('docs', '10-changelog', 'refactor');

// 1. Rename 09-15-00 file to refactor- prefix
const old15 = path.join(refactorDir, '2026-11-04_09-15-00_feat-clean-architecture-bulk-line-refactor-and-domain-decomposition.md');
const new15 = path.join(refactorDir, '2026-11-04_09-15-00_refactor-clean-architecture-bulk-line-and-domain-decomposition.md');

if (fs.existsSync(old15)) {
  let content = fs.readFileSync(old15, 'utf8');
  content = content.replace(/# Changelog: Clean Architecture Bulk Line Refactor & Domain Decomposition \(`feat\/backend`\)/g, '# Changelog: Clean Architecture Bulk Line Refactor & Domain Decomposition (`refactor`)');
  content = content.replace(/docs\/10-changelog\/feat\/backend\/2026-11-04_09-15-00_feat-clean-architecture-bulk-line-refactor-and-domain-decomposition\.md/g, 'docs/10-changelog/refactor/2026-11-04_09-15-00_refactor-clean-architecture-bulk-line-and-domain-decomposition.md');
  fs.writeFileSync(new15, content, 'utf8');
  fs.unlinkSync(old15);
  console.log('[OK] Renamed to', new15);
}

// 2. Rename 09-30-00 file to refactor- prefix
const old30 = path.join(refactorDir, '2026-11-04_09-30-00_feat-authoritative-clean-architecture-folder-structure-and-modularization.md');
const new30 = path.join(refactorDir, '2026-11-04_09-30-00_refactor-authoritative-clean-architecture-folder-structure-and-modularization.md');

if (fs.existsSync(old30)) {
  let content = fs.readFileSync(old30, 'utf8');
  content = content.replace(/# Changelog: Authoritative Clean Architecture Folder Structure & Codebase Reorganization \(`feat\/backend`\)/g, '# Changelog: Authoritative Clean Architecture Folder Structure & Codebase Reorganization (`refactor`)');
  content = content.replace(/docs\/10-changelog\/feat\/backend\/2026-11-04_09-30-00_feat-authoritative-clean-architecture-folder-structure-and-modularization\.md/g, 'docs/10-changelog/refactor/2026-11-04_09-30-00_refactor-authoritative-clean-architecture-folder-structure-and-modularization.md');
  fs.writeFileSync(new30, content, 'utf8');
  fs.unlinkSync(old30);
  console.log('[OK] Renamed to', new30);
}

console.log('[DONE] Changelogs in refactor/ updated successfully.');

