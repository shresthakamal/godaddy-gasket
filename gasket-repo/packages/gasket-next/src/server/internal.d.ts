import type { ReactNode } from 'react';
import type { Html, Main } from 'next/document';
import type { NextScript } from 'next/script';
import type { Head } from 'next/head';
import type { Gasket } from '@gasket/core';
import type * as https from 'http';
import type { PCData } from '@gasket/plugin-uxp';
import type { PresentationProps, PcContentData } from './index.d.ts';

/**
 * Convert HTML string to React nodes
 */
export type htmlToReact = (
  html: string | null,
  options?: {
    /** Enable trimming when parsing */
    trim?: boolean;
  }
) => ReactNode | ReactNode[] | null;

/**
 * Render the PC page content as a script tag
 */
export type renderPcPageContent = () => ReactNode;

/**
 * Render a meta tag for the trace ID
 */
export type renderMetaTraceId = () => ReactNode | null;

/**
 * Render the document with Html, Head, Main, and NextScript components
 */
export type renderDocument = (
  Html: Html,
  Head: Head,
  Main: Main,
  NextScript: NextScript
) => ReactNode;

/**
 * Render the layout with children
 */
export type renderLayout = (props: { children: ReactNode }) => ReactNode;

/**
 * Normalize manifest data from PCS
 */
export type normalizeManifest = (data: PCData) => PcContentData;

/**
 * RTL market codes
 */
export type RTLMarkets = string[];

/**
 * Return single item if array has one element, otherwise return array
 */
export type arrayOrSingle = <T>(arr: T[]) => T | T[];

/**
 * Ensure the argument is an array
 */
export type ensureArray = (maybeArray: any[] | any) => any[];

/**
 * Safely stringify an object, escaping script tags and HTML comments
 */
export type safeStringify = (obj: unknown) => string;

/**
 * Get presentation props from gasket and request
 */
export type getProps = (
  gasket: Gasket,
  req: any
) => Promise<PresentationProps>;

/**
 * Setup defer manifest for PC data
 */
export type setupDeferManifest = (pcData: PCData) => PCData;

/**
 * Receives raw hydra properties and converts them into HTML elements
 */
export type elemBuilder = (
  /** Hydra objects describing HTML elements */
  elems: string | string[] | Record<string, any>,
  /** Desired type of element to create */
  elemType?: string
) => string;

/**
 * Constructs individual HTML elements from single hydra properties
 */
export type buildElem = (
  /** Properties of individual hydra element */
  elemProps: Record<string, any> | string,
  /** Type of HTML element to create */
  elemType: string
) => string;

/**
 * Derive the language code from response
 */
export type getLangFromReq = (res: https.ServerResponse<https.IncomingMessage>) => string;

/**
 * Derive the traceId from response
 */
export type getTraceIdFromResponse = (
  res: https.ServerResponse<https.IncomingMessage>
) => string;

/**
 * Encode unsafe HTML characters found in a string
 */
export type encodeHtmlEntities = (str: string) => string;

/**
 * Ensure all values are strings (or objects with string values)
 */
export type ensureStringValues = (
  /** Object to fixup */
  obj: Record<string, any>
) => Record<string, any>;

/**
 * Simple function to remove new lines and leading whitespace
 */
export type trimInline = (code: string) => string;
