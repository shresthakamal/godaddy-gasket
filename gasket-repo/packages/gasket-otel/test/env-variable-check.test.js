/* eslint-disable no-process-env */
import { vi } from 'vitest';
import { envVariableCheck } from '../lib/env-variable-check.js';

describe('envVariableCheck', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {

    vi.clearAllMocks();
  });

  it('should warn if OTEL_EXPORTER_OTLP_ENDPOINT is not set', () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    process.env.OTEL_EXPORTER_OTLP_HEADERS = 'test';
    envVariableCheck();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Missing required OTel environment variables: OTEL_EXPORTER_OTLP_ENDPOINT'
      )
    );
  });

  it('should warn if OTEL_EXPORTER_OTLP_HEADERS is not set', () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'test';
    process.env.OTEL_EXPORTER_OTLP_HEADERS = '';
    envVariableCheck();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Missing required OTel environment variables: OTEL_EXPORTER_OTLP_HEADERS'
      )
    );
  });

  it('should warn if multiple environment variables are not set', () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    process.env.OTEL_EXPORTER_OTLP_HEADERS = '';
    envVariableCheck();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Missing required OTel environment variables: OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_EXPORTER_OTLP_HEADERS'
      )
    );
  });

  it('should not warn if all required environment variables are set', () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'test';
    process.env.OTEL_EXPORTER_OTLP_HEADERS = 'test';
    envVariableCheck();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
