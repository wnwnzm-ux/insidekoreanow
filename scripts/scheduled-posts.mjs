import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// Read keywords.csv
const csv = readFileSync('keywords.csv', 'utf8');
const lines = csv.trim().split('\n').slice(1); // skip header

// Find unused keywords
const used = new Set();
try {
  const log = readFileSync('keywords-used.log', 'utf8');
  log.split('\n').filter(Boolean).forEach(k => used.add(k.trim()));
} catch {}

const available = lines
  .map(line => {
    const [keyword, category] = line.split(',');
    return { keyword: keyword?.trim(), category: category?.trim() };
  })
  .filter(({ keyword }) => keyword && !used.has(keyword));

if (available.length === 0) {
  console.log('All keywords used! Add more to keywords.csv');
  process.exit(0);
}

// Take 1 keyword
const { keyword, category } = available[0];
console.log(`Generating post for: ${keyword}`);

// Run generate-post.mjs
const args = [keyword, '--status', 'published'];
if (category && category !== 'auto') {
  args.push('--category', category);
}

execSync(`node scripts/generate-post.mjs ${args.map(a => `"${a}"`).join(' ')}`, {
  stdio: 'inherit'
});

// Mark keyword as used
writeFileSync('keywords-used.log', 
  [...used, keyword].join('\n') + '\n'
);

console.log(`Done! Marked "${keyword}" as used.`);
