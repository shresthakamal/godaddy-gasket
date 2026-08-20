/* eslint-disable no-process-env */
import { vi } from 'vitest';

vi.mock('@opentelemetry/api', () => ({
  DiagConsoleLogger: vi.fn(),
  DiagLogLevel: vi.fn(),
  diag: {
    setLogger: vi.fn()
  }
}));

const api = await import('@opentelemetry/api');
const { handleDebug } = await import('../lib/handle-debug.js');

describe('handleDebug', () => {

  it('should not set logger if OTEL_DEBUG is not set', async () => {
    process.env.OTEL_DEBUG = '';
    handleDebug();
    expect(api.diag.setLogger).not.toHaveBeenCalled();
  });

  it('should set logger if OTEL_DEBUG is set', async () => {
    process.env.OTEL_DEBUG = 'true';
    handleDebug();
    expect(api.diag.setLogger).toHaveBeenCalled();
  });
});
