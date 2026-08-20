import '../styles/global.scss';

import { createApp, reportWebVitals } from '@godaddy/gasket-next';
import { withAuthProvider } from '@godaddy/gasket-auth';
{{#if hasGasketIntl}}
import { IntlProvider } from '{{reactIntlPkg}}';
import { withMessagesProvider } from '@gasket/react-intl';
import { withLocaleInitialProps } from '@gasket/nextjs';
import intlManager from '../intl.js';
{{/if}}
{{#if hasGasketIntl}}
import gasket from '../gasket.js';
{{/if}}

{{#if hasGasketIntl}}
const IntlMessagesProvider = withMessagesProvider(intlManager)(IntlProvider);
{{/if}}

function Layout(props) {
  const { Component, pageProps } = props;
  {{#if hasGasketIntl}}
  const locale = props.locale ?? 'en-US';
  {{/if}}

  return (
    {{#if hasGasketIntl}}
    <IntlMessagesProvider locale={ locale }>
    {{/if}}
      <Component { ...pageProps } />
    {{#if hasGasketIntl}}
    </IntlMessagesProvider>
    {{/if}}
  );
}

const App = createApp({ Layout, initialProps: true });

// Wrap the app with higher-order components
export default [
  withAuthProvider(),
  {{#if hasGasketIntl}}
  withLocaleInitialProps(gasket)
  {{/if}}
].reduce((cmp, hoc) => hoc(cmp), App);

export { reportWebVitals };
