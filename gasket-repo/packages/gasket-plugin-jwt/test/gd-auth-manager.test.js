import { describe, it, expect, beforeEach, vi } from 'vitest';
import GdAuthManager from '../lib/gd-auth-manager.js';

// Mock the FFI library to avoid Jest globals conflict
vi.mock('@godaddy/gd-auth-lib');

describe('GdAuthManager', () => {
  let gasket, gdAuthManager;
  beforeEach(() => {
    gasket = {
      config: {
        auth: {
          appName: 'my-app'
        }
      }
    };
    gdAuthManager = new GdAuthManager();
  });

  it('should return the correct type', () => {
    expect(gdAuthManager.getType({ cert: 'cert' })).toEqual('cert');
    expect(gdAuthManager.getType({ certFile: 'certFile' })).toEqual('cert');
    expect(gdAuthManager.getType({ devCert: 'devCert' })).toEqual('cert');
    expect(gdAuthManager.getType({ options: { realm: 'realm' } })).toEqual('realm');
    expect(gdAuthManager.getType({})).toEqual('awsiam');
  });

  it('should get the app name', () => {
    expect(gdAuthManager.getAppName(gasket)).toEqual('my-app');
  });

  it('should set and get gd auth instance', () => {
    const key = 'key';
    const jwtConfig = { cert: 'cert' };
    gdAuthManager.setGdAuthInstance(gasket, key, jwtConfig);
    expect(gdAuthManager.getGdAuthInstance(key)).toBeDefined();
  });

  it('should throw error if app name is not configured', () => {
    gasket.config.auth.appName = null;
    expect(() => gdAuthManager.getAppName(gasket)).toThrow('auth.appName is not configured in gasket.config');
  });
});
