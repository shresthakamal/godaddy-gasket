const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v7/rename-deprecated-functions');
const patch = wrapper.wrapped;

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

  it('updates deprecated authStatus from @godaddy/gasket-auth', async function () {
    const content = `
    import { useAuthState, authStatus } from '@godaddy/gasket-auth';
    authStatus.LOADING
    `;
    mockContext.files.set(filePath, content);

    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toEqual(`
    import { useAuthState, AuthStatus } from '@godaddy/gasket-auth';
    AuthStatus.LOADING
    `);
  });

  it('updates deprecated createAppComponent from @godaddy/gasket-next', async function () {
    const content = `
    import { createAppComponent } from '@godaddy/gasket-next';
    `;
    mockContext.files.set(filePath, content);

    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toEqual(`
    import { createApp } from '@godaddy/gasket-next';
    `);
  });

  it('updates deprecated functions from two different pacakges', async function () {
    const content = `
    import { createAppComponent } from '@godaddy/gasket-next';
    import { useAuthState, authStatus } from '@godaddy/gasket-auth';
    authStatus.LOADING
    const app = createAppComponent()
    `;
    mockContext.files.set(filePath, content);

    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toEqual(`
    import { createApp } from '@godaddy/gasket-next';
    import { useAuthState, AuthStatus } from '@godaddy/gasket-auth';
    AuthStatus.LOADING
    const app = createApp()
    `);
  });

  it('does not update functions if they are not from packges in packageMappings', async function () {
    const content = `
    import { createAppComponent } from 'some-other-package';
    import { useAuthState, authStatus } from 'another-package';
    authStatus.LOADING
    const app = createAppComponent()
    `;
    mockContext.files.set(filePath, content);

    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toEqual(content);
  });

  it('updates deprecated functions using require', async function () {
    const content = `
    const { createAppComponent } = require('@godaddy/gasket-next');
    const { useAuthState, authStatus } = require('@godaddy/gasket-auth');
    authStatus.LOADING
    const app = createAppComponent()
    `;
    mockContext.files.set(filePath, content);

    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toEqual(`
    const { createApp } = require('@godaddy/gasket-next');
    const { useAuthState, AuthStatus } = require('@godaddy/gasket-auth');
    AuthStatus.LOADING
    const app = createApp()
    `);
  });


  it('does not update functions if they are not from packges in packageMappings using require', async function () {
    const content = `
    const { createAppComponent } = require('some-other-package');
    const { useAuthState, authStatus } = require('another-package');
    authStatus.LOADING
    const app = createAppComponent()
    `;
    mockContext.files.set(filePath, content);

    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toEqual(content);
  });
});
