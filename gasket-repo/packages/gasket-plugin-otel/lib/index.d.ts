import type { GasketData } from '@gasket/data';
import type { Gasket } from '@gasket/core';
import type { RequestLike } from '@gasket/request';
import type { Meter, MeterOptions } from '@opentelemetry/api';
import type { IncomingMessage, OutgoingMessage } from 'http';

export type TraceId = string;

export interface Trace {
  traceId: TraceId;
}

export interface TraceIdResponse extends OutgoingMessage {
  locals: {
    trace?: Trace;
    gasketData?: GasketData & {
      trace?: {
        traceId: TraceId
      }
    };
  };
  setTraceIdCookie?: () => void;
  cookie?: (
    name: string,
    value: string,
    options: {
      maxAge: number;
      httpOnly: boolean;
      signed: boolean;
    }
  ) => void;
}

export function traceIdMiddleware(
  req: IncomingMessage,
  res: TraceIdResponse,
  next: (err?: Error) => void
): Promise<void>;

export function makeTracedIdMiddleware(gasket: Gasket): typeof traceIdMiddleware;

declare module '@gasket/core' {
  export interface GasketActions {
    getTraceId(req: RequestLike): Promise<TraceId | null>;
    setTraceIdCookie(req: RequestLike, res: OutgoingMessage): Promise<TraceId | null>;
    getOtelMeter(name: string, options?: { version?: string; options?: MeterOptions }): Meter;
  }
}

declare module '@gasket/data' {
  export interface GasketData {
    trace?: Trace;
  }
}

declare module 'create-gasket-app' {
  interface CreateContext {
    apiApp?: boolean;
    nextServerType?: boolean;
    typescript?: boolean;
  }
}

export function getTraceId(req: RequestLike): Promise<TraceId | null>;

export default {
  name: '@godaddy/gasket-plugin-otel',
  hooks: {}
};
