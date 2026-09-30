const fs = require('fs');
const path = require('path');
const root = 'c:/TASK-2 Nexora';
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  console.log('Written:', rel, fs.statSync(p).size + ' bytes');
}
