import configure from '../lib/configure.js';

const SELF_CERTS = 'selfCerts';
const EXAMPLE_COM = 'example.com';

describe('configure', function () {
  let mockGasket;

  beforeEach(function () {
    mockGasket = {
      config: {
        env: 'test'
      }
    };
  });

  it('adds default selfCerts.https if not set', function () {
    const newConfig = configure(mockGasket, mockGasket.config);

    expect(newConfig).toHaveProperty(SELF_CERTS);
    expect(newConfig.selfCerts).toHaveProperty('https', 'localhost');
  });

  it('adds false selfCerts.https if not set for local env', function () {
    mockGasket.config.env = 'local';
    const newConfig = configure(mockGasket, mockGasket.config);

    expect(newConfig).toHaveProperty(SELF_CERTS);
    expect(newConfig.selfCerts).toHaveProperty('https', false);
  });

  it('handles localdev env same as local', function () {
    mockGasket.config.env = 'localdev';
    const newConfig = configure(mockGasket, mockGasket.config);

    expect(newConfig).toHaveProperty(SELF_CERTS);
    expect(newConfig.selfCerts).toHaveProperty('https', false);
  });

  it('retains custom selfCerts.https', function () {
    mockGasket.config.selfCerts = { https: EXAMPLE_COM };
    const newConfig = configure(mockGasket, mockGasket.config);

    expect(newConfig).toHaveProperty(SELF_CERTS);
    expect(newConfig.selfCerts).toHaveProperty('https', EXAMPLE_COM);
  });

  it('can be disable in config', function () {
    mockGasket.config.selfCerts = { https: false };
    const newConfig = configure(mockGasket, mockGasket.config);

    expect(newConfig).toHaveProperty(SELF_CERTS);
    expect(newConfig.selfCerts).toHaveProperty('https', false);
  });

  it('preserves other selfCerts properties', function () {
    mockGasket.config.selfCerts = { https: EXAMPLE_COM, other: 'value' };
    const newConfig = configure(mockGasket, mockGasket.config);

    expect(newConfig.selfCerts).toHaveProperty('other', 'value');
  });

  it('applies default when selfCerts exists but https is undefined', function () {
    mockGasket.config.selfCerts = { other: 'value' };
    const newConfig = configure(mockGasket, mockGasket.config);

    expect(newConfig.selfCerts).toHaveProperty('https', 'localhost');
    expect(newConfig.selfCerts).toHaveProperty('other', 'value');
  });

  it('applies false default for local env when https is undefined', function () {
    mockGasket.config.env = 'local';
    mockGasket.config.selfCerts = { other: 'value' };
    const newConfig = configure(mockGasket, mockGasket.config);

    expect(newConfig.selfCerts).toHaveProperty('https', false);
  });

  it('handles null selfCerts', function () {
    mockGasket.config.selfCerts = null;
    const newConfig = configure(mockGasket, mockGasket.config);

    expect(newConfig.selfCerts).toHaveProperty('https', 'localhost');
  });
});
