import { expect } from 'vitest';
import { setupDeferManifest, normalizeManifest } from '../../src/server/fixup-manifest';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

describe('setupDeferManifest', function () {
  let mockData;

  beforeEach(function () {
    mockData = require('../fixtures/hydra-dev-v3.json').data;
  });

  it('moves js to deprecatedDeferJs prop', function () {
    const results = setupDeferManifest(mockData);
    expect(results).not.toHaveProperty('js');
    expect(results).toHaveProperty('deprecatedDeferJs');

    expect(results.deprecatedDeferJs).toEqual(mockData.js);
  });

  it('removes preload.js', function () {
    const results = setupDeferManifest(mockData);
    expect(results).toHaveProperty('hints.preload.css');
    expect(results).toHaveProperty('hints.preload.fonts');

    expect(results).not.toHaveProperty('hints.preload.js');
  });
});


describe('normalizeManifest', () => {
  it('correctly transforms response, given all data is present', () => {
    const mockPcProps = {
      browserDeprecation: '<script>browserDeprecation</script>',
      hints: {
        preload: {
          fonts: '<link hints.preload.fonts />'
        }
      },
      css: {
        manifest: '<link css.manifest />',
        uxcore: '<link css.uxcore />'
      },
      favicons: '<link favicon />',
      config: {
        setup: '<script>config.setup</script>',
        trfq: '<script>config.trfq</script>',   // ignored
        hivemind: '<script>config.hivemind</script>'
      },
      components: {
        header: '<div>components.header</div>',
        footer: '<div>components.footer</div>'
      },
      hydrate: '<script>hydrate</script>',
      js: {
        uxcore: '<script>uxcore</script>',
        manifest: '<script>manifest</script>',
        heartbeat: '<script>heartbeat</script>'
      }
    };

    const successRes = {
      hints: mockPcProps.hints,
      assets: {
        css: '<script>browserDeprecation</script><link css.manifest /><link css.uxcore /><link favicon />',
        js: '<script>uxcore</script><script>manifest</script><script>heartbeat</script>'
      },
      header: '<div>components.header</div>',
      footer: '<div>components.footer</div>',
      globals: '<script>config.setup</script><script>config.hivemind</script>',
      loaders: '<script>hydrate</script>'
    };
    const result = normalizeManifest(mockPcProps);
    expect(result).toEqual(successRes);
  });

  it('correctly transforms response when missing font data', () => {
    const mockPcProps = {
      browserDeprecation: '<script>browserDeprecation</script>',
      hints: {},
      css: {
        manifest: '<link css.manifest />',
        uxcore: '<link css.uxcore />'
      },
      favicons: '<link favicon />',
      config: {
        setup: '<script>config.setup</script>',
        trfq: '<script>config.trfq</script>'  // ignored
      },
      components: {
        header: '<div>components.header</div>',
        footer: '<div>components.footer</div>'
      },
      hydrate: '<script>hydrate</script>',
      js: {
        uxcore: '<script>uxcore</script>',
        manifest: '<script>manifest</script>',
        heartbeat: '<script>heartbeat</script>'
      }
    };

    const successRes = {
      hints: {},
      assets: {
        css: '<script>browserDeprecation</script><link css.manifest /><link css.uxcore /><link favicon />',
        js: '<script>uxcore</script><script>manifest</script><script>heartbeat</script>'
      },
      header: '<div>components.header</div>',
      footer: '<div>components.footer</div>',
      globals: '<script>config.setup</script>',
      loaders: '<script>hydrate</script>'
    };
    const result = normalizeManifest(mockPcProps);
    expect(result).toEqual(successRes);
  });

  it('correctly transforms response when missing all data', () => {
    const mockPcProps = {};

    const successRes = {
      hints: {},
      assets: { css: '', js: '' },
      header: '',
      footer: '',
      globals: '',
      loaders: ''
    };
    const result = normalizeManifest(mockPcProps);
    expect(result).toEqual(successRes);
  });

  it('merges HCS properties if available', () => {
    const mockPcProps = {
      css: {
        manifest: '<link css.manifest />',
        hcs: '<link rel="stylesheet" href="custom.hcs.stylesheet.reference" />'
      },
      config: {
        setup: '<script>config.setup</script>',
        hcs: '<script>generic HCS config</script>'
      },
      js: {
        uxcore: '<script>uxcore</script>',
        hcs: '<script>HCS js</script>'
      }
    };

    const successRes = {
      hints: {},
      assets: {
        css: '<link css.manifest /><link rel="stylesheet" href="custom.hcs.stylesheet.reference" />',
        js: '<script>uxcore</script><script>HCS js</script>'
      },
      header: '',
      footer: '',
      globals: '<script>config.setup</script><script>generic HCS config</script>',
      loaders: ''
    };

    const result = normalizeManifest(mockPcProps);
    expect(result).toEqual(successRes);
  });

  it('merges tealium properties if available', () => {
    const mockPcProps = {
      css: {
        manifest: '<link css.manifest />'
      },
      config: {
        setup: '<script>config.setup</script>',
        tealium: '<script>config.tealium</script>'
      },
      js: {
        uxcore: '<script>uxcore</script>'
      }
    };

    const successRes = {
      hints: {},
      assets: {
        css: '<link css.manifest />',
        js: '<script>uxcore</script>'
      },
      header: '',
      footer: '',
      globals: '<script>config.setup</script><script>config.tealium</script>',
      loaders: ''
    };

    const result = normalizeManifest(mockPcProps);
    expect(result).toEqual(successRes);
  });

  it('prunes hints with empty values', () => {
    const mockPcProps = {
      hints: {
        dnsprefetch: '<link rel="dns-prefetch" href="//img6.dev-wsimg.com/"/>',
        preconnect: '',
        prefetch: [],
        preload: {
          js: '',
          css: '<link rel="preload" href="example.css" as="style"/>',
          fonts: []
        }
      }
    };

    const successRes = {
      hints: {
        dnsprefetch: '<link rel="dns-prefetch" href="//img6.dev-wsimg.com/"/>',
        preload: {
          css: '<link rel="preload" href="example.css" as="style"/>'
        }
      },
      assets: {
        css: '',
        js: ''
      },
      footer: '',
      globals: '',
      loaders: '',
      header: ''
    };

    const result = normalizeManifest(mockPcProps);
    expect(result).toEqual(successRes);
  });
});
