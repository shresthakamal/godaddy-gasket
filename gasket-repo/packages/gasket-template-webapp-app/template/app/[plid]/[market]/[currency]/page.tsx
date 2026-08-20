import React from 'react';

import Box from '@ux/box';
import Button from '@ux/button';
import Text from '@ux/text';

import '@ux/box/dist/styles.css';
import '@ux/button/dist/styles.css';
import '@ux/text/dist/styles.css';

const textAlignStyle = { textAlign: 'center' as const };

const WelcomeMessage = () => (
  <Box inlineAlignChildren='center' orientation='vertical' gap='sm'>
    <Box inlinePadding='xl'>
      <Box inlineAlignChildren='center'>
        <h1>Welcome to Gasket!</h1>
        <p><Button design='inline' href='http://gdl.ink/gasket' text='Learn Gasket' /></p>
        <p>To get started, edit a page and save to reload.</p>
      </Box>
      <Box inlineAlignChildren='center' style={ textAlignStyle }>
        <Text.p as='paragraph'>Looking for more info about a Gasket package, plugin, or preset?<br />
          You can run <code className='sample-inline-code'>gasket docs</code> in your app to learn more.</Text.p>
      </Box>
    </Box>
  </Box>
);

export default function IndexPage() {
  return (
    <Box inlinePadding='xl'>
      <WelcomeMessage />
    </Box>
  );
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
