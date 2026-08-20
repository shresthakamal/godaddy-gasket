import { vi } from 'vitest';
import { createRequire } from 'module';
import preset from '../lib/index.js';
const require = createRequire(import.meta.url);
const { devDependencies } = require('../package.json');
const mockPkgAdd = vi.fn();
const mockFilesAdd = vi.fn();

describe('create', function () {
  let mockContext, createHook, mockGasket;

  beforeEach(function () {
    mockGasket = { config: {} };
    mockContext = {
      pkg: { add: mockPkgAdd },
      files: { add: mockFilesAdd },
      typescript: false
    };
    createHook = preset.hooks.create;
  });

  afterEach(function () {
    vi.clearAllMocks();
  });

  it('adds markdown, js files, devDependencies, and scripts for non-typescript', async function () {
    await createHook(mockGasket, mockContext);

    expect(mockFilesAdd).toHaveBeenCalledWith(
      expect.stringMatching(/generator\/\*.md$/)
    );
    expect(mockFilesAdd).toHaveBeenCalledWith(
      expect.stringMatching(/generator\/\*.js$/)
    );
    expect(mockPkgAdd).toHaveBeenCalledWith('devDependencies', {
      nodemon: devDependencies.nodemon
    });
    expect(mockPkgAdd).toHaveBeenCalledWith('scripts', {
      start: 'node server.js',
      local: 'GASKET_ENV=local nodemon server.js'
    });
  });

  it('only adds markdown files for typescript projects', async function () {
    mockContext.typescript = true;
    await createHook(mockGasket, mockContext);

    expect(mockFilesAdd).toHaveBeenCalledWith(
      expect.stringMatching(/generator\/\*.md$/)
    );
    expect(mockFilesAdd).not.toHaveBeenCalledWith(
      expect.stringMatching(/generator\/\*.js$/)
    );
    expect(mockPkgAdd).not.toHaveBeenCalled();
  });
});
