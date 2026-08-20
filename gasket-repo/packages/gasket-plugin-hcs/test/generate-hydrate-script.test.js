import { describe, it, expect } from 'vitest';
import generateHydrateScript from '../lib/generate-hydrate-script.js';

describe('generateHydrateScript', function () {
  it('wraps with GAS when deferjs is true', async () => {
    const script = await generateHydrateScript({}, { params: { deferjs: 'true' } });
    expect(script).toMatch('window.gas = window.gas || [];');
    expect(script).toMatch('gas.push([\'bootstrap');
    expect(script).toMatch('gas.push([\'render');
  });

  it('passes hydrate to render method', async () => {
    const script = await generateHydrateScript({}, {});
    expect(script).toMatch('hydrate: true');
  });

  it('targets header and footer container ids', async () => {
    let script = await generateHydrateScript({}, {});
    expect(script).toMatch('selector: \'#hcs-header-container\'');
    expect(script).toMatch('selector: \'#hcs-footer-container\'');

    script = await generateHydrateScript({}, { params: { deferjs: 'true' } });
    expect(script).toMatch('selector: \'#hcs-header-container\'');
    expect(script).toMatch('selector: \'#hcs-footer-container\'');
  });
});
