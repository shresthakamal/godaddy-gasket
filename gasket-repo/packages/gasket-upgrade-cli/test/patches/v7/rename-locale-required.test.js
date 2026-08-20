const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v7/rename-locale-required');
const patch = wrapper.wrapped;

const filePath = 'any.js';

/**
 * Various v6 scenarios and what they should be in v7
 */
const expected = {
  // imports
  'import { LocaleRequired } from \'@gasket/react-intl\';':
    'import { LocaleFileRequired } from \'@gasket/react-intl\';',
  'import { LocaleRequired, withLocaleRequired } from \'@gasket/react-intl\';\n':
    'import { LocaleFileRequired, withLocaleFileRequired } from \'@gasket/react-intl\';\n',
  // components
  '<LocaleRequired>':
    '<LocaleFileRequired>',
  '<LocaleRequired loading={ <Spinner> }>':
    '<LocaleFileRequired loading={ <Spinner> }>',
  // hocs
  'withLocaleRequired(\'/locales/modules/@some/module\')':
    'withLocaleFileRequired(\'/locales/modules/@some/module\')',
  'withLocaleRequired([\'/locales\', \'/locales/modules/@some/module\'])':
    'withLocaleFileRequired([\'/locales\', \'/locales/modules/@some/module\'])',
  'withLocaleRequired(\'/locales\', { loading: <Spinner> })':
    'withLocaleFileRequired(\'/locales\', { loading: <Spinner> })',
  // initial props
  'withLocaleRequired(\'/locales\', { initialProps: true })':
    'withLocaleFileRequired(\'/locales\')',
  'withLocaleRequired(\'/locales\', { loading: <Spinner>, initialProps: true })':
    'withLocaleFileRequired(\'/locales\', { loading: <Spinner> })',
  'withLocaleRequired(\'/locales\', { initialProps: true, loading: <Spinner> })':
    'withLocaleFileRequired(\'/locales\', { loading: <Spinner> })'
};

describe('v7 patch - update imports', function () {
  let mockContext;

  beforeEach(function () {
    mockContext = makeContext();
    mockContext.files.set('package.json', { name: 'app-name' });
  });

  it('is decorated with spinner', async function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  describe('formats', function () {
    Object.entries(expected).forEach(([v6, v7]) => {
      it(`${v6}`, async function () {
        mockContext.files.set(filePath, v6);
        await patch(mockContext);
        const results = mockContext.files.get(filePath);
        expect(results).toContain(v7);
      });
    });
  });
});
