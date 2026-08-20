import path from 'path';
import formatFilename from '../utils/format-filename.js';
const isMarkdown = /\.md$/;

/**
 * txFixLinks - Fix links in markdown files
 * Change relative package links to the root docs
 */
const txFixLinks = {
  global: true,
  test: isMarkdown,
  handler: function fixLinks(content) {
    content = content
      // Fix relative navigation patterns
      .replace(/(\.\.\/)+plugins/g, '/plugins')
      .replace(/(\.\.\/)+presets/g, '/presets')
      .replace(/(\.\.\/)+modules/g, '/modules')
      .replace(/(\.\.\/)+plugin-/g, '/plugins/gasket-plugin-')
      .replace(/(\.\.\/)+preset-/g, '/presets/preset-')

      // Fix absolute package paths
      .replace(/packages\/gasket-plugin/g, '/plugins/gasket-plugin')
      .replace(/packages\/gasket-preset/g, '/presets/gasket-preset')
      .replace(/packages\/gasket-(?!plugin)(?!preset)/g, '/modules/gasket-')

      // Fix relative package paths from modules
      .replace(/\.\.\/\.\.\/packages\/gasket-plugin/g, '/plugins/gasket-plugin')
      .replace(/\.\.\/\.\.\/packages\/gasket-preset/g, '/presets/gasket-preset')
      .replace(/\.\.\/\.\.\/packages\/gasket-(?!plugin)(?!preset)/g, '/modules/gasket-')

      // Fix sibling package paths
      .replace(/\.\.\/gasket-(?!plugin)(?!preset)[\w-]+\/README\.md/g, (match) => {
        const packageName = match.match(/\.\.\/gasket-([\w-]+)/)[1];
        return `/modules/gasket-${packageName}/`;
      })
      .replace(/\.\.\/gasket-(?!plugin)(?!preset)[\w-]+\/EXAMPLES\.md/g, (match) => {
        const packageName = match.match(/\.\.\/gasket-([\w-]+)/)[1];
        return `/modules/gasket-${packageName}/examples`;
      })

      .replace(/\.\.\/\.\.\/@gasket\/plugin-middleware\/README\.md/g, 'https://github.com/godaddy/gasket/blob/main/packages/gasket-plugin-middleware/README.md')

      // Fix relative docs paths
      .replace(/\.\.\/\.\.\/docs\//g, '/docs/')
      .replace(/\.\.\/docs\//g, '/docs/')

      // Fix README paths that should go to root
      .replace(/\.\.\/README\.md/g, '/')

      // Fix EXAMPLES.md paths
      .replace(/\.\.\/EXAMPLES\.md/g, '/examples')
      .replace(/EXAMPLES\.md/g, 'examples')

      // Remove broken api.md links in proxy plugin
      .replace(/\[([^\]]+)\]\(\.?\.?\/?(api\.md[^)]*)\)/g, '$1')

      // Remove reference-style api.md links
      .replace(/^\s*\[[^\]]+\]:\s*\.?\/?api\.md.*$/gm, '')


      // Other existing transforms
      .replace(/\/@gasket\//g, '/')
      .replace(/#([a-z]+[A-Z].*)/g, (_, match) => '#' + match.toLowerCase());

    return content;
  }
};

/**
 * txFixLicenseLinks - Fix license links
 * Change relative package links to the root LICENSE.md
 */
const txFixLicenseLinks = {
  global: true,
  test: isMarkdown,
  handler: function fixLinks(content, { docsConfig }) {
    const { targetRoot } = docsConfig;
    const relativePath = targetRoot.split('/docs/')[1].replace('@godaddy/', '').split('/').map(() => '..').join('/');
    return content.replace(/\.\/LICENSE.md/g, `${relativePath}/LICENSE.md`);
  }
};

/**
 * txFrontMatter - Add front matter to markdown files
 * https://docusaurus.io/docs/markdown-features#front-matter
 */
const txFrontMatter = {
  global: true,
  test: isMarkdown,
  handler: function txFrontMatter(content, { filename, docsConfig }) {
    const { targetRoot } = docsConfig;
    const label = path.basename(targetRoot);

    const frontMatter = {
      title: `''`,
      hide_title: true,
      // eslint-disable-next-line no-nested-ternary
      sidebar_label: filename === 'README.md' ? `'@godaddy/${label}'` :
        filename === 'EXAMPLES.md' ? `'Examples'` :
          `${formatFilename(filename.split('/').pop())}`
    };

    const data = Object.entries(frontMatter).map(([key, value]) => `${key}: ${value}`).join('\n');

    content = `---\n${data}\n---\n\n${content}`;

    return content;
  }
};

export default {
  name: 'site-docs-plugin',
  hooks: {
    docsSetup: {
      timing: {
        after: ['@gasket/plugin-docs']
      },
      handler: () => {
        return {
          files: [
            'README.md',
            'docs/**/*',
            'EXAMPLES.md'
          ],
          transforms: [
            txFrontMatter,
            txFixLicenseLinks,
            txFixLinks
          ]
        };
      }
    }
  }
};
