import React from 'react';
import { render } from '@testing-library/react';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 *
 * @param prop
 */
export default function mockSSR(prop = 'default') {
  return {
    render(componentPath, { props }) {
      const { [prop]: Component } = require(componentPath);

      const result = render(React.createElement(Component, props));
      return { container: result.container };
    }
  };
}
