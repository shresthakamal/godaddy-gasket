const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v7/update-nextjs-app-file');
const patch = wrapper.wrapped;

const internal = `
import '../styles/global.scss';

import { App, reportWebVitals } from '@godaddy/gasket-next';

export { reportWebVitals };
export default App;
`;

const snapshotInternal = `
import '../styles/global.scss';

import { createApp, reportWebVitals } from '@godaddy/gasket-next';
import { withAuthProvider } from '@godaddy/gasket-auth';

function Layout(props) {
  const { Component, pageProps } = props;

  return (
    <Component { ...pageProps } />
  );
}

const App = createApp({ Layout, initialProps: true });

export { reportWebVitals };
export default [
  withAuthProvider()
].reduce((cmp, hoc) => hoc(cmp), App);
`;

const filePath = 'pages/_app.js';

describe('v7 patch - update nextjs _app', function () {
  let mockContext;

  it('is decorated with spinner', async function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('updates internal', async function () {
    mockContext = makeContext();
    mockContext.files.set(filePath, internal);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toEqual(snapshotInternal);
  });
});
