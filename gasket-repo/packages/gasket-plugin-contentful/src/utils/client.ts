import { createClient, CreateClientParams, ContentfulClientApi } from 'contentful';
import { Gasket } from '@gasket/core';
import { CustomClientParams, Query } from '../types.js';
import { parseContentfulError } from './parse-contentful-error.js';

function logRequest(gasket: Gasket, clientParams: CreateClientParams, query: Query) {
  const { space, environment, host, headers } = clientParams;
  const includesCrossSpaceCredentials = headers && 'X-Contentful-Resource-Resolution' in headers;
  const info = { space, environment, host, includesCrossSpaceCredentials, query };
  const infoStr = gasket.config.env.startsWith('local') ? JSON.stringify(info, null, 2) : JSON.stringify(info);
  gasket.logger.info('contentful: request ' + infoStr);
}

type Client = ContentfulClientApi<undefined> | ContentfulClientApi<'WITH_ALL_LOCALES'>;

export async function getEntries(
  gasket: Gasket,
  clientParams: CreateClientParams,
  customClientParams: CustomClientParams,
  query: Query
) {
  const { withAllLocales, enablePagination } = customClientParams;
  try {
    let client: Client = createClient(clientParams);

    if (withAllLocales) {
      client = client.withAllLocales;
      // @ts-expect-error - deleting because it's not a valid query param
      delete query.locale;
    }

    logRequest(gasket, clientParams, query);
    const response = await client.getEntries(query);

    const debug = {
      client: {
        space: clientParams.space,
        environment: clientParams.environment,
        host: clientParams.host
      },
      errors: response.errors || [],
      queries: [query]
    };

    const { total, limit, items: entries } = response;

    const remaining = total - limit;
    const isPaginated = remaining > 0;

    if (enablePagination && isPaginated) {
      const count = Math.ceil(remaining / limit);
      const skips = Array.from({ length: count }, (v, k) => (k + 1) * limit);
      const chunks = await Promise.all(skips.map(skip => {
        debug.queries.push({ ...query, skip });
        return client.getEntries({ ...query, skip });
      }));

      for (const chunk of chunks) {
        // @ts-expect-error - type mismatch between single and multi-locale entries
        entries.push(...chunk.items);
        if (chunk.errors) debug.errors.push(chunk.errors);
      }
    }

    return { entries, debug };
  } catch (error) {
    if (error instanceof Error) {
      const parsedError = parseContentfulError(error, query, clientParams);
      gasket.logger.error('contentful: request failed', parsedError);
      throw new Error(JSON.stringify(parsedError));
    } else {
      throw new Error('contentful: uknown error occurred when fetching entries');
    }
  }
}
