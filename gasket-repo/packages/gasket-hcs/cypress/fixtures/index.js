const React = require('react');
const DummyComponent = () => React.createElement('h1', null, 'hello world');

const defaultProps = {
  messages: {},
  market: 'en-US',
  urls: {
    gui: {
      href: ''
    },
    sso: {
      exitDelegation: { href: 'www.test.com' },
      restoreCookie: { href: 'www.cookietest.com' }
    }
  },
  supportMatrix: {},
  features: {
    accountDelegationBanner: true
  },
  skipToMainContentLink: { caption: 'here is a caption' }
};

module.exports = { DummyComponent, defaultProps };
