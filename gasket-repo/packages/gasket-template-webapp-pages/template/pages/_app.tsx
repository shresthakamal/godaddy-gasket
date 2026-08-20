import '../styles/global.css';
import React from 'react';
import { createApp, reportWebVitals } from '@godaddy/gasket-next';
import { withAuthProvider } from '@godaddy/gasket-auth';
import { IntlProvider } from '@godaddy/react-mintl';
import { withMessagesProvider } from '@gasket/react-intl';
import { withLocaleInitialProps } from '@gasket/nextjs';
import intlManager from '../intl';
import gasket from '@/gasket';

const IntlMessagesProvider = withMessagesProvider(intlManager)(IntlProvider);

function Layout(props) {
  const { Component, pageProps } = props;
  const locale = props.locale ?? 'en-US';

  return (
    <IntlMessagesProvider locale={ locale }>
      <Component { ...pageProps } />
    </IntlMessagesProvider>
  );
}

const App = createApp({ Layout, initialProps: true });

// Wrap the app with higher-order components
export default [
  withAuthProvider(),
  withLocaleInitialProps(gasket)
].reduce((cmp, hoc) => hoc(cmp), App);

export { reportWebVitals };
