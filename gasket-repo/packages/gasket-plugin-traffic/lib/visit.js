import { v4 as uuidv4 } from 'uuid';
import { parseString, getBaseDomain, setCookie, stringify } from './utils.js';

const ONE_YEAR = 525600;

/**
 * Set the visitor info in response cookies if missing from request cookies
 * @param {import('express').Request} req - request object
 * @param {import('express').Response} res - response object
 * @returns {undefined}
 */
function _setVisitInfo(req, res) {
  const baseDomain = getBaseDomain(req);

  const cookies = req.cookies || {};

  let visitorGuid = parseString(decodeURIComponent(cookies.visitor), '&', '=').vid;
  let visitGuid = parseString(decodeURIComponent(cookies.fb_sessiontraffic), '&', '=').pathway;

  if (!visitGuid) {
    visitGuid = uuidv4();

    const fbSessionCookieVal = stringify({
      S_TOUCH: '',
      pathway: visitGuid,
      V_DATE: '',
      pc: '0'
    }, '&', '=');

    setCookie(req, res, 'pathway', visitGuid, { minutes: 20, baseDomain });
    setCookie(req, res, 'fb_sessiontraffic', fbSessionCookieVal, { minutes: 20, baseDomain });
  }
  if (!visitorGuid) {
    visitorGuid = visitGuid;

    setCookie(req, res, 'visitor', `vid=${visitorGuid}`, { minutes: ONE_YEAR, baseDomain });
  }
}

export default function setVisitInfoMiddleware(req, res, next) {
  try {
    _setVisitInfo(req, res);
    return void next();
  } catch (err) {
    return void next(err);
  }
}
