import { runShellCommand } from '@gasket/utils';
import copySiteDocs from './utils/copy-site-docs.js';
import wait from './utils/wait.js';
import { readFile, writeFile, rm } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const startTag = '<!-- START GENERATED -->';
const endTag = '<!-- END GENERATED -->';

const projectRoot = path.resolve(__dirname, '..', '..');
const sourcePath = path.join(__dirname, '.docs', 'docs', 'README.md');
const targetPath = path.join(projectRoot, 'README.md');

const reModuleStr = /\|\s(@godaddy\/gasket-[\w-]+)\s+\|/g;

const fixupModuleLinks = (content) => {
  const packages = [];

  // replace names with links
  content = content.replace(reModuleStr, (match, pkg) => {
    packages.push(pkg);
    const re = new RegExp(pkg + '\\s?\\s?');
    return match.replace(re, `[${pkg}]`);
  });

  // add new reference links
  content += packages
    .filter((pkg) => !content.includes(`[${pkg}]:`))
    .map(
      (pkg) => `[${pkg}]:/packages/${pkg.replace('@godaddy/', '')}/README.md`
    )
    .join('\n');

  return content;
};

/**
 * Generates the Gasket docs index by running the Gasket CLI
 */
async function main() {
  await runShellCommand('node', ['gasket.js', 'docs', '--no-view'], { cwd: __dirname }, true);

  let content = await readFile(sourcePath, 'utf-8');

  // fix up the generated docs index
  content = content
    .replace(/# App[^#]+/gm, '')
    .replace(/:.+\/@godaddy\/gasket-/g, ':/packages/gasket-')
    .replace(
      /:.+\/@gasket\//g,
      ':https://github.com/godaddy/gasket/tree/main/packages/gasket-'
    )
    .replace(/All configured/g, 'Available')
    .replace(/Dependencies and supporting/, 'Supporting')
    .replace(/.+:app\/README.md\n/, '')
    .replace(/.+config-plugin.+\n/, '')
    .replace(/\| \[@gasket\/plugin.+\n/g, '')
    // removed a single test/ dir, duplicate from generating both mocha and jest
    .replace(/.+test\/.+\n/, '')
    .replace(/]:..\/docs\//g, ']:/docs/');

  content = fixupModuleLinks(content);

  const template = await readFile(targetPath, 'utf-8');
  const start = template.indexOf(startTag) + startTag.length;
  const end = template.indexOf(endTag);

  // substitute in the generated content
  content =
    template.substring(0, start) +
    '\n\n' +
    content +
    '\n\n' +
    template.substring(end);

  await writeFile(targetPath, content, 'utf-8');

  // Need to wait for the docs to be generated before copying them
  await wait(100);

  // Copy docs for docs site and format for use
  await copySiteDocs(projectRoot);

  // cleanup temp docs
  await rm(path.join(__dirname, '.docs'), { recursive: true });

  // eslint-disable-next-line no-console
  console.log('DONE');
}

main();
