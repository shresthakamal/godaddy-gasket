import { ComponentType } from 'react';
import { ContentData, ContentParams } from '@godaddy/gasket-plugin-content';

export {
  withContentParamsProvider,
  ContentParamsProvider,
  useContentParams
} from './components/content-params-provider.js';

export interface ComponentMap {
  [name: string]: ComponentMap | ComponentType<any>;
}

export interface AppContext {
  pageProps?: {
    params: ContentParams;
    contentData?: Partial<ContentData>;
  };
  router?: {
    query: Record<string, any>;
    locale: string;
  };
}
