const fs = require('fs');

if (!fs.existsSync('audit-report.json')) {
  console.log('Error: audit-report.json does not exist. Run node audit.cjs first.');
  process.exit(1);
}

const raw = fs.readFileSync('audit-report.json', 'utf8');
const report = JSON.parse(raw);

const groups = {
  LOW_PADDING: [],
  TIGHT_LINE_HEIGHT: [],
  NO_SIBLING_GAP: [],
  CARD_PADDING_TOO_SMALL: []
};

report.forEach(item => {
  if (groups[item.type]) {
    // Collect class name, tag name or description
    const label = `${item.tag}.${item.cls || 'no-class'}`;
    if (!groups[item.type].includes(label)) {
      groups[item.type].push(label);
    }
  }
});

console.log('AUDIT SUMMARY');
console.log('=============');
Object.keys(groups).forEach(type => {
  console.log(`${type}: ${groups[type].length} elements affected → [${groups[type].slice(0, 10).join(', ')}${groups[type].length > 10 ? '...' : ''}]`);
});
