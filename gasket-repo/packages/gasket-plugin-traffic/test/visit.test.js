import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validate as validateUUID } from 'uuid';
import visitMiddleware from '../lib/visit.js';

describe('visit info middleware', () => {
  let req, res, cookiesSet;

  beforeEach(() => {
    cookiesSet = {};
    req = { headers: {}, cookies: {} };
    res = {
      cookie: (name, value, options) => {
        cookiesSet[name] = { value, options };
      }
    };
  });

  async function setVisitInfo(assertFn) {
    visitMiddleware(req, res, () => {});
    return assertFn();
  }

  it('sets visitor cookies if missing', async () => {
    Date.now = vi.fn(() => new Date(Date.UTC(2017, 1, 14)).valueOf());
    await setVisitInfo(() => {
      expect(Object.keys(cookiesSet)).toEqual(
        ['pathway', 'fb_sessiontraffic', 'visitor']);

      // Ensure pathway cookie has a value GUID
      const guid = cookiesSet.pathway.value;
      expect(validateUUID(guid)).toEqual(true);

      // Check visitor/fb_session cookie value
      expect(cookiesSet.visitor.value).toEqual(`vid=${guid}`);
      expect(cookiesSet.fb_sessiontraffic.value).toEqual(
        `S_TOUCH=&pathway=${guid}&V_DATE=&pc=0`);

      // Check cookie expiration
      expect(cookiesSet.visitor.options.expires).toEqual(
        new Date('2018-02-14T00:00:00.000Z'));
      expect(cookiesSet.pathway.options.expires).toEqual(
        new Date('2017-02-14T00:20:00.000Z'));
      expect(cookiesSet.fb_sessiontraffic.options.expires).toEqual(
        new Date('2017-02-14T00:20:00.000Z'));

      // Check cookies are in request object
      expect(validateUUID(req.cookies.pathway)).toEqual(true);
      expect(req.cookies.visitor).toEqual(`vid=${guid}`);
      expect(req.cookies.fb_sessiontraffic).toEqual(`S_TOUCH=&pathway=${guid}&V_DATE=&pc=0`);

    });
  });

  it('does not overwrite existing traffic cookie values', async () => {
    req.cookies = {
      visitor: 'vid=fake-visitor',
      fb_sessiontraffic: 'pc=0&pathway=fake-visit' };
    await setVisitInfo(() => {
      expect(Object.keys(cookiesSet).length).toEqual(0);
    });
  });

  it('does not overwrite existing traffic cookie values if it is url encoded', async () => {
    req.cookies = {
      visitor: 'vid%3Dfake-visitor',
      fb_sessiontraffic: 'pc%3D0%26pathway%3Dfake-visit' };
    await setVisitInfo(() => {
      expect(Object.keys(cookiesSet).length).toEqual(0);
    });
  });

  it('sets visit if missing', async () => {
    req.cookies = {
      visitor: 'vid=fake-visitor' };
    await setVisitInfo(() => {
      expect(Object.keys(cookiesSet)).toEqual(
        ['pathway', 'fb_sessiontraffic']);
      expect(Object.keys(req.cookies)).toEqual(
        ['visitor', 'pathway', 'fb_sessiontraffic']);

      const guid = cookiesSet.pathway.value;
      expect(validateUUID(guid)).toEqual(true);
      expect(validateUUID(req.cookies.pathway)).toEqual(true);
    });
  });

  it('sets cookies on base domain', async () => {
    req.headers = {
      host: 'sso.dev-godaddy.com' };
    await setVisitInfo(() => {
      const baseHost = 'dev-godaddy.com';
      expect(cookiesSet.pathway.options.domain).toEqual(baseHost);
      expect(cookiesSet.pathway.options.domain).toEqual(baseHost);
      expect(cookiesSet.fb_sessiontraffic.options.domain).toEqual(baseHost);
    });
  });
});
