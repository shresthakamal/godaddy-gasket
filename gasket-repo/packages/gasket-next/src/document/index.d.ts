import type { Gasket } from '@gasket/core';
import { Presentation } from '../server';
import type { Html, Head, Main, NextScript } from 'next/document';
import type Document from 'next/document';
import type { DocumentContext, DocumentInitialProps } from 'next/document';
import { FunctionComponent, PropsWithChildren, ReactNode } from 'react';

export { Presentation };

export type GasketDocumentGetInitialProps = (
  ctx: DocumentContext
) => Promise<DocumentInitialProps>;

type DocumentClass = typeof Document & {
  getInitialProps: GasketDocumentGetInitialProps;
};

type DocumentFunction = typeof FunctionComponent & {
  getInitialProps: GasketDocumentGetInitialProps;
};

export function makeDocument(
  gasket: Gasket,
  nextDocument:
    | {
        Html: typeof Html;
        Head: typeof Head;
        Main: typeof Main;
        NextScript: typeof NextScript;
      }
    | typeof import('next/document'),
  CustomPresentation?: typeof Presentation
): DocumentClass | DocumentFunction;

export type WrapperCreator = (
  Document: Document | typeof FunctionComponent
) => DocumentClass | DocumentFunction;

export function withStaticReq(): WrapperCreator;

export type PresentationDocument = (props: Record<string, any>) => ReactNode;

export type WrappedDocument = (props: PropsWithChildren<any>) => ReactNode;

export type withStaticReqGetInitialProps = (
  ctx: DocumentContext
) => Promise<DocumentInitialProps>;

declare module 'http' {
  interface IncomingMessage {
    query?: Record<string, any>;
  }
}
