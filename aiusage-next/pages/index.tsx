import React from 'react';
import Pivots from '@ux/pivot';
import { FormattedMessage } from '@godaddy/react-mintl';
import Head from '../components/head.tsx';

import Settings from '@ux/icon/settings';
import Wand from '@ux/icon/wand';
import Play from '@ux/icon/play';
import Help from '@ux/icon/help';
import Box from '@ux/box';
import Button from '@ux/button';
import Card from '@ux/card';
import Text from '@ux/text';

import '@ux/icon/settings/index.css';
import '@ux/icon/wand/index.css';
import '@ux/icon/play/index.css';
import '@ux/icon/help/index.css';
import '@ux/pivot/dist/styles.css';
import '@ux/box/dist/styles.css';
import '@ux/button/dist/styles.css';
import '@ux/card/dist/styles.css';
import '@ux/text/dist/styles.css';

const pivotList = [
  {
    graphic: (<Wand />),
    href: '/usage',
    subtitle: 'View AI usage data from the aiusage-api service',
    title: 'AI Usage'
  },
  {
    graphic: (<Settings />),
    href: 'http://gdl.ink/gasket',
    subtitle: 'Learn more about working with Gasket',
    title: 'Learn Gasket'
  },
  {
    graphic: (<Wand />),
    href: 'https://uxcore.uxp.gdcorp.tools/docs/getting-started/uxcore2/gasket',
    subtitle: 'Discover UX components and how to use them',
    title: 'Learn UXCore2'
  },
  {
    graphic: (<Play />),
    href: 'https://nextjs.org/learn',
    subtitle: 'Learn more about Next on Github and in their examples',
    title: 'Learn Next.js'
  },
  {
    graphic: (<Help />),
    href: 'https://godaddy.slack.com/messages/CABCTNQ5P/',
    subtitle: <>Reach out to the <code className='sample-inline-code'>@gasket</code> team in the <code className='sample-inline-code'>#gasket-support</code> Slack channel</>,
    title: 'Gasket Support'
  }
];

const textAlignStyle = { textAlign: 'center' as const };

const WelcomeMessage = () => (
  <Box inlineAlignChildren='center' orientation='vertical' gap='sm' className='responsive-container'>
    <Box inlinePadding='xl'>
      <Box inlineAlignChildren='center'>
        <h1><FormattedMessage id='gasket_welcome' /></h1>
        <p><Button design='inline' href='http://gdl.ink/gasket' text='Learn Gasket' /></p>
        <p><FormattedMessage id='gasket_edit_page' /></p>
      </Box>
      <Box inlineAlignChildren='center' style={ textAlignStyle }>
        <Text.p as='paragraph' className='description'>Looking for more info about a Gasket package, plugin, or preset?<br />
          You can run <code className='sample-inline-code'>gasket docs</code> in your app to learn more.</Text.p>
      </Box>
    </Box>
  </Box>
);

export function IndexPage() {
  return (
    <Box inlinePadding='xl'>
      <Head title='gasket-template-webapp-pages' description='Gasket App'/>
      <Card id='hero-card'>
        <Box inlinePadding='xl'>
          <WelcomeMessage />
          <Box inlineAlignChildren='center' blockPadding='lg' inlinePadding='lg'>
            <Pivots pivotList={ pivotList } />
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

export default IndexPage;
