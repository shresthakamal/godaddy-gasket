declare module '@gasket/core' {
  export interface GasketActions {
    getSelfCert(commonName: string): Promise<{ cert: string; key: string }>;
  }

  export interface GasketConfig {
    selfCerts?: {
      https?: string | false;
    };
  }
}

export default {
  name: '@godaddy/gasket-plugin-self-certs',
  hooks: {}
};
