/* eslint-disable react/jsx-pascal-case */
import React from 'react';
import intlManager from '../../../../../intl';
import Box from '@ux/box';
import Text from '@ux/text';

export default async function IntlPage({ params }: { params: { market: string } }) {
  const handler = intlManager.handleLocale(params.market);
  await handler.load();
  const messages = handler.getAllMessages();
  return <Box inlineAlignChildren='center' inlinePadding='xl' className='responsive-container'>
    <Text.h1 as='title'>{messages.gasket_welcome}</Text.h1>
    <Text.p as='paragraph'>{messages.gasket_learn}</Text.p>
  </Box>;
}
