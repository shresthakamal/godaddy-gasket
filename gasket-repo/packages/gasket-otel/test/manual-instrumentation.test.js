import { vi } from 'vitest';

const mockEnvVariableCheck = vi.fn();
const mockHandleDebug = vi.fn();
const mockCreateSdk = vi.fn();
const mockRegisterOptions = vi.fn()
  .mockImplementation(
    (options) => options.autoInstrumentationOptions
  );

vi.mock('../lib/register-options.js', () => ({
  registerOptions: mockRegisterOptions
}));


vi.mock('../lib/env-variable-check.js', () => ({
  envVariableCheck: mockEnvVariableCheck
}));

vi.mock('../lib/handle-debug.js', () => ({
  handleDebug: mockHandleDebug
}));

vi.mock('../lib/create-sdk.js', () => ({
  createSdk: mockCreateSdk
}));

const { register } = await import('../lib/manual-instrumentation.js');

describe('manual-instrumentation', () => {

  describe('register', () => {

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should call envVariableCheck', async () => {
      register();
      expect(mockEnvVariableCheck).toHaveBeenCalled();
    });

    it('should call handleDebug', async () => {
      register();
      expect(mockHandleDebug).toHaveBeenCalled();
    });

    it('should call createSdk', async () => {
      register();
      expect(mockCreateSdk).toHaveBeenCalled();
    });

    it('should passed options to registerOptions', async () => {
      const options = { foo: 'bar' };
      register(options);
      expect(mockRegisterOptions).toHaveBeenCalledWith(options);
    });

    it('should pass instumentation options to createSdk', async () => {
      const options = {
        foo: 'bar',
        autoInstrumentationOptions: { baz: 'qux' }
      };
      register(options);
      expect(mockCreateSdk).toHaveBeenCalledWith({ baz: 'qux' });
    });
  });
});
