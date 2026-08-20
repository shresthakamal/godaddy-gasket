/* eslint-disable react/jsx-pascal-case */
import React from 'react';
import { AuthRealm, withAuthRequired } from '@godaddy/gasket-auth';

import Box from '@ux/box';
import Text from '@ux/text';

import '@ux/box/dist/styles.css';
import '@ux/text/dist/styles.css';

function WelcomeMessage() {
  return <Box inlineAlignChildren='center' inlinePadding='xl' className='responsive-container'>
    <Text.h1 as='title'>Welcome, this is a protected page!</Text.h1>
    <Text.p as='paragraph'>You are authorized to access this page.</Text.p>
  </Box>;
}

const options = { realm: AuthRealm.jomax };

export default withAuthRequired(options)(WelcomeMessage);
