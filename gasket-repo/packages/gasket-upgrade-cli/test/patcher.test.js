const path = require('path');
const mockReadFile = jest.fn().mockImplementation(filePath => {
  if (path.extname(filePath) === '.json') return Promise.resolve('{}');
  return filePath + ' content';
});
const mockWriteFile = jest.fn().mockResolvedValue();
const mockGlob = jest.fn().mockResolvedValue([
  'file-1.js',
  'file-2.js'
]);
const mockIsFile = jest.fn();
const mockStat = jest.fn(() => ({
  isFile: mockIsFile
}));

jest.mock('util', () => ({
  ...jest.requireActual('util'),
  promisify: f => f
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    writeFile: mockWriteFile,
    readFile: mockReadFile,
    stat: mockStat
  }
}));

jest.mock('glob', () => mockGlob);

const Patcher = require('../lib/patcher');

describe('Patcher', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      cwd: path.join('path', 'to', 'project'),
      git: {
        add: jest.fn()
      },
      pkg: {}
    };

    mockIsFile.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('new instance has context with expected patch helpers', () => {
    const instance = new Patcher(mockContext);

    expect(instance).toHaveProperty('context');
    expect(instance.context).toHaveProperty('files');
    expect(instance.context).toHaveProperty('updateContent');
  });

  describe('.context.updateContent', () => {
    let patcher, updateContent;

    beforeEach(async () => {
      patcher = new Patcher(mockContext);
      updateContent = patcher.context.updateContent;

      await patcher.load();
    });

    it('ignores files not loaded', () => {
      const stub = jest.fn();
      updateContent('missing.js', stub);

      expect(stub).not.toHaveBeenCalled();
    });

    it('executes transform for loaded files', () => {
      const stub = jest.fn();
      updateContent('file-1.js', stub);

      expect(stub).toHaveBeenCalled();
    });

    it('sets transformed content for file', () => {
      updateContent('file-1.js', () => 'updated');

      expect(patcher.context.files.get('file-1.js')).toEqual('updated');
    });
  });

  describe('.load', () => {
    it('finds javascript files for a project', async () => {
      const instance = new Patcher(mockContext);

      await instance.load();
      expect(mockGlob).toHaveBeenCalled();
      expect(mockGlob.mock.calls[0][0]).toContain('js');
      expect(mockGlob.mock.calls[0][0]).toContain('jsx');
      expect(mockGlob.mock.calls[0][0]).toContain('ts');
      expect(mockGlob.mock.calls[0][0]).toContain('tsx');
    });

    it('loads js file content', async () => {
      const instance = new Patcher(mockContext);

      await instance.load();
      expect(instance.context.files.has('file-1.js')).toBeTruthy();
      expect(instance.context.files.has('file-2.js')).toBeTruthy();
    });

    it('loads package.json content as object', async () => {
      const instance = new Patcher(mockContext);

      await instance.load();
      expect(instance.context.files.has('package.json')).toBeTruthy();
      expect(instance.context.files.get('package.json')).toBeInstanceOf(Object);
    });

    it('does not load directory content', async () => {
      const instance = new Patcher(mockContext);

      mockIsFile.mockReturnValueOnce(false);
      await instance.load();
      expect(instance.context.files.has('file-1.js')).not.toBeTruthy();
      expect(instance.context.files.has('file-2.js')).toBeTruthy();
    });
  });

  describe('.apply', () => {
    let patcher, patchStub;

    beforeEach(async () => {
      patchStub = jest.fn();
      patcher = new Patcher(mockContext);

      await patcher.load();
    });

    it('executes patches with context', async () => {
      await patcher.apply([patchStub]);

      expect(patchStub).toHaveBeenCalledWith(patcher.context);
    });

    it('executes multiple patches', async () => {
      await patcher.apply([patchStub, patchStub, patchStub]);

      expect(patchStub).toHaveBeenCalledTimes(3);
    });

    it('executes prompts from patches with context', async () => {
      patchStub.prompt = jest.fn();
      await patcher.apply([patchStub]);

      expect(patchStub.prompt).toHaveBeenCalledWith(patcher.context);
      expect(patchStub).toHaveBeenCalledWith(patcher.context);
    });
  });

  describe('.save', () => {
    let patcher;

    beforeEach(async () => {
      patcher = new Patcher(mockContext);

      await patcher.load();
    });

    it('does not write files if no changes', async () => {
      await patcher.save();

      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('writes modified files only', async () => {
      patcher.context.files.set('file-1.js', 'updated');
      // bypass modified capture
      patcher.context.files._set('file-2.js', 'updated');
      await patcher.save();

      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      expect(mockWriteFile).toHaveBeenCalledWith(
        path.join(mockContext.cwd, 'file-1.js'),
        'updated',
        'utf8'
      );
      expect(mockWriteFile).not.toHaveBeenCalledWith(path.join(mockContext.cwd, 'file-2.js'));
    });

    it('writes modified files with absolute path', async () => {
      patcher.context.updateContent('file-1.js', () => 'updated');
      await patcher.save();

      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      expect(mockWriteFile).toHaveBeenCalledWith(
        path.join(mockContext.cwd, 'file-1.js'),
        'updated',
        'utf8'
      );
    });

    it('git adds files with changes', async () => {
      patcher.context.updateContent('file-1.js', () => 'updated');
      patcher.context.files.set('file-2.js', 'updated');
      await patcher.save();

      expect(mockContext.git.add).toHaveBeenCalledTimes(1);
      expect(mockContext.git.add).toHaveBeenCalledWith(['file-1.js', 'file-2.js']);
    });

    it('stringify json objects before writing', async () => {
      patcher.context.updateContent('package.json', () => ({ name: 'bogus' }));
      await patcher.save();

      expect(mockWriteFile.mock.calls[0][0]).toContain('package.json');
      expect(typeof mockWriteFile.mock.calls[0][1]).toEqual('string');
    });

    it('deletes file paths from _modified', async () => {
      patcher.context.files.delete('file-1.js');
      await patcher.save();

      expect(patcher.context.files._modified.has('file-1.js')).toBeFalsy();
    });
  });
});

