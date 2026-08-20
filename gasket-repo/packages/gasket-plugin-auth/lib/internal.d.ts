/* eslint-disable @typescript-eslint/no-explicit-any */
import { GasketRequest, withGasketRequestCache, RequestLike } from '@gasket/request';
import type { Gasket, GasketConfig } from '@gasket/core';
import type { Visitor } from '@godaddy/gasket-plugin-visitor';
import type { Jwt, GdAuth } from 'gd-auth';
import { AuthRealm } from './index';
import type { AuthResponse, AuthRealmType, authCheck, AuthOptions, AuthConfig, AuthParams } from './index';
import type { Request, Response, NextFunction } from 'express';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { match } from 'path-to-regexp';

const prepareForRequest = withGasketRequestCache<typeof authCheck>();

async function validateJomax(
  options: AuthOptions<AuthRealm.jomax>,
  req: GasketRequest, expectedGroups: string[] | undefined, gasket: Gasket
): AuthResponse<AuthRealm.jomax>

async function validatePass(
  options: AuthOptions<AuthRealm.pass>,
  req: GasketRequest, gasket: Gasket
): AuthResponse<AuthRealm.pass>

async function validateCert(
  options: AuthOptions<AuthRealm.cert>,
  req: GasketRequest, expectedCommonNames: string[] | undefined, gasket: Gasket
): AuthResponse<AuthRealm.cert>

async function validateAwsIam(
  options: AuthOptions<AuthRealm.awsiam>,
  req: GasketRequest, expectedRoles: string[] | undefined, gasket: Gasket
): AuthResponse<AuthRealm.awsiam>

async function validateIdp(
  options: AuthOptions<AuthRealm.idp>,
  req: GasketRequest, expectedGroups: string[] | undefined, gasket: Gasket
): AuthResponse<AuthRealm.idp>

async function validateOauth(
  options: AuthOptions<AuthRealm.oauth>,
  req: GasketRequest, expectedScopes: string[] | undefined, gasket: Gasket
): AuthResponse<AuthRealm.oauth>

async function fetchJomaxGroups(options: AuthOptions<AuthRealm.jomax>, req: GasketRequest): string[]
function validateGroups(expectedGroups: string[], groups: string[]): void
function getAuthInstance(options: AuthOptions, gasket: Gasket): GdAuth
async function performAuthenticate(options: AuthOptions, req: GasketRequest, gasket: Gasket): Jwt
function logAuthChecked(gasket: Gasket, req: GasketRequest, result: AuthResponse, authOptions: AuthOptions): Jwt

function getTokenFromHeader(realm: AuthRealmType, req: GasketRequest): string | undefined;
function getTokenFromCookies(realm: AuthRealmType, req: GasketRequest): string | undefined;
function getToken(realm: AuthRealmType, req: GasketRequest): string;

/** Get the app name from the config or hostname */
function getAppName(gasket: Gasket, hostname: string): string;

/** Accepts a query object from req or passed directly and returns options with defaults. */
function fixupAuthOptions(
  /** Original query object */
  options: AuthOptions,
  /** from gasket.config.auth */
  authConfig: AuthConfig
): AuthOptions;

function fixupValidateOptions(
  /** Clean query object */
  authOptions: AuthOptions,
  /** from gasket.config.auth */
  authConfig: AuthConfig,
  /** App name */
  app: string,
  /** Visitor object */
  visitor: Visitor
): Record<string, any>;

/** Get base domain from hostname */
function getBaseDomain(hostname: string): string;

/** Auth result for SSO URL building - accepts the AuthResponse union but with authReason optional for type compatibility */
type SsoAuthResult = {
  valid: boolean;
  realm?: string;
  reason?: string;
  authReason?: number;
  details?: any;
};

/** Handle route SSO authentication logic */
function buildSsoUrl(gasket: Gasket,
                            req: GasketRequest,
                            authParams: AuthOptions,
                            authResult: SsoAuthResult
): Promise<string>;

/** Express middleware type for route protection */
type ExpressRouteMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/** Fastify preHandler type for route protection */
type FastifyRoutePreHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

/** Setup route protection function type for Express */
type SetupRouteProtectionExpress = (gasket: Gasket) => ExpressRouteMiddleware | null;

/** Setup route protection function type for Fastify */
type SetupRouteProtectionFastify = (gasket: Gasket) => FastifyRoutePreHandler | null;

/** Setup route protection middleware for Express */
function setupRouteProtection(gasket: Gasket): ExpressRouteMiddleware | null;

/** Setup route protection preHandler for Fastify */
function setupRouteProtection(gasket: Gasket): FastifyRoutePreHandler | null;

/**
 * Check route authentication. Returns an SSO redirect URL (string) for browser
 * realms, `{ unauthorized: true }` for a failed oauth (machine) realm, or null
 * when authentication passes.
 */
function checkRouteAuth(
  gasket: Gasket,
  req: RequestLike
): Promise<string | { unauthorized: true } | null>;

class RouteMatcher {
  public match: match;
  public config: { params: AuthParams };
  constructor(route: string, config: { params: AuthParams });
}

function getRouteMatchers(gasket: Gasket): RouteMatcher[];

/** Convert an object to a string key */
type objToKey = (options: Record<string, any>) => string;

/** Ensures that the id is a number, not a string, if set */
type toInt = (value: string) => number;

/** Resolve a gasket env string to a canonical env key for per-env default lookups */
type resolveEnvKey = (env: string) => 'dev' | 'test' | 'stg' | 'ote' | 'prod';

/** Resolve the OAuth issuer URL from explicit config or the per-env enum default */
type resolveOauthIssuer = (
  options: { oauthIssuer?: string; env?: string },
  oauthIssuerEnum: Record<string, string> | undefined
) => string;

/** Make a checkAuth function bound to a request */
type makeCheckAuth = <T extends AuthRealmType>(
  gasket: Gasket,
  req: RequestLike
) => (authOptions?: AuthOptions<T>) => Promise<AuthResponse<T>>;

/** Build the auth config from base config */
type buildAuthConfig = (baseConfig: GasketConfig) => Partial<AuthConfig<AuthRealmType>>;

/** Get the Elastic APM config */
type getElasticConfig = (baseConfig: GasketConfig) => Record<string, any>;

/** Setup routes for the auth plugin */
type setupRoutes = (gasket: Gasket, app: any) => void;

/** Get fetch key function */
type getFetchKeyFunction = (context: {
  host: string;
  cert: string;
  key: string;
}) => typeof fetchKeyThroughProxy;

/** Fetch key through proxy */
type fetchKeyThroughProxy = (
  useragent: string,
  ignored: any,
  kid: string
) => Promise<any>;

/** Configure endpoint */
type configureEndpoint = (gasket: Gasket) => typeof endpoint;

/** Endpoint by which to check auth against criteria provided as query params */
type endpoint = (
  req: RequestLike,
  res: any
) => Promise<any>;
