import { makeDocument } from '@godaddy/gasket-next/document';
import { withGasketData } from '@gasket/nextjs/document';
import * as NextDocument from 'next/document';
{{#if (eq nextServerType 'customServer')}}
import gasket from '@/gasket'; // tsconfig path alias
{{else}}
import gasket from '@/gasket';
{{/if}}

export default withGasketData(gasket)(makeDocument(gasket, NextDocument));
