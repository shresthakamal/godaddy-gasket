import type { Response } from 'node-fetch';

interface DevCertsOptions {
  dirPath: string;
  commonNames: string[];
}

interface CloudCert {
  id: string;
}

/** Fetch a URL with the JWT header */
export async function authorizedFetch(url: string): Promise<Response>;

export async function downloadCertFile(
  cloudCert: CloudCert,
  type: string
): { pem: string; filename: string };

/** Download the certificate files for the given commonName */
export async function downloadCert(
  directory: string,
  commonName: string
): Promise<string>;

/** Update the certificate file */
export async function updateCertFile(
  cloudCert: CloudCert,
  directory: string
): Promise<void>;

export async function updateCaChainFile(
  cloudCert: CloudCert,
  directory: string
): Promise<void>;

export async function updateKeyFile(
  cloudCert: CloudCert,
  directory: string
): Promise<void>;

/** Get a cloud cert for a common name */
export async function getCloudCertForCommonName(
  commonName: string
): Promise<CloudCert>;

export async function hasCurrentCert(
  certPath: string,
  commonName: string
): Promise<boolean>;

export function certFilePathFor(directory: string, commonName: string): string;

export function parseDisposition(str: string): { filename: string };

export function fetchDevCerts(param: DevCertsOptions): Promise<void>;

declare module '@gasket/core' {
  export interface GasketActions {
    getDevCert(commonName: string): Promise<{ cert: string, key: string }>
    installDevCerts(): Promise<void>
  }

  export interface GasketConfig {
    devCerts?: {
      /**
       * Path to the directory where the certs are stored.
       * Defaults to `./certs` in the app root.
       */
      path?: string;
      /**
       * List of common names to ensure certs for.
       */
      commonNames?: Array<string>;
      /**
       * List of common names to configure SNI for.
       * @example
       * ['*.gasket.dev-godaddy.com', '*.gasket.dev-afternic.com']
       */
      sniNames?: Array<string>;
    };
  }
}

export default {
  name: '@godaddy/gasket-plugin-dev-certs',
  hooks: {}
};
