import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const libIndexPath = path.join(__dirname, '..', 'lib', 'index.js');

if (!fs.existsSync(libIndexPath)) {
  throw new Error(`Expected build artifact not found: ${libIndexPath}`);
}

const source = fs.readFileSync(libIndexPath, 'utf8');
const fixed = source.replace(/\.\/with-manifest\.jsx/g, './with-manifest.js');

if (source !== fixed) {
  fs.writeFileSync(libIndexPath, fixed, 'utf8');
}

