import React from 'react';
import type { GetServerSideProps } from 'next';
import Box from '@ux/box';
import Button from '@ux/button';
import Card from '@ux/card';
import Text from '@ux/text';
import Head from '../components/head.tsx';
import { fetchFromApi } from '../lib/fetch-api.ts';

import '@ux/box/dist/styles.css';
import '@ux/button/dist/styles.css';
import '@ux/card/dist/styles.css';
import '@ux/text/dist/styles.css';

export interface UsageSummary {
  totalTokens: number;
  period: string;
}

interface UsagePageProps {
  usage: UsageSummary | null;
  error: string | null;
}

export function UsagePage({ usage, error }: UsagePageProps) {
  return (
    <Box inlinePadding='xl'>
      <Head title='AI Usage' description='AI usage summary from aiusage-api' />
      <Card id='usage-card'>
        <Box inlinePadding='xl' orientation='vertical' gap='md'>
          <h1>AI Usage</h1>
          {error && (
            <Text.p as='paragraph' className='description'>{error}</Text.p>
          )}
          {usage && (
            <>
              <Text.p as='paragraph'>Period: {usage.period}</Text.p>
              <Text.p as='paragraph'>Total tokens: {usage.totalTokens.toLocaleString('en-US')}</Text.p>
            </>
          )}
          <Button design='inline' href='/' text='Back to home' />
        </Box>
      </Card>
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps<UsagePageProps> = async () => {
  try {
    const usage = await fetchFromApi<UsageSummary>('/usage');

    return {
      props: {
        usage,
        error: null
      }
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isDev = process.env.NODE_ENV === 'development';

    return {
      props: {
        usage: null,
        error: isDev
          ? message
          : 'API service unavailable — is aiusage-api running on port 8444?'
      }
    };
  }
};

export default UsagePage;
