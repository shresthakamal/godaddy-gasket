import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
vi.mock('@ux/apps');
import Apps from '@ux/apps';
import { getAppsClient, resetAppsClient } from '../lib/actions.js';

describe('getAppsClient', () => {
  let gasketConfig;

  beforeEach(() => {
    gasketConfig = {
      switchboard: {
        auth: {
          primaryRegion: 'us-west-2',
          secondaryRegion: 'us-west-2'
        }
      }
    };
  });

  afterEach(() => {
    resetAppsClient();
  });

  it('initializes an apps client with IAM', async () => {
    getAppsClient({ config: gasketConfig });
    expect(Apps).toHaveBeenLastCalledWith({
      env: 'dev',
      switchboardAuth: {
        primaryRegion: 'us-west-2',
        secondaryRegion: 'us-west-2'
      },
      useFallbackProvider: true
    });
  });

  it('initializes an apps client with certPath', async () => {
    gasketConfig.switchboard.auth = {
      certPath: 'cert path',
      keyPath: 'key path'
    };
    gasketConfig.env = 'local';

    getAppsClient({ config: gasketConfig });
    expect(Apps).toHaveBeenLastCalledWith({
      env: 'dev',
      switchboardAuth: {
        certPath: 'cert path',
        keyPath: 'key path'
      },
      useFallbackProvider: true
    });
  });

  it('initializes an apps client with cert', async () => {
    gasketConfig.switchboard.auth = {
      cert: 'cert string',
      key: 'key string'
    };
    getAppsClient({ config: gasketConfig });
    expect(Apps).toHaveBeenLastCalledWith({
      env: 'dev',
      switchboardAuth: {
        cert: 'cert string',
        key: 'key string'
      },
      useFallbackProvider: true
    });
  });
});
