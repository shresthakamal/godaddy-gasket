const mockWriteFile = jest.fn().mockResolvedValue();
const mockExistsSync = jest.fn().mockReturnValue(true);
const mockReadFile = jest.fn().mockResolvedValue(`
<Translation>
    <File HoPath="locales/en-US.json"
          HbPath="locales/{Culture}.json"
          Cultures="da, da-DK"/>
    <File HoPath="locales/en-US/page-level.json"
          HbPath="locales/{Culture}/page-level.json"
          Cultures="da, da-DK"/>
</Translation>

`);

jest.mock('fs', () => {
  const mod = jest.requireActual('fs');
  return {
    ...mod,
    promises: {
      ...mod.promises,
      writeFile: mockWriteFile,
      readFile: mockReadFile
    },
    existsSync: mockExistsSync
  };
});

jest.mock('util', () => ({
  ...jest.requireActual('util'),
  promisify: f => f
}));

const wrapper = require('../../../lib/patches/v6/update-golf-manifest');
const path = require('path');
const { makeContext } = require('../../../lib/patcher');
const cwd = '/path/to/app';

describe('v6 patch - update GoLF manifest', function () {
  let mockContext, mockSpinner, patch;

  beforeEach(function () {
    mockContext = makeContext({
      cwd,
      pkg: {},
      git: {
        mv: jest.fn()
      },
      moveLocaleToPublic: true
    });
    mockContext.files.set('package.json', { name: 'app-name' });
    mockSpinner = {
      info: jest.fn()
    };
    patch = wrapper.wrapped;
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('moves manifest.xml to root of repo', async function () {
    await patch(mockContext, mockSpinner);
    expect(mockContext.git.mv).toHaveBeenCalled();
    expect(mockContext.git.mv.mock.calls[0][0]).toContain(path.join(cwd, '/public/locales/manifest.xml'));
    expect(mockContext.git.mv.mock.calls[0][1]).toContain(path.join(cwd, '/manifest.xml'));
  });

  it('updates paths with public/', async function () {
    await patch(mockContext, mockSpinner);
    expect(mockWriteFile).toHaveBeenCalled();
    expect(mockWriteFile.mock.calls[0][1]).toContain('public/locales/en-US.json');
    expect(mockWriteFile.mock.calls[0][1]).toContain('public/locales/{Culture}.json');
    expect(mockWriteFile.mock.calls[0][1]).toContain('locales/en-US/page-level.json');
    expect(mockWriteFile.mock.calls[0][1]).toContain('locales/{Culture}/page-level.json');
  });

  it('logs info if not moving', async function () {
    mockContext.moveLocaleToPublic = false;
    await patch(mockContext, mockSpinner);
    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('(skipped)')
    );
  });

  it('logs info if does not exist', async function () {
    mockExistsSync.mockReturnValueOnce(false);
    await patch(mockContext, mockSpinner);
    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('(skipped)')
    );
  });
});
