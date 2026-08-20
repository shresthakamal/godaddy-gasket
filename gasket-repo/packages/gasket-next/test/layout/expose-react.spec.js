import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('expose-react', () => {
  beforeEach(async () => {
    vi.resetModules();

    const React = (await import('react')).default;
    delete React.jsx;
    delete React.jsxs;
    delete React.jsxDEV;

    delete window.React;
    delete window.ReactDOM;
    delete window.ux;
  });

  describe('React augmentation', () => {
    it('assigns jsx from react/jsx-runtime', async () => {
      await import('../../src/layout/expose-react.js');
      const { jsx } = await import('react/jsx-runtime');
      const React = (await import('react')).default;
      expect(React.jsx).toBe(jsx);
    });

    it('assigns jsxs from react/jsx-runtime', async () => {
      await import('../../src/layout/expose-react.js');
      const { jsxs } = await import('react/jsx-runtime');
      const React = (await import('react')).default;
      expect(React.jsxs).toBe(jsxs);
    });
  });

  describe('window globals', () => {
    it('sets window.React to the React module', async () => {
      await import('../../src/layout/expose-react.js');
      const React = (await import('react')).default;
      expect(window.React).toBe(React);
    });

    it('sets window.ux.React to the React module', async () => {
      await import('../../src/layout/expose-react.js');
      const React = (await import('react')).default;
      expect(window.ux.React).toBe(React);
    });

    it('sets window.ReactDOM', async () => {
      await import('../../src/layout/expose-react.js');
      expect(window.ReactDOM).toBeDefined();
    });

    it('sets window.ux.ReactDOM', async () => {
      await import('../../src/layout/expose-react.js');
      expect(window.ux.ReactDOM).toBeDefined();
    });

    it('window.ReactDOM includes ReactDOMClient exports', async () => {
      await import('../../src/layout/expose-react.js');
      const { createRoot } = await import('react-dom/client');
      expect(window.ReactDOM.createRoot).toBe(createRoot);
    });

    it('window.ReactDOM includes ReactDOM exports', async () => {
      await import('../../src/layout/expose-react.js');
      const { createPortal } = await import('react-dom');
      expect(window.ReactDOM.createPortal).toBe(createPortal);
    });

    it('ReactDOMClient exports take precedence over ReactDOM in the bundle', async () => {
      await import('../../src/layout/expose-react.js');
      const { hydrateRoot } = await import('react-dom/client');
      expect(window.ReactDOM.hydrateRoot).toBe(hydrateRoot);
    });
  });

  describe('window.ux initialization', () => {
    it('creates window.ux when not present', async () => {
      expect(window.ux).toBeUndefined();
      await import('../../src/layout/expose-react.js');
      expect(window.ux).toBeDefined();
    });

    it('preserves existing window.ux properties', async () => {
      window.ux = { customProp: 'keep-me' };
      await import('../../src/layout/expose-react.js');
      expect(window.ux.customProp).toBe('keep-me');
    });
  });
});
