const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v7/update-package-scripts');
const patch = wrapper.wrapped;


describe('v7 patch - update package scripts', function () {
  let mockContext, mockPackage;

  beforeEach(function () {
    mockContext = makeContext();
    mockPackage = {
      scripts: {}
    };

    mockContext.files.set('package.json', mockPackage);
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('updates build script', async function () {
    mockPackage.scripts = {
      build: 'gasket build'
    };

    await patch(mockContext);

    expect(mockPackage.scripts).toEqual(expect.objectContaining({
      build: 'next build'
    }));
  });

  it('updates start script', async function () {
    mockPackage.scripts = {
      start: 'gasket start'
    };

    await patch(mockContext);

    expect(mockPackage.scripts).toEqual(expect.objectContaining({
      start: 'node server.mjs'
    }));
  });

  it('updates local script', async function () {
    mockPackage.scripts = {
      local: 'gasket local'
    };

    await patch(mockContext);

    expect(mockPackage.scripts).toEqual(expect.objectContaining({
      local: 'GASKET_DEV=1 nodemon server.mjs'
    }));
  });

  it('adds preview script', async function () {
    await patch(mockContext);

    expect(mockPackage.scripts).toEqual(expect.objectContaining({
      preview: 'npm run build && npm run start'
    }));
  });
});
