# App Router Setup

This guide explains how to set up [@godaddy/intl] in Next.js App Router applications using Gasket. 

## Overview

First you need to make the market locale available to be consumed in the app. You can do this by
using the [getVisitor] action in Next.js middleware. The [Static App Routes Guide] will show you how 
to make the market locale available.

Once you have the market locale available in the app, you can pass it to the `intlManager` provided by the
[@godaddy/intl] package and load the messages you want to use.

### Example Component with Intl

```jsx
import intlManager from '../../../../../intl';

export default async function IntlPage({ params }: { params: { market: string } }) {
  const handler = intlManager.handleLocale(params.market);
  await handler.load();
  const messages = handler.getAllMessages();
  return <span>{messages.my_message_id}</span>
}
```
[static app routes guide]: https://github.com/gdcorp-uxp/gasket/blob/main/packages/gasket-next/docs/static-app-routes.md
[getVisitor]: /packages/gasket-plugin-visitor/README.md#getVisitor
[@godaddy/intl]: https://github.com/godaddy/gasket/tree/main/packages/gasket-intl