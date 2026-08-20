import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import plugin from '../lib/index.js';

// Mock the FFI library to avoid Jest globals conflict
vi.mock('@godaddy/gd-auth-lib');

const packageJsonPath = new URL('../package.json', import.meta.url).pathname;
const { name, version, description } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

describe('Gasket JWT Plugin', () => {
  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'prepare',
      'metadata'
    ];

    expect(Object.keys(plugin.hooks)).toEqual(expected);
  });
});
