const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v6/update-imports');
const patch = wrapper.wrapped;

const filePath = 'any.js';

describe('v6 patch - update imports', function () {
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
const { withLocaleRequired } require('@gasket/intl');
`;
    mockContext.files.set(filePath, content);

    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toContain("const { withLocaleRequired } require('@gasket/react-intl');");
  });

  it('updates legacy package imports to new @godaddy name', async function () {
    const content = `
import { withLocaleRequired } from '@gasket/intl';
`;
    mockContext.files.set(filePath, content);

    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toContain("import { withLocaleRequired } from '@gasket/react-intl';");
  });

  it('ignores json files', async function () {
    const content = {
      dependencies: {
        '@gasket/intl': '*'
      }
    };
    mockContext.files.set('package.json', content);

    await patch(mockContext);
    const results = mockContext.files.get('package.json');
    expect(results).toEqual(content);
  });
});
