import { describe, it, expect } from 'vitest';
import renderManifest from '../../lib/asset-manager/render-manifest.js';

import v3RawManifest from './__test__/v3-manifest.json';
import v3RenderedManifest from './__test__/v3-manifest.rendered.json';

const clone = (obj) => JSON.parse(JSON.stringify(obj));

describe('Render Manifest', () => {

  it('Renders an actual raw PCS header correctly', async () => {
    const result = renderManifest(clone(v3RawManifest));
    expect(result).toEqual(v3RenderedManifest);
  });

  it('Given format=raw is returns the original object', async () => {
    const format = 'raw';
    const result = renderManifest(clone(v3RawManifest), format);
    expect(result).toEqual(v3RawManifest);
  });

  it('Will skip unrenderable objects in otherwise renderable array', () => {
    const rawManifest = {
      hints: {
        prefetch: [
          {
            tagName: 'link',
            rel: 'prefetch',
            href: 'https://cdn.net/prefetch-from-original-manifest'
          },
          // this will be skipped and warning will be logged
          {
            some: 'object',
            that: 'is not a tag'
          },
          {
            tagName: 'link',
            rel: 'prefetch',
            href: 'https://cdn.net/prefetch-from-original-manifest-2'
          }
        ]
      }
    };

    expect(renderManifest(rawManifest)).toEqual({
      hints: {
        prefetch: '<link rel="prefetch" href="https://cdn.net/prefetch-from-original-manifest"/> ' +
                    '<link rel="prefetch" href="https://cdn.net/prefetch-from-original-manifest-2"/>'
      }
    });
  });

});
