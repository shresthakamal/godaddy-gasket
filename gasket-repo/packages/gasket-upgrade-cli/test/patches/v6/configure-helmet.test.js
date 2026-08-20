const wrapper = require('../../../lib/patches/v6/configure-helmet');
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

describe('v6 patch - configure helmet', function () {
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

  it('adds nextConfig', async function () {
    mockContext.moveLocaleToPublic = false;
    mockContext.files.set(filePath, mockConfig);
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get(filePath);
    expect(results).toContain(`,
  helmet: {
    contentSecurityPolicy: false
  }`);
  });

  it('merges with existing nextConfig', async function () {
    mockContext.moveLocaleToPublic = false;
    const mockConfig2 = mockConfig.replace(/}\s+$/, `,
  helmet: {
    crossDomain: { permittedPolicies: 'all' }
  }
}`);
    mockContext.files.set(filePath, mockConfig2);
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get(filePath);
    expect(results).toContain(`,
  helmet: {
    crossDomain: {
      permittedPolicies: 'all'
    },
    contentSecurityPolicy: false
  }
}`);
  });
});
