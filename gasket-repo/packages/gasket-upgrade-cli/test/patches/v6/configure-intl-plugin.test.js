const wrapper = require('../../../lib/patches/v6/configure-intl-plugin');
const patch = wrapper.wrapped;
const { makeContext } = require('../../../lib/patcher');
const mockConfig = `
module.exports = {
  plugins: {
    presets: ['@godaddy/webapp'],
    add: ['@godaddy/zkconfig']
  },
  presentationCentral: {
    params: {
      app: 'canary.gasket',
      header: 'application-header',
      pwamanifest: '/manifest.json'
    }
  }
}
`;
const filePath = 'gasket.config.js';

describe('v6 patch - configure intl plugin', function () {
  let mockContext, mockSpinner;

  beforeEach(function () {
    mockContext = makeContext();
    mockSpinner = {
      info: jest.fn()
    };
    mockContext.files.set('package.json', { name: 'app-name' });
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('adds intl config if not moving directory', async function () {
    mockContext.moveLocaleToPublic = false;
    mockContext.files.set(filePath, mockConfig);
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get(filePath);
    expect(results).toContain('intl: {');
    expect(results).toContain('localesDir: "./locales"');
    expect(results).toContain('serveStatic: true');
  });

  it('retains existing config', async function () {
    mockContext.moveLocaleToPublic = false;
    const mockConfig2 = mockConfig.replace(/}\s+$/, ',intl: { localesDir: "./bogus" } }');
    mockContext.files.set(filePath, mockConfig2);
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get(filePath);
    expect(results).toContain('intl: {');
    expect(results).not.toContain('localesDir: "./locales"');
    expect(results).toContain('localesDir: "./bogus"');
    expect(results).toContain('serveStatic: true');
  });

  it('does not add config if moving', async function () {
    mockContext.moveLocaleToPublic = true;
    mockContext.files.set(filePath, mockConfig);
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get(filePath);
    expect(results).not.toContain('intl: {');
  });

  it('logs info if not moving', async function () {
    mockContext.moveLocaleToPublic = true;
    mockContext.files.set(filePath, mockConfig);
    await patch(mockContext, mockSpinner);
    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('(avoided)')
    );
  });
});
