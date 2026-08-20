import PropTypes from 'prop-types';
import { createElement } from 'react';
import Link from 'next/link.js';
import { isSecureServer } from './utils.js';

import { gasketData } from '@gasket/data';

/** @type {import('@godaddy/gasket-next').VisitorLink}  */
export default function VisitorLink(props) {
  const { href, children, visitorKeys = [], ...rest } = props;
  const nextHref = typeof href === 'string' ? { pathname: href } : href;

  if (typeof href !== 'string') {
    nextHref.query = href.query ?? {};
  } else {
    nextHref.query = {};
  }

  if (typeof window !== 'undefined' && isSecureServer.test(window.location.hostname)) {
    // @ts-ignore -- TODO: complete these types
    const data = gasketData();
    if ('visitor' in data) {
      [...visitorKeys, 'plid'].forEach(key => {
        // @ts-ignore -- TODO: complete these types
        if (key in data.visitor) {
          // @ts-ignore -- TODO: complete these types
          nextHref.query[key] = data.visitor[key];
        }
      });
    }
  }

  return createElement(Link, { ...rest, href: nextHref }, children);
}

VisitorLink.propTypes = {
  visitorKeys: PropTypes.arrayOf(PropTypes.string),
  href: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      query: PropTypes.object
    })
  ]).isRequired,
  // -- pass-through from next/link
  as: PropTypes.string,
  replace: PropTypes.bool,
  scroll: PropTypes.bool,
  shallow: PropTypes.bool,
  passHref: PropTypes.bool,
  prefetch: PropTypes.bool,
  children: PropTypes.node
};
