// scripts/replaceUuids.mjs
import fs from 'fs';
import path from 'path';

const replacements = [
  ['u1111111', '01111111'],
  ['u2222222', '02222222'],
  ['u3333333', '03333333'],
  ['u4444444', '04444444'],
  ['u5555555', '05555555'],
  ['v1111111', 'b1111111'],
  ['v2222222', 'b2222222'],
  ['v3333333', 'b3333333'],
  ['v4444444', 'b4444444'],
  ['z1111111', 'c1111111'],
  ['z2222222', 'c2222222'],
  ['z3333333', 'c3333333'],
  ['z4444444', 'c4444444'],
  ['z5555555', 'c5555555'],
  ['z6666666', 'c6666666'],
  ['z7777777', 'c7777777'],
  ['z8888888', 'c8888888'],
  ['z9999999', 'c9999999'],
  ['zaaaaaaa', 'caaaaaaa'],
  ['zbbbbbbb', 'cbbbbbb0'],
  ['zccccccc', 'ccccccc0'],
  ['zddddddd', 'cdddddd0'],
  ['i1111111', 'd1111111'],
  ['i2222222', 'd2222222'],
  ['i3333333', 'd3333333'],
  ['w1111111', 'e1111111'],
  ['t1111111', 'f1111111'],
];

function getAllFiles(dir, extensions) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      files = files.concat(getAllFiles(fullPath, extensions));
    } else {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

const targetExtensions = ['.ts', '.tsx', '.sql'];
const targetFiles = getAllFiles(path.resolve('.'), targetExtensions);

console.log(`Found ${targetFiles.length} files to scan.`);

let totalReplacements = 0;
let modifiedFiles = 0;

for (const filePath of targetFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileReplacements = 0;

  for (const [from, to] of replacements) {
    const regex = new RegExp(from, 'g');
    const matches = content.match(regex);
    if (matches) {
      fileReplacements += matches.length;
      content = content.replace(regex, to);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.relative('.', filePath)} (${fileReplacements} occurrences)`);
    totalReplacements += fileReplacements;
    modifiedFiles++;
  }
}

console.log(`\nReplacement Complete! Modified ${modifiedFiles} files with ${totalReplacements} total replacements.`);
