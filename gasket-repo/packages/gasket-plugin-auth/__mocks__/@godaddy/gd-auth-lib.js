// Mock for the FFI library to avoid Jest globals issues during tests

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

  verifyTokenAuth() {
    return true;
  }

  getPayload() {
    return { sub: 'test' };
  }

  isShopper() {
    return true;
  }

  getShopperId() {
    return 'shopper-123';
  }

  getCustomerId() {
    return 'customer-123';
  }

  getAccountName() {
    return 'test-account';
  }

  getPassId() {
    return 'pass-123';
  }

  getCommonName() {
    return 'test-cn';
  }

  getAwsIamArn() {
    return 'arn:aws:iam::123456789012:role/test';
  }

  getUsername() {
    return 'test-user';
  }

  isJomax() {
    return false;
  }

  getEmployeeGroups() {
    return ['test-group'];
  }
}

export const GdAuth = MockFFIGdAuth;
export const SecurityLevel = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };
export const AuthType = { IDP: 'idp', JOMAX: 'jomax' };
export const Auths = { BASIC: 'basic', S2S: 's2s' };
