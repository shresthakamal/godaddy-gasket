/// <reference types="@gasket/plugin-manifest" />
/// <reference types="@gasket/plugin-logger" />
/// <reference types="@godaddy/gasket-plugin-visitor" />

/* eslint-disable max-statements, complexity   */
import fetch from '@gasket/fetch';
import transformUrl from 'transform-url';
import { isSecureServer, hasPrivateLabelParam } from './utils.js';

/**
 * Add pwamanifest results from PC to the the manifest
 * @type {import('@gasket/core').HookHandler<'manifest'>}
 */
export default async function manifest(gasket, manifest, { req }) {

  if (req) {
    const pc = await gasket.actions.getPresentationCentral(req);
    const visitor = await gasket.actions.getVisitor(req);

    const { plid, hostname } = visitor;
    const { pwamanifest = {} } = pc.data || {};

    const name = gasket.config.presentationCentral.app || '';
    // @ts-ignore - Will need to update plugin-manifest types to include icons
    let icons = pwamanifest.icons || manifest.icons;

    // If icons are not provided by PC or already set in manifest,
    // get default icons if GoDaddy
    if (plid === 1 && (!icons || !icons.length)) {
      try {
        const baseUrl = 'https://img1.wsimg.com/ux/favicon';
        // @ts-ignore - node-fetch types are not loading correctly
        const response = await fetch(`${baseUrl}/manifest.json`);
        const json = await response.json();
        icons = json.icons.map(icon => {
          return {
            ...icon,
            src: `${baseUrl}${icon.src}`
          };
        });
      } catch {
        gasket.logger.debug('Default manifest.json is not available on the CDN');
      }
    }

    const data = {
      name,
      ...pwamanifest,
      ...manifest,
      icons
    };

    // For secureserver.net, make sure the plid is on the start_url if being set
    if (isSecureServer.test(hostname)) {
      const { start_url: startUrl } = data;
      if (startUrl && !hasPrivateLabelParam.test(startUrl)) {
        data.start_url = transformUrl(startUrl, { plid });
      }
    }

    return data;
  }
  return manifest;
}
