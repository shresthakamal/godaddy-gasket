import {
  OtelRegisterOptions,
  register
} from '@godaddy/gasket-otel';

describe('@godaddy/gasket-otel', function () {

  it('register - has expected API', function () {
    const registerOptions: OtelRegisterOptions = {
      serviceName: 'my-service',
      exporterOtlpEndpoint: 'http://localhost:4317',
      exporterOtlpHeaders: {
        'x-custom': 'value'
      }
    };

    register(registerOptions);
  });

  it('OtelRegisterOptions - has expected API', function () {
    const registerOptions : OtelRegisterOptions = {
      serviceName: 'my-service',
      exporterOtlpEndpoint: 'http://localhost:4317',
      exporterOtlpHeaders: {
        'x-custom': 'value'
      },
      serviceVersion: '1.0.0',
      nodeEnabledInstrumentations: ['http'],
      nodeResourceDetectors: ['env'],
      debug: 'trace'
    };
  });
});
