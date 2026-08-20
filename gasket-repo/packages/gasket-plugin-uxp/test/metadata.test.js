import { describe, it, expect } from 'vitest';
import metadata from '../lib/metadata.js';

describe('metadata', () => {

  function checkNames(meta) {
    return meta.map(i => i.name);
  }

  it('has actions metadata', () => {
    const meta = metadata();
    expect(checkNames(meta.actions)).toEqual([
      'getPresentationCentral'
    ]);
  });

  it('has guides metadata', () => {
    const meta = metadata();
    expect(checkNames(meta.guides)).toEqual([
      'White Labeling Guide',
      'Dynamic Imports Guide',
      'RTL Guide'
    ]);
  });

  it('has structures metadata', () => {
    const meta = metadata();
    expect(checkNames(meta.structures)).toEqual([
      'manifest.xml'
    ]);
  });

  it('has lifecycles metadata', () => {
    const meta = metadata();
    expect(checkNames(meta.lifecycles)).toEqual([
      'presentationCentral',
      'headerContent'
    ]);
  });

  it('has modules metadata', () => {
    const meta = metadata();
    expect(checkNames(meta.modules)).toEqual([
      '@godaddy/gasket-next'
    ]);
  });

  it('has configurations metadata', () => {
    const meta = metadata();
    expect(checkNames(meta.configurations)).toEqual([
      'presentationCentral',
      'presentationCentral.fsCachePath',
      'presentationCentral.env',
      'presentationCentral.version',
      'presentationCentral.disableRTL',
      'presentationCentral.timeout',
      'presentationCentral.maxStaleness',
      'presentationCentral.maxAge',
      'presentationCentral.params',
      'presentationCentral.enablePartnersHeaderOverride'
    ]);
  });
});
