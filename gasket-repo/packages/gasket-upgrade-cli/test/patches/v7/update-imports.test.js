const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v7/update-imports');
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

  it('updates legacy package requires to new @godaddy name', async function () {
    const content = `
const { responseData } require('@gasket/plugin-config');
`;
    mockContext.files.set(filePath, content);

    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toContain("const { responseData } require('@gasket/plugin-data');");
  });

  it('updates legacy package imports to new @godaddy name', async function () {
    const content = `
import { responseData } from '@gasket/plugin-config';
`;
    mockContext.files.set(filePath, content);

    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toContain("import { responseData } from '@gasket/plugin-data';");
  });

  it('ignores json files', async function () {
    const content = {
      dependencies: {
        '@gasket/plugin-data': '*'
      }
    };
    mockContext.files.set('package.json', content);

    await patch(mockContext);
    const results = mockContext.files.get('package.json');
    expect(results).toEqual(content);
  });
});
