import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Render React Component. Custom worker which overrides the default worker in @ux/ssr
 * @type {import('./internal').render}
 */
export default async function render({
  source,
  props = {},
  libraryExport = 'Header'
}) {
  const Component = require(source);

  return renderToString(
    createElement(Component[libraryExport] || Component, props)
  );
}
