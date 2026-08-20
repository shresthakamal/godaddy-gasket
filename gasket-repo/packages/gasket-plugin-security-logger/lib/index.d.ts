import '@gasket/plugin-logger';
import type { Plugin } from '@gasket/core';
import type winston from 'winston';

export interface SecurityLoggerConfig {
  aws: {
    accountId: string;
    accountName: string;
  };
  serviceFullName: string;

  disabled?: boolean;
}

declare module '@gasket/core' {
  export interface GasketConfig {
    securityLogger?: SecurityLoggerConfig;
    winston?: winston.LoggerOptions & { prefix?: string };
  }
}

declare module '@gasket/plugin-logger' {
  export interface Logger {
    security: (event: string, details: object) => void
  }
}

const plugin: Plugin = {
  name: '@godaddy/gasket-plugin-security-logger',
  hooks: {}
};

export default plugin;
