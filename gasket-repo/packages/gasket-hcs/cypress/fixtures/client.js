import React from 'react';
import ReactDOM from 'react-dom/client';
import { DummyComponent, defaultProps } from './index.js';
import withManifest from '../../src/with-manifest.js';

const target = document.getElementById('root');
const app = React.createElement(withManifest(DummyComponent), defaultProps);

ReactDOM.hydrateRoot(target, app);
