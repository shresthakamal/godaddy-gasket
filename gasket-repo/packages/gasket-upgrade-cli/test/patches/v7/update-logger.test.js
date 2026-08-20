const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v7/update-logger');
const patch = wrapper.wrapped;

const warningContent = `
gasket.logger.warning('This is a warning');
gasket.logger.warning('This is another warning');
`;

const logContent = `
logger.log('This is a log');
logger.log('This is another log');
`;

const filePath = 'any.js';

describe('v7 patch - update imports', function () {
  let mockContext;

  beforeEach(function () {
    mockContext = makeContext();
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('replaces gasket.logger.warning with gasket.logger.warn', async function () {
    mockContext.files.set(filePath, warningContent);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toContain(`gasket.logger.warn('This is a warning')`);
    expect(results).toContain(`gasket.logger.warn('This is another warning')`);
  });

  it('replaces logger.log with logger.info', async function () {
    mockContext.files.set(filePath, logContent);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toContain(`logger.info('This is a log');`);
    expect(results).toContain(`logger.info('This is another log');`);
  });

});
