import path from 'path';
import { promises as fs } from 'fs';

export default async function readDevCert(dirPath, commonName) {
  const [crt, chain, key] = await Promise.all([
    '.crt',
    '_intermediate_chain.crt',
    '.key'
  ].map(async (endPart) => {
    return await fs.readFile(path.join(dirPath, `${commonName.replace('*', '_')}${endPart}`), 'utf8');
  }));

  return {
    cert: [crt, chain].join('\n'),
    key
  };
}

