const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v6/update-locale-paths');
const patch = wrapper.wrapped;

const filePath = 'any.js';

/**
 * Various v5 scenarios and what they should be in v6
 * @see: https://github.com/godaddy/gasket/tree/v5/packages/gasket-intl#examples
 */
const expected = {
  // no change to defaults
  'withLocaleRequired()': 'withLocaleRequired()',
  // string
  'withLocaleRequired(\'@some/module\')': 'withLocaleRequired(\'/locales/modules/@some/module\')',
  'withLocaleRequired(\'app-name\')': 'withLocaleRequired()',
  'withLocaleRequired(\'@hui/shared-something\')': 'withLocaleRequired(\'/locales/modules/@hui/shared-something\')',
  'withLocaleRequired([\'app-name\', \'@some/module\'])': 'withLocaleRequired([\'/locales\', \'/locales/modules/@some/module\'])',
  'withLocaleRequired(\'app-name\', { loading: <Spinner> })': 'withLocaleRequired(\'/locales\', { loading: <Spinner> })',
  'withLocaleRequired(null, { loading: <Spinner> })': 'withLocaleRequired(\'/locales\', { loading: <Spinner> })',
  // namespace/split
  'withLocaleRequired(\'@some/module.namespace\')':
    'withLocaleRequired(\'/locales/modules/@some/module/:locale/namespace.json\')',
  'withLocaleRequired(\'app-name.namespace\')': 'withLocaleRequired(\'/locales/:locale/namespace.json\')',
  'withLocaleRequired(\'.namespace\')': 'withLocaleRequired(\'/locales/:locale/namespace.json\')',
  'withLocaleRequired([\'app-name.namespace\', \'@some/module.namespace\'])':
    'withLocaleRequired([\'/locales/:locale/namespace.json\', \'/locales/modules/@some/module/:locale/namespace.json\'])',
  'withLocaleRequired(\'.namespace\', { loading: <Spinner> })':
    'withLocaleRequired(\'/locales/:locale/namespace.json\', { loading: <Spinner> })',
  // object
  'withLocaleRequired({ module: \'@some/module\' })': 'withLocaleRequired(\'/locales/modules/@some/module\')',
  'withLocaleRequired({ namespace: \'namespace\' })': 'withLocaleRequired(\'/locales/:locale/namespace.json\')',
  'withLocaleRequired({ module: \'@some/module\', namespace: \'namespace\' })':
    'withLocaleRequired(\'/locales/modules/@some/module/:locale/namespace.json\')',
  'withLocaleRequired({ module: \'@some/module\', namespace: \'namespace\' }, { loading: <Spinner/> })':
    'withLocaleRequired(\'/locales/modules/@some/module/:locale/namespace.json\', { loading: <Spinner/> })',
  // variable
  'withLocaleRequired(SOME_CONST)': 'withLocaleRequired(SOME_CONST)'
};

describe('v6 patch - update imports', function () {
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
    Object.entries(expected).forEach(([v5, v6]) => {
      it(`${v5}`, async function () {
        mockContext.files.set(filePath, v5);
        await patch(mockContext);
        const results = mockContext.files.get(filePath);
        expect(results).toContain(v6);
      });
    });
  });

  it('adds messages for non-adjusted arguments', async function () {
    mockContext.files.set(filePath, 'withLocaleRequired(SOME_CONST)');
    await patch(mockContext);
    expect(mockContext.messages).toContain('Could not fixup localePath for `withLocaleRequired(SOME_CONST)`');
  });

  it('retains already fixed localePaths', async function () {
    mockContext.files.set(filePath, 'withLocaleRequired(\'/locales/bogus\')');
    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toContain('withLocaleRequired(\'/locales/bogus\')');
  });

  it('does not add messages defaults', async function () {
    mockContext.files.set(filePath, 'withLocaleRequired()');
    await patch(mockContext);
    expect(mockContext.messages).toHaveLength(0);
  });

  describe('initialProps', function () {

    it('adds initialProps option for pages', async function () {
      mockContext.files.set('pages/' + filePath, 'withLocaleRequired(\'/locales/bogus\')');
      await patch(mockContext);
      const results = mockContext.files.get('pages/' + filePath);
      expect(results).toContain('withLocaleRequired(\'/locales/bogus\', { initialProps: true })');
    });

    it('adds initialProps to existing options for pages', async function () {
      mockContext.files.set('pages/' + filePath, 'withLocaleRequired(\'/locales/bogus\', { loading: null })');
      await patch(mockContext);
      const results = mockContext.files.get('pages/' + filePath);
      expect(results).toContain('withLocaleRequired(\'/locales/bogus\', { initialProps: true, loading: null })');
    });

    it('retains existing initialProps option for pages', async function () {
      mockContext.files.set('pages/' + filePath, 'withLocaleRequired(\'/locales/bogus\', { initialProps: false })');
      await patch(mockContext);
      const results = mockContext.files.get('pages/' + filePath);
      expect(results).toContain('withLocaleRequired(\'/locales/bogus\', { initialProps: false })');
    });

    it('does not shortcut localePathPart if initialProps', async function () {
      mockContext.files.set('pages/' + filePath, 'withLocaleRequired(\'app-name\')');
      await patch(mockContext);
      const results = mockContext.files.get('pages/' + filePath);
      expect(results).toContain('withLocaleRequired(\'/locales\', { initialProps: true })');
    });

    it('does not shortcut localePathPart if empty on pages', async function () {
      mockContext.files.set('pages/' + filePath, 'withLocaleRequired()');
      await patch(mockContext);
      const results = mockContext.files.get('pages/' + filePath);
      expect(results).toContain('withLocaleRequired(\'/locales\', { initialProps: true })');
    });
  });

  describe('handles extensions', function () {
    ['.js', '.jsx', '.ts', '.tsx'].forEach(ext => {
      it(`${ext}`, async function () {
        const extFile = `any.${ ext }`;
        mockContext.files.set(extFile, 'withLocaleRequired(\'app-name\')');
        await patch(mockContext);
        const results = mockContext.files.get(extFile);
        expect(results).toContain('withLocaleRequired()');
      });
    });
  });
});
