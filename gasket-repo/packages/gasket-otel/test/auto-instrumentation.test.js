import { vi } from 'vitest';

const mockEnvVariableCheck = vi.fn();
const mockHandleDebug = vi.fn();
const mockCreateSdk = vi.fn();

vi.mock('../lib/env-variable-check.js', () => ({
  envVariableCheck: mockEnvVariableCheck
}));

vi.mock('../lib/handle-debug.js', () => ({
  handleDebug: mockHandleDebug
}));

vi.mock('../lib/create-sdk.js', () => ({
  createSdk: mockCreateSdk
}));

// Invocation via import
await import('../lib/auto-instrumentation.js');

describe('auto-instrumentation', () => {

  it('should call envVariableCheck', async () => {
    expect(mockEnvVariableCheck).toHaveBeenCalled();
  });

  it('should call handleDebug', async () => {
    expect(mockHandleDebug).toHaveBeenCalled();
  });

  it('should call createSdk', async () => {
    expect(mockCreateSdk).toHaveBeenCalled();
  });
});
