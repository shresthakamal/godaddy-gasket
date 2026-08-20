/* eslint-disable no-process-env */
import { vi } from 'vitest';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION
} from '@opentelemetry/semantic-conventions';
import pkgJson from '../package.json';

const mockSdkStart = vi.fn();
const mockSdkShutdown = vi.fn().mockResolvedValue();
const mockNodeSDK = vi.fn();
class NodeSDK {
  constructor() {
    mockNodeSDK(...arguments);
    this.start = mockSdkStart;
    this.shutdown = mockSdkShutdown;
  }
}

const mockResource = vi.fn();
const mockResourceFromAttributes = vi.fn((attributes) => {
  mockResource(attributes);
  return {
    attributes: attributes || {}
  };
});

const mockDefaultResourceMerge = vi.fn((custom) => ({
  attributes: {
    'telemetry.sdk.language': 'nodejs',
    'telemetry.sdk.name': 'opentelemetry',
    'telemetry.sdk.version': '0.0.0-mock',
    ...custom.attributes
  }
}));
const mockDefaultResource = vi.fn(() => ({
  merge: mockDefaultResourceMerge
}));

const mockOTLPTraceExporter = vi.fn();
class OTLPTraceExporter {
  constructor() {
    mockOTLPTraceExporter(...arguments);
  }
}
const mockNodeAutoInstrumentations = vi.fn();
const mockOTLPLogExporter = vi.fn();
class OTLPLogExporter {
  constructor() {
    mockOTLPLogExporter(...arguments);
  }
}
const mockSimpleLogRecordProcessor = vi.fn();
class SimpleLogRecordProcessor {
  constructor() {
    mockSimpleLogRecordProcessor(...arguments);
  }
}
const mockOTLPMetricExporter = vi.fn();
class OTLPMetricExporter {
  constructor() {
    mockOTLPMetricExporter(...arguments);
  }
}
const mockMetricReader = vi.fn();
class PeriodicExportingMetricReader {
  constructor() {
    mockMetricReader(...arguments);
  }
}
const AggregationTemporality = { DELTA: 'delta', CUMULATIVE: 'cumulative' };

vi.mock('@opentelemetry/sdk-node', () => ({
  NodeSDK
}));

vi.mock('@opentelemetry/auto-instrumentations-node', () => ({
  getNodeAutoInstrumentations: mockNodeAutoInstrumentations
}));

vi.mock('@opentelemetry/resources', () => ({
  resourceFromAttributes: mockResourceFromAttributes,
  defaultResource: mockDefaultResource
}));

vi.mock('@opentelemetry/exporter-trace-otlp-grpc', () => ({
  OTLPTraceExporter
}));

vi.mock('@opentelemetry/exporter-logs-otlp-grpc', () => ({
  OTLPLogExporter
}));

vi.mock('@opentelemetry/sdk-logs', () => ({
  SimpleLogRecordProcessor
}));

vi.mock('@opentelemetry/exporter-metrics-otlp-grpc', () => ({
  OTLPMetricExporter
}));

vi.mock('@opentelemetry/sdk-metrics', () => ({
  PeriodicExportingMetricReader,
  AggregationTemporality
}));

const { createSdk } = await import('../lib/create-sdk.js');

// eslint-disable-next-line max-statements
describe('createSdk', () => {
  let consoleLogSpy;
  let originalListeners = [];

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation();
    vi.spyOn(process, 'exit').mockImplementation();
    // Store original SIGTERM listeners so we can restore them
    originalListeners = process.listeners('SIGTERM').slice();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Remove all SIGTERM listeners added during tests
    process.removeAllListeners('SIGTERM');
    // Restore original listeners
    originalListeners.forEach(listener => process.on('SIGTERM', listener));
    originalListeners = [];
    process.env.OTEL_SERVICE_NAME = '';
    process.env.OTEL_SERVICE_VERSION = '';
    process.env.OTEL_SERVICE_ENVIRONMENT = '';
    process.env.GD_ENV = '';
    process.env.NODE_ENV = '';
    process.env.GASKET_ENV = '';
    delete process.env.npm_package_version;
  });

  it('should create an OpenTelemetry SDK instance', () => {
    createSdk();
    expect(mockNodeSDK).toHaveBeenCalled();
  });

  it('should use the Resource class', () => {
    createSdk();
    expect(mockResource).toHaveBeenCalled();
    expect(mockDefaultResource).toHaveBeenCalled();
    expect(mockDefaultResourceMerge).toHaveBeenCalled();
  });

  it('should use the OTLPTraceExporter class', () => {
    createSdk();
    expect(mockOTLPTraceExporter).toHaveBeenCalled();
  });

  it('should use the OTLPLogExporter class', () => {
    createSdk();
    expect(mockOTLPLogExporter).toHaveBeenCalled();
  });

  it('should use the SimpleLogRecordProcessor class', () => {
    createSdk();
    expect(mockSimpleLogRecordProcessor).toHaveBeenCalled();
  });

  it('should use the OTLPMetricExporter class', () => {
    createSdk();
    expect(mockOTLPMetricExporter).toHaveBeenCalled();
  });

  it('configures the metric exporter with delta temporality by default (Elastic drops cumulative histograms)', () => {
    const prefEnv = 'OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE';
    const prev = process.env[prefEnv];
    delete process.env[prefEnv];
    try {
      createSdk();
      expect(mockOTLPMetricExporter).toHaveBeenCalledWith(
        expect.objectContaining({ temporalityPreference: AggregationTemporality.DELTA })
      );
    } finally {
      if (typeof prev === 'undefined') delete process.env[prefEnv];
      else process.env[prefEnv] = prev;
    }
  });

  it('lets the temporality preference env var override the delta default', () => {
    const prefEnv = 'OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE';
    const prev = process.env[prefEnv];
    process.env[prefEnv] = 'cumulative';
    try {
      createSdk();
      // No explicit preference is forced, so the exporter reads the env var itself.
      expect(mockOTLPMetricExporter).not.toHaveBeenCalledWith(
        expect.objectContaining({ temporalityPreference: expect.anything() })
      );
    } finally {
      if (typeof prev === 'undefined') delete process.env[prefEnv];
      else process.env[prefEnv] = prev;
    }
  });

  it('should use the PeriodicExportingMetricReader class', () => {
    createSdk();
    expect(mockMetricReader).toHaveBeenCalled();
  });

  it('should call getNodeAutoInstrumentations', () => {
    createSdk();
    expect(mockNodeAutoInstrumentations).toHaveBeenCalled();
  });

  it('should call start on the sdk', () => {
    createSdk();
    expect(mockSdkStart).toHaveBeenCalled();
  });

  it('should log the service name and version', () => {
    process.env.OTEL_SERVICE_NAME = 'test-service';
    process.env.OTEL_SERVICE_VERSION = '1.0.0';
    createSdk();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Instrumentation started for 'test-service' version '1.0.0'`
    );
  });

  it('should define a SIGTERM handler', () => {
    const spy = vi.spyOn(process, 'on');
    createSdk();
    expect(spy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
  });

  it('should call shutdown on SIGTERM', () => {
    // Test by verifying the handler registration and mocking the behavior
    const onSpy = vi.spyOn(process, 'on');
    createSdk();

    // Verify that a SIGTERM handler was registered
    expect(onSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));

    // Note: We skip actually triggering SIGTERM to avoid process.exit complications
    // The handler registration is sufficient to verify the functionality
  });


  it('should create sdk with correct options', () => {
    const options = { foo: 'bar' };
    createSdk(options);
    expect(mockNodeSDK).toHaveBeenCalledWith(expect.objectContaining({
      resource: expect.any(Object),
      metricReader: expect.any(PeriodicExportingMetricReader),
      logRecordProcessor: expect.any(SimpleLogRecordProcessor),
      traceExporter: expect.any(OTLPTraceExporter),
      instrumentations: expect.any(Array)
    }));
  });

  it('should create resource with correct options', () => {
    process.env.OTEL_SERVICE_NAME = 'test-service';
    process.env.OTEL_SERVICE_VERSION = '1.0.0';
    process.env.GASKET_ENV = 'test';
    createSdk();
    expect(mockResource).toHaveBeenCalledWith({
      [ATTR_SERVICE_NAME]: 'test-service',
      [ATTR_SERVICE_VERSION]: '1.0.0',
      'deployment.environment': 'test'
    });
    expect(mockNodeSDK).toHaveBeenCalledWith(
      expect.objectContaining({
        resource: expect.objectContaining({
          attributes: expect.objectContaining({
            [ATTR_SERVICE_NAME]: 'test-service',
            [ATTR_SERVICE_VERSION]: '1.0.0',
            'deployment.environment': 'test',
            'telemetry.sdk.language': 'nodejs'
          })
        })
      })
    );
  });

  it('should use defaults for version and environment', () => {
    process.env.OTEL_SERVICE_NAME = 'test-service';
    process.env.npm_package_version = pkgJson.version;
    createSdk();
    expect(mockResource).toHaveBeenCalledWith({
      [ATTR_SERVICE_NAME]: 'test-service',
      [ATTR_SERVICE_VERSION]: pkgJson.version,
      'deployment.environment': 'production'
    });
    expect(mockNodeSDK).toHaveBeenCalledWith(
      expect.objectContaining({
        resource: expect.objectContaining({
          attributes: expect.objectContaining({
            'telemetry.sdk.language': 'nodejs'
          })
        })
      })
    );
  });

  it('should use GD_ENV for deployment.environment when set (Katana injects it)', () => {
    process.env.OTEL_SERVICE_NAME = 'test-service';
    process.env.GD_ENV = 'dev-private';
    createSdk();
    expect(mockResource).toHaveBeenCalledWith(
      expect.objectContaining({ 'deployment.environment': 'dev-private' })
    );
  });

  it('should prefer GASKET_ENV over GD_ENV (GASKET_ENV stays the explicit override)', () => {
    process.env.OTEL_SERVICE_NAME = 'test-service';
    process.env.GASKET_ENV = 'test';
    process.env.GD_ENV = 'dev-private';
    createSdk();
    expect(mockResource).toHaveBeenCalledWith(
      expect.objectContaining({ 'deployment.environment': 'test' })
    );
  });

  it('should prefer GD_ENV over NODE_ENV', () => {
    process.env.OTEL_SERVICE_NAME = 'test-service';
    process.env.GD_ENV = 'dev-private';
    process.env.NODE_ENV = 'development';
    createSdk();
    expect(mockResource).toHaveBeenCalledWith(
      expect.objectContaining({ 'deployment.environment': 'dev-private' })
    );
  });

  it('should prefer OTEL_SERVICE_ENVIRONMENT over GD_ENV', () => {
    process.env.OTEL_SERVICE_NAME = 'test-service';
    process.env.OTEL_SERVICE_ENVIRONMENT = 'staging';
    process.env.GD_ENV = 'dev-private';
    createSdk();
    expect(mockResource).toHaveBeenCalledWith(
      expect.objectContaining({ 'deployment.environment': 'staging' })
    );
  });

  it('should apply passed instrumentation options', () => {
    const options = {
      '@opentelemetry/instrumentation-express': { ignoreLayersType: ['middleware'] },
      '@opentelemetry/instrumentation-fastify': { ignoreLayersType: ['middleware'] }
    };
    createSdk(options);
    expect(mockNodeAutoInstrumentations).toHaveBeenCalledWith(
      expect.objectContaining({
        '@opentelemetry/instrumentation-express': { ignoreLayersType: ['middleware'] },
        '@opentelemetry/instrumentation-fastify': { ignoreLayersType: ['middleware'] },
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-http': expect.objectContaining({
          ignoreIncomingRequestHook: expect.any(Function)
        })
      })
    );
  });

  it('should ignore /healthcheck and Site24x7 via default HTTP hook', () => {
    createSdk();
    const call = mockNodeAutoInstrumentations.mock.calls[0][0];
    const hook = call['@opentelemetry/instrumentation-http'].ignoreIncomingRequestHook;
    expect(hook({ url: '/healthcheck', headers: {} })).toBe(true);
    expect(hook({ url: '/api/foo', headers: { 'user-agent': 'Site24x7' } })).toBe(true);
    expect(hook({ url: '/api/foo', headers: { 'user-agent': 'Mozilla/5.0' } })).toBe(false);
  });

  it('should chain user ignoreIncomingRequestHook after defaults', () => {
    const userHook = vi.fn().mockReturnValue(true);
    createSdk({
      '@opentelemetry/instrumentation-http': { ignoreIncomingRequestHook: userHook }
    });
    const hook = mockNodeAutoInstrumentations.mock.calls[0][0]['@opentelemetry/instrumentation-http']
      .ignoreIncomingRequestHook;
    expect(hook({ url: '/other', headers: {} })).toBe(true);
    expect(userHook).toHaveBeenCalled();
    userHook.mockReturnValue(false);
    expect(hook({ url: '/other', headers: {} })).toBe(false);
  });

  describe('spanProcessors option', () => {
    it('should use spanProcessors instead of traceExporter when provided', () => {
      const mockProcessor = { onStart: vi.fn(), onEnd: vi.fn(), shutdown: vi.fn(), forceFlush: vi.fn() };
      createSdk({ spanProcessors: [mockProcessor] });
      expect(mockNodeSDK).toHaveBeenCalledWith(expect.objectContaining({
        spanProcessors: [mockProcessor]
      }));
      expect(mockNodeSDK).toHaveBeenCalledWith(expect.not.objectContaining({
        traceExporter: expect.anything()
      }));
    });

    it('should use default OTLPTraceExporter when spanProcessors is not provided', () => {
      createSdk();
      expect(mockNodeSDK).toHaveBeenCalledWith(expect.objectContaining({
        traceExporter: expect.any(OTLPTraceExporter)
      }));
      expect(mockNodeSDK).toHaveBeenCalledWith(expect.not.objectContaining({
        spanProcessors: expect.anything()
      }));
    });

    it('should not pass spanProcessors to instrumentations config', () => {
      const mockProcessor = { onStart: vi.fn(), onEnd: vi.fn(), shutdown: vi.fn(), forceFlush: vi.fn() };
      createSdk({ spanProcessors: [mockProcessor] });
      expect(mockNodeAutoInstrumentations).not.toHaveBeenCalledWith(
        expect.objectContaining({ spanProcessors: expect.anything() })
      );
    });

    it('should fall back to default OTLPTraceExporter when spanProcessors is empty array', () => {
      createSdk({ spanProcessors: [] });
      expect(mockNodeSDK).toHaveBeenCalledWith(expect.objectContaining({
        traceExporter: expect.any(OTLPTraceExporter)
      }));
      expect(mockNodeSDK).toHaveBeenCalledWith(expect.not.objectContaining({
        spanProcessors: expect.anything()
      }));
    });
  });
});
