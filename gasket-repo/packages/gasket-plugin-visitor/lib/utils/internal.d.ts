import { GasketRequest } from '@gasket/request';
import { Atlas } from '@godaddy/atlas';
import { Visitor, VisitorPriorityConfig } from '../index';
import { Gasket } from '@gasket/core';

/** Ensures that the id is a number, not a string, if set. */
export function toInt(value: string | number | null): number;

/** Find the plId from the request query params if set */
export function getPrivateLabelIdFromQuery(req: GasketRequest): number | undefined;

/** Find the plId from the request cookies if set */
export function getPrivateLabelIdFromCookies(req: GasketRequest): number | undefined;

/** Get the visitor guid from the cookie value */
export function getVisitorGUID(req: GasketRequest): string;

/** Assign plid from query parameters */
export function assignPlidFromQuery(visitor: Visitor, req: GasketRequest): void;

/** Assign plid from cookies */
export function assignPlidFromCookies(visitor: Visitor, req: GasketRequest): void;

/** Assign hostname from x-dsa-host header */
export function assignHostnameFromXDsaHost(visitor: Visitor, req: GasketRequest): void;

/** Assign hostname from x-forwarded-host header */
export function assignHostnameFromXForwarded(visitor: Visitor, req: GasketRequest): void;

/** Assign hostname from host header */
export function assignHostnameFromHost(visitor: Visitor, req: GasketRequest): void;

/** Assign plid from hostname's brand when no plid is set (pure resolver) */
export function assignPlidFromHostname(visitor: Visitor, req: GasketRequest, atlas: Atlas): void;

/** Cross-validate plid against hostname brand and fall back to NoBrand when needed */
export function assignPlidFromDefault(visitor: Visitor, atlas: Atlas): void;

/** Assign market from x-market-id header */
export function assignMarketFromHeaders(visitor: Visitor, req: GasketRequest, atlas: Atlas): void;

/** Assign market from market cookie */
export function assignMarketFromCookies(visitor: Visitor, req: GasketRequest, atlas: Atlas): void;

/** Assign market from query parameter */
export function assignMarketFromQuery(visitor: Visitor, req: GasketRequest, atlas: Atlas): void;

/** Assign market from Accept-Language header */
export function assignMarketFromAcceptLanguage(visitor: Visitor, req: GasketRequest, atlas: Atlas): void;

/** Assign market from brand default */
export function assignMarketFromDefault(visitor: Visitor, atlas: Atlas): void;

/** Assign locale from market translation locale */
export function assignTranslationLocale(visitor: Visitor, atlas: Atlas): void;

/** Assign currency from x-currency-id header */
export function assignCurrencyFromHeaders(visitor: Visitor, req: GasketRequest, atlas: Atlas): void;

/** Assign currency from currency cookie */
export function assignCurrencyFromCookies(visitor: Visitor, req: GasketRequest, atlas: Atlas): void;

/** Assign currency from query parameter */
export function assignCurrencyFromQuery(visitor: Visitor, req: GasketRequest, atlas: Atlas): void;

/** Assign currency from market default currency */
export function assignCurrencyFromDefault(visitor: Visitor, atlas: Atlas): void;

/** Assign visitor GUID from visitor cookie */
export function assignVisitorGuid(visitor: Visitor, req: GasketRequest): void;

/** Assign session ID from pathway cookie */
export function assignSessionId(visitor: Visitor, req: GasketRequest): void;

/** Get the visitor object from the request */
export function getVisitor(req: GasketRequest, atlas: Atlas, debug: boolean, priority?: VisitorPriorityConfig): Visitor;

/** Map of visitor field names to their resolver registry and default ordering */
export const FIELD_REGISTRIES: Record<string, { resolvers: Record<string, Function>; defaultOrder: string[] }>;

/** Get or create an Atlas instance for the gasket application */
export function getAtlas(gasket: Gasket): Promise<Atlas>;

/** Clear the cached Atlas instance (for testing) */
export function clearAtlas(): void;
