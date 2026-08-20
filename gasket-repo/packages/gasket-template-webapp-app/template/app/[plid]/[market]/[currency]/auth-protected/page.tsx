'use client';
import React from 'react';

import { withAuthProvider } from '@godaddy/gasket-auth';
import WelcomeMessage from '../../../../../components/protected-welcome';

function IndexPage() {
  return <WelcomeMessage />;
}

export default withAuthProvider()(IndexPage);
