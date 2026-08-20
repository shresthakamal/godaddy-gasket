type EnvName =
  | 'prod'
  | 'production'
  | 'dev'
  | 'development'
  | 'test'
  | 'stg'
  | 'stage'
  | 'ote';

type BrandKey = string;
type BaseDomain = string;
type OptionalNumber = number | null | undefined;

// Define the PlidRow tuple type
type PlidRow = [
  BrandKey,
  BaseDomain,
  number?,
  OptionalNumber?,
  OptionalNumber?,
  OptionalNumber
];

/**
 * Private label id lookup with brand keys as getter properties to assist static
 * analysis
 */
export interface PlidPicker {
  'godaddy': number;
  'gdcorp': number;
  'wildwestdomains': number;
  'maddogdomains': number;
  'domainspricedright': number;
  'starfieldtech': number;
  'afternic': number;
  'mediatemple': number;
  /** @deprecated */
  'bluerazor': number;
  'domainsbyproxy': number;
  'meshmedia': number;
  'sucuri': number;
  'uniregistry': number;
  'reamaze': number;
  'oneTwoThreeReg': number;
  '123reg': number;
  'domainfactory': number;
  'heartinternet': number;
  'hosteurope': number;
  'hosteuropees': number;
  'domainbox': number;
  'donhost': number;
  'webfusion': number;
  'webhuset': number;
  'velia': number;
  'mrsite': number;
  'server4you': number;
}

/**
 * Get the correct plid lookup object for the provided environment
 * @param {string} env - Deployment environment
 * @returns {PlidPicker} plids
 */
export function getEnvPlids(env: string): PlidPicker;

/**
 * Determines the correct plid based off the hostname
 * @param {string} host - Hostname to check
 * @returns {string} plid
 */
export function getPlidFromHost(host: string): number;

/**
 * Determines the correct plid based off the base domain and environment
 * @param {string} baseDomain - Hostname to check
 * @param {string} env - Deployment environment
 * @returns {number} plid
 */
export function getPlidFromDomain(baseDomain: string, env: string): number;

/**
 * Determines if the hostname is a private label
 * @param {string} host - Hostname to check
 * @returns {boolean} isPrivateLabel
 */
export function isPrivateLabelHost(host: string): boolean;

/**
 * Determines if the hostname is a secureserver.net host
 * @param {string} host - Hostname to check
 * @returns {boolean} isSecureServerHost
 */
export function isSecureServerHost(host: string): boolean;

/**
 * Looks up prod plid for OTE plid
 * @param {number} plid - OTE plid to look up
 * @returns {number} plid || prod plid
 */
export function getProdPlidFromOte(plid: number): number;
