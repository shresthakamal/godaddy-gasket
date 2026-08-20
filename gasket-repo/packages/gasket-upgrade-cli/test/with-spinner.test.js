const mockStart = jest.fn();
const mockSucceed = jest.fn();
const mockFail = jest.fn();
const mockSpinner = {
  start: mockStart,
  succeed: mockSucceed,
  fail: mockFail
};
const mockOra = jest.fn().mockReturnValue(mockSpinner);

jest.mock('ora', () => mockOra);

const withSpinner = require('../lib/with-spinner');

describe('withSpinner', () => {
  let mockContext, mockFn, mockLabel;

  beforeEach(() => {
    mockLabel = 'mockAction';
    mockFn = () => {};

    mockContext = {
      cwd: '/some/path/my-app'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns a wrapped async function', () => {
    const result = withSpinner(mockLabel, mockFn);
    expect(typeof result).toBe('function');
  });

  it('exposes wrapped function', () => {
    const result = withSpinner(mockLabel, mockFn);
    expect(result).toHaveProperty('wrapped', mockFn);
  });

  describe('instance', () => {
    let mockAction;

    beforeEach(function () {
      mockAction = withSpinner(mockLabel, mockFn);
    });

    it('instantiates spinner with label', async () => {
      mockAction = withSpinner(mockLabel, mockFn);
      await mockAction(mockContext);
      expect(mockOra).toHaveBeenCalledWith({ text: mockLabel });
    });

    it('instantiates spinner with extra options', async () => {
      mockAction = withSpinner(mockLabel, mockFn, { indent: 2 });
      await mockAction(mockContext);
      expect(mockOra).toHaveBeenCalledWith({ text: mockLabel, indent: 2 });
    });

    it('starts the spinner by default', async () => {
      mockAction = withSpinner(mockLabel, mockFn);
      await mockAction(mockContext);
      expect(mockStart).toHaveBeenCalled();
    });

    it('sets spinner to succeed if started', async () => {
      mockSpinner.isSpinning = true;
      mockAction = withSpinner(mockLabel, mockFn);
      await mockAction(mockContext);
      expect(mockSucceed).toHaveBeenCalled();
    });

    it('sets spinner to fail if error', async () => {
      mockFn = () => {
        throw new Error('bad stuff');
      };
      mockAction = withSpinner(mockLabel, mockFn);

      try {
        await mockAction(mockContext);
      } catch {
        // continue
      }
      expect(mockFail).toHaveBeenCalled();
    });

    it('rethrows originating error', async () => {
      const mockError = new Error('bad stuff');
      mockFn = () => {
        throw mockError;
      };
      mockAction = withSpinner(mockLabel, mockFn);
      await expect(mockAction(mockContext)).rejects.toThrow(mockError);
    });

    it('injects spinner to wrapped function', async () => {
      mockFn = (ctx, spinner) => {
        expect(spinner).toEqual(mockSpinner);
      };
      mockAction = withSpinner(mockLabel, mockFn);
      await mockAction(mockContext);
    });
  });

});
