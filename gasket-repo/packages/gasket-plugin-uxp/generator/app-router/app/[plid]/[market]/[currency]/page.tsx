/* eslint-disable react/jsx-pascal-case */
import React from 'react';

import Box from '@ux/box';
import Text from '@ux/text';

import '@ux/box/dist/styles.css';
import '@ux/text/dist/styles.css';

export default function IndexPage() {
  return <Box inlineAlignChildren='center' inlinePadding='xl' className='responsive-container'>
    <Text.h1 as='title'>Welcome to Gasket!</Text.h1>
    <Text.p as='paragraph'>To get started, edit a page and save to reload.</Text.p>
  </Box>;
}

// This is an example of the params that can be used to generate static pages.
// If you decide not to use this feature, pages will be generated on-demand.
// @see: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
export async function generateStaticParams() {
  return [
    { plid: '1', market: 'en-US', currency: 'USD' },
    { plid: '1', market: 'fr-FR', currency: 'EUR' }
  ];
}
