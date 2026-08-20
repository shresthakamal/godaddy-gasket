// @ts-nocheck -- ignore window.ux assignment
'use client';

//
// This is lifted from the react-bundle package:
// https://github.com/gdcorp-uxp/react-bundle/blob/main/src/react-dom.js
// It is necessary to expose React and ReactDOM to the window object
// to allow the HCS to mount, which currently expects React to be externalized.
// This will likely not be necessary with ESM adoption in future HCS iterations.
//

import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactDOM from 'react-dom';
import { jsx, jsxs } from 'react/jsx-runtime';

//
// Note that the order of exposing the libraries matter here. While the
// react-dom/client API's are also exposed by the react-dom export they
// come with a warning that tells you to use the react-dom/client export
// instead. So to prevent that warning we need to expose/override these
// API's in the correct order.
//

React.jsx = jsx;
React.jsxs = jsxs;

const ReactDOMBundle = {
  ...ReactDOM,
  ...ReactDOMClient
};

if (typeof window !== 'undefined') {
  if (!window.ux) window.ux = {};
  window.ux.React = window.React = React;
  window.ux.ReactDOM = window.ReactDOM = ReactDOMBundle;
}
