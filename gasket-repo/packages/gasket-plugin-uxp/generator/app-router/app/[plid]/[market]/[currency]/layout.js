// This nested layout is necessary to access the path params in the URL.
// The path params are used with PresentationCentral and work with static pages.

import { makeLayout } from '@godaddy/gasket-next/layout';
import gasket from '../../../../gasket.js';
import '../../../../styles/global.scss';

export default makeLayout(gasket);

// How often the static pages should be refreshed in seconds.
// Necessary to keep the static pages up to date with header changes.
// @see: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 600;
