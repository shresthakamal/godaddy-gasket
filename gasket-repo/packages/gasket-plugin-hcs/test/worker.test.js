import render from '../lib/worker.js';
import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


describe('worker', () => {
  it('should render Header correctly', async () => {
    const component = await render({
      source: path.join(__dirname, '__test__/mock-worker-input.js'),
      libraryExport: 'Header'
    });
    expect(component).toMatchSnapshot();
  });

  it('should render Footer with the props correctly', async () => {
    const component = await render({
      source: path.join(__dirname, '__test__/mock-worker-input.js'),
      libraryExport: 'Footer',
      props: { testTitle: 'This is a title' }
    });
    expect(component).toMatchSnapshot();
  });

  it('should render AnotherLibraryExport correctly', async () => {
    const component = await render({
      source: path.join(__dirname, '__test__/mock-worker-input.js'),
      libraryExport: 'AnotherLibraryExport'
    });
    expect(component).toMatchSnapshot();
  });

});
