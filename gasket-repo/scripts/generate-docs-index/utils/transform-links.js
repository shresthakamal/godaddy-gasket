/**
 * transformLinks - Transform links in the content
 * @param {string|ReadableStream} content The doc content
 * @returns {string|ReadableStream} The transformed content
 */
export default function transformLinks(content) {
  content = content
    // Transform absolute package paths
    .replace(/\/packages\/gasket-plugin/g, '/plugins/gasket-plugin')
    .replace(/\/packages\/gasket-preset/g, '/presets/gasket-preset')
    .replace(/\/packages\/gasket-(?!plugin)(?!preset)/g, '/modules/gasket-')

    // Transform relative package paths
    .replace(/\.\.\/\.\.\/packages\/gasket-plugin/g, '/plugins/gasket-plugin')
    .replace(/\.\.\/\.\.\/packages\/gasket-preset/g, '/presets/gasket-preset')
    .replace(/\.\.\/\.\.\/packages\/gasket-(?!plugin)(?!preset)/g, '/modules/gasket-')

    // Transform relative sibling package paths
    .replace(/\.\.\/gasket-plugin/g, '/plugins/gasket-plugin')
    .replace(/\.\.\/gasket-preset/g, '/presets/gasket-preset')
    .replace(/\.\.\/gasket-(?!plugin)(?!preset)/g, '/modules/gasket-')

    // Transform relative docs paths
    .replace(/\.\.\/\.\.\/docs\//g, '/docs/')
    .replace(/\.\.\/docs\//g, '/docs/')

    // Transform relative README paths that should go to root
    .replace(/\.\.\/README\.md/g, '/')

    //     // Transform open source Gasket plugin links (using blob URLs to avoid built-in transform conflicts)
    .replace(/\/plugins\/gasket-plugin-middleware\/README\.md/g, 'https://github.com/godaddy/gasket/blob/main/packages/gasket-plugin-middleware/README.md')
    .replace(/\/plugins\/gasket-plugin-redux\/README\.md/g, 'https://github.com/godaddy/gasket/blob/main/packages/gasket-plugin-redux/README.md')
    .replace(/\/plugins\/gasket-plugin-nextjs\/README\.md/g, 'https://github.com/godaddy/gasket/blob/main/packages/gasket-plugin-nextjs/README.md')
    .replace(/\/modules\/gasket-nextjs\/README\.md/g, 'https://github.com/godaddy/gasket/blob/main/packages/gasket-nextjs/README.md')

    // Transform proxy plugin api.md references (file doesn't exist, remove links)
    .replace(/\[([^\]]+)\]\(\.?\.?\/?(api\.md[^)]*)\)/g, '$1')

    // Transform reference-style api.md links (remove them completely)
    .replace(/^\s*\[[^\]]+\]:\s*\.?\/?api\.md.*$/gm, '')

    // Other transforms
    .replace('/docs/generated-docs/', '/docs/')
    .replace('./LICENSE.md', '/LICENSE.md')
    .replace('./SECURITY.md', '/SECURITY')
    .replace(/#([a-z]+[A-Z].*)/g, (_, match) => '#' + match.toLowerCase())
    .replace('./docs/', '/')

  return content;
}
