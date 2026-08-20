import { vi } from 'vitest';
const mockStartScript = vi.fn().mockReturnValue('mockStartScript');
import create from '../lib/create.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');
import path from 'path';

describe('create', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: vi.fn(),
        extend: vi.fn().mockImplementation(fn => fn({ scripts: { start: mockStartScript() } }))
      },
      gasketConfig: {
        addPlugin: vi.fn()
      },
      files: {
        add: vi.fn()
      },
      apiApp: false,
      nextServerType: true,
      typescript: false
    };
  });

  it('should be a object', () => {
    expect(create).toEqual(expect.any(Object));
  });

  it('should have a timing property', () => {
    expect(create.timing).toEqual(expect.any(Object));
    expect(create.timing.after).toEqual(expect.arrayContaining(
      ['@gasket/plugin-nextjs', '@gasket/plugin-express']
    ));
  });

  it('should have a handler property', () => {
    expect(create.handler).toEqual(expect.any(Function));
  });

  it('should add pluginOtel to gasketConfig', () => {
    create.handler({}, mockContext);

    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginOtel', pkg.name);
  });

  it('should add files', () => {
    create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(expect.any(String));
  });

  it('should add dependencies', () => {
    create.handler({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', { [pkg.name]: `^${pkg.version}` });
  });

  it('should add vercel/otel dependency if nextServerType is true', () => {
    create.handler({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', { '@vercel/otel': pkg.dependencies['@vercel/otel'] });
  });

  it('should add files if nextServerType is true', () => {
    create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(expect.any(String));
  });

  describe('pkg.extend', () => {
    it('should extend pkg scripts', () => {
      create.handler({}, mockContext);

      expect(mockContext.pkg.extend).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle basic node script', () => {
      mockStartScript.mockReturnValueOnce('node server.js');
      create.handler({}, mockContext);

      expect(mockContext.pkg.extend).toHaveReturnedWith({
        scripts: {
          start: "NODE_OPTIONS='--import @godaddy/gasket-otel/register' NEXT_OTEL_VERBOSE=1 node server.js"
        }
      });
    });

    it('should handle TS node script', () => {
      mockStartScript.mockReturnValueOnce('node dist/server.js');
      create.handler({}, mockContext);

      expect(mockContext.pkg.extend).toHaveReturnedWith({
        scripts: {
          start: "NODE_OPTIONS='--import @godaddy/gasket-otel/register' NEXT_OTEL_VERBOSE=1 node dist/server.js"
        }
      });
    });

    it('should handle multiple scripts', () => {
      mockStartScript.mockReturnValueOnce('npm run start:https & next start');
      create.handler({}, mockContext);

      expect(mockContext.pkg.extend).toHaveReturnedWith({
        scripts: {
          start: "NODE_OPTIONS='--import @godaddy/gasket-otel/register' NEXT_OTEL_VERBOSE=1 npm run start:https & next start"
        }
      });
    });

    it('should handle nextjs verbose flag', () => {
      mockStartScript.mockReturnValueOnce('npm run start:https & next start');
      mockContext.nextServerType = true;
      create.handler({}, mockContext);

      expect(mockContext.pkg.extend).toHaveReturnedWith({
        scripts: {
          start: "NODE_OPTIONS='--import @godaddy/gasket-otel/register' NEXT_OTEL_VERBOSE=1 npm run start:https & next start"
        }
      });
    });

    it('should not have verbose flag if apiApp is true', () => {
      mockStartScript.mockReturnValueOnce('node server.js');
      mockContext.apiApp = true;
      create.handler({}, mockContext);

      expect(mockContext.pkg.extend).toHaveReturnedWith({
        scripts: {
          start: `NODE_OPTIONS='--import @godaddy/gasket-otel/register' node server.js`
        }
      });
    });
  });

  describe('file generation', () => {
    it('should add base files', () => {
      create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(path.join(__dirname, '..', 'generator', '.*'));
    });

    it('should add TypeScript files when typescript is true', () => {
      mockContext.typescript = true;
      create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(path.join(__dirname, '..', 'generator', 'typescript', '*'));
    });

    it('should add JavaScript files when typescript is false', () => {
      mockContext.typescript = false;
      create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(path.join(__dirname, '..', 'generator', '*'));
    });

    it('should not add TypeScript/JavaScript files if not a Next.js app', () => {
      mockContext.nextServerType = false;
      create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(path.join(__dirname, '..', 'generator', '.*'));
      expect(mockContext.files.add).not.toHaveBeenCalledWith(path.join(__dirname, '..', 'generator', 'typescript', '*'));
      expect(mockContext.files.add).not.toHaveBeenCalledWith(path.join(__dirname, '..', 'generator', '*'));
    });
  });
});
