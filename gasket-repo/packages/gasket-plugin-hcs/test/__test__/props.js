const url = 'http://example.com';

module.exports = {
  market: 'en-US',
  messages: {},
  supportMatrix: {
    Chrome: ['79.0'],
    Firefox: ['67.0'],
    Safari: ['11.0'],
    Edge: ['79.0', '78.0']
  },
  urls: {
    sso: {
      exitDelegation: url,
      restoreCookie: url
    },
    gui: url
  },
  enableHivemindProvider: true,
  skipToMainContentLink: { caption: 'here is a caption' }
};
