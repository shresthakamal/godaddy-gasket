const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v7/add-server-file');
const patch = wrapper.wrapped;

jest.mock('fs', () => {
  const mod = jest.requireActual('fs');
  return {
    ...mod,
    promises: {
      ...mod.promises,
      writeFile: jest.fn()
    }
  };
});

const fs = require('fs');

describe('v7 patch - add server file', function () {
  let mockContext;

  beforeEach(function () {
    mockContext = makeContext();
    mockContext.git = {
      add: jest.fn()
    };
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('writes server file', async function () {
    await patch(mockContext);

    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('server.mjs'),
      expect.stringContaining('gasket.actions.startServer()'),
      'utf8'
    );
  });

  it('adds server file to git', async function () {
    await patch(mockContext);

    expect(mockContext.git.add).toHaveBeenCalledWith(expect.stringContaining('server.mjs'));
  });
});
