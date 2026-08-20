const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v7/update-elastic-apm-setup');
const patch = wrapper.wrapped;

const updatedSetupFile = `
require('dotenv').config();
require('elastic-apm-node').start({
  serviceName: 'my-service-name',
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL
});
`;

const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});


describe('v7 patch - update babel.config.js', function () {
  let mockContext;

  beforeEach(function () {
    mockContext = makeContext();
    mockContext.files.set('package.json', { scripts: { start: 'gasket start --require elastic-apm-node/start' } });
  });

  it('is decorated with spinner', async function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('adds elastic-apm setup file', async function () {
    await patch(mockContext);
    const results = mockContext.files.get('setup.js');
    expect(results).toEqual(updatedSetupFile);
  });

  it('logs an error if there is already a setup file', async function () {
    mockContext.files.set('setup.js', 'some content');
    await patch(mockContext);
    expect(consoleError).toHaveBeenCalledWith('Error updating gasket-plugin-elastic-apm -- setup.js already exists');
  });

  it('updates elastic-amp scripts', async function () {
    await patch(mockContext);
    const pkg = mockContext.files.get('package.json');
    expect(pkg.scripts.start).toContain('./setup.js');
  });

  it('does not re-modify elastic-apm scripts', async function () {
    mockContext.files.set('package.json', { scripts: { start: 'gasket start --require ./setup.js' } });
    await patch(mockContext);
    const pkg = mockContext.files.get('package.json');
    expect(pkg.scripts.start).toEqual('gasket start --require ./setup.js');
  });

  it('does not modify package.json if there are no elastic-apm scripts', async function () {
    mockContext.files.set('package.json', { scripts: { start: 'gasket start' } });
    await patch(mockContext);
    const pkg = mockContext.files.get('package.json');
    expect(pkg.scripts.start).toEqual('gasket start');
  });
});
