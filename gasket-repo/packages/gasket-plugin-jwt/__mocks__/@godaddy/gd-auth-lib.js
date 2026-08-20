// Mock for the FFI library to avoid native binding issues during tests

class MockFFIGdAuth {
  constructor() {
    this.config = null;
  }

  setAppConfig(config) {
    this.config = config;
  }

  parseToken() {
    return { payload: { sub: 'test' } };
  }
}

export const GdAuth = MockFFIGdAuth;
export const SecurityLevel = { LOW: 1, MEDIUM: 2, HIGH: 3 };
export const AuthType = { IDP: 'idp' };
export const Auths = { BASIC: 'basic' };


