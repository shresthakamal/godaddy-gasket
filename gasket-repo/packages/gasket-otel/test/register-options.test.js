/* eslint-disable no-process-env */
import { registerOptions } from '../lib/register-options.js';

describe('registerOptions', () => {

  it('should set service name', () => {
    const options = { serviceName: 'test-service' };
    registerOptions(options);
    expect(process.env.OTEL_SERVICE_NAME).toEqual('test-service');
  });

  it('should set otlp endpoint', () => {
    const options = { exporterOtlpEndpoint: 'http://localhost:4317' };
    registerOptions(options);
    expect(process.env.OTEL_EXPORTER_OTLP_ENDPOINT).toEqual('http://localhost:4317');
  });

  describe('should set otlp headers', () => {

    it('allows for an object', () => {
      const options = { exporterOtlpHeaders: { foo: 'bar' } };
      registerOptions(options);
      expect(process.env.OTEL_EXPORTER_OTLP_HEADERS).toEqual('foo=bar');
    });

    it('allows for a string', () => {
      const options = { exporterOtlpHeaders: 'foo=bar' };
      registerOptions(options);
      expect(process.env.OTEL_EXPORTER_OTLP_HEADERS).toEqual('foo=bar');
    });
  });

  it('should set service version', () => {
    const options = { serviceVersion: '1.0.0' };
    registerOptions(options);
    expect(process.env.OTEL_SERVICE_VERSION).toEqual('1.0.0');
  });

  describe('should set enabled instrumentations', () => {

    it('allows for an array', () => {
      const options = { nodeEnabledInstrumentations: ['express', 'http'] };
      registerOptions(options);
      expect(process.env.OTEL_NODE_ENABLED_INSTRUMENTATIONS).toEqual('express,http');
    });

    it('allows for a string', () => {
      const options = { nodeEnabledInstrumentations: 'express' };
      registerOptions(options);
      expect(process.env.OTEL_NODE_ENABLED_INSTRUMENTATIONS).toEqual('express');
    });
  });

  describe('should set resource detectors', () => {

    it('allows for an array', () => {
      const options = { nodeResourceDetectors: ['gcp', 'aws'] };
      registerOptions(options);
      expect(process.env.OTEL_NODE_RESOURCE_DETECTORS).toEqual('gcp,aws');
    });

    it('allows for a string', () => {
      const options = { nodeResourceDetectors: 'gcp' };
      registerOptions(options);
      expect(process.env.OTEL_NODE_RESOURCE_DETECTORS).toEqual('gcp');
    });
  });

  it('should set debug', () => {
    const options = { debug: 'true' };
    registerOptions(options);
    expect(process.env.OTEL_DEBUG).toEqual('true');
  });

  it('should return autoInstrumentationOptions', () => {
    const options = { autoInstrumentationOptions: { foo: 'bar' } };
    expect(registerOptions(options)).toEqual({ foo: 'bar' });
  });

  it('should not set spanProcessors as an env variable', () => {
    const mockProcessor = { onStart: () => {}, onEnd: () => {} };
    registerOptions({ spanProcessors: [mockProcessor], serviceName: 'test' });
    expect(process.env.OTEL_SERVICE_NAME).toEqual('test');
    expect(process.env.spanProcessors).toBeUndefined();
  });

  it('should pass spanProcessors through in the result object', () => {
    const mockProcessor = { onStart: () => {}, onEnd: () => {} };
    const result = registerOptions({ spanProcessors: [mockProcessor] });
    expect(result.spanProcessors).toEqual([mockProcessor]);
  });

  it('should include both autoInstrumentationOptions and spanProcessors in result', () => {
    const mockProcessor = { onStart: () => {}, onEnd: () => {} };
    const options = {
      autoInstrumentationOptions: { foo: 'bar' },
      spanProcessors: [mockProcessor]
    };
    const result = registerOptions(options);
    expect(result).toEqual({ foo: 'bar', spanProcessors: [mockProcessor] });
  });

  it('should return empty object when neither autoInstrumentationOptions nor spanProcessors provided', () => {
    const result = registerOptions({ serviceName: 'test' });
    expect(result).toEqual({});
  });
});
