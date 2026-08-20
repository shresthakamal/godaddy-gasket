/* eslint-disable max-len */

export default {
  godaddy: {
    globals: `..."pro":{"href":"https://pro.godaddy.com"},"proHome":{"href":"https://www.godaddy.com/pro"},"notifications":{"api":{"href":"https://mya.godaddy.com/webapi/notifications"},"cache":{"href":"//img1.wsimg.com/mya/notifications/cache.html"}},"sso":{"exitDelegation":{"href":"https://sso.godaddy.com/cookie/switchback"},"restoreCookie":{"href":"https://sso.godaddy.com/cookie/restore"},"createAccount":{"href":"https://sso.godaddy.com/account/create?realm=idp&path=%2F&app=canary.gasket"},"o365Login":{"href":"https://sso.godaddy.com?app=o365&realm=pass","target":"_blank"},"login":{"href":"https://sso.godaddy.com?realm=idp&path=%2F&app=canary.gasket"},"logout":{"href":"https://sso.godaddy.com/logout?realm=idp"}},"markets":{"da-DK":{"href":"https://dk.godaddy.com"}...`
  },
  afternic: {
    globals: `..."sso":{"exitDelegation":{"href":"https://sso.secureserver.net/cookie/switchback"},"restoreCookie":{"href":"https://sso.secureserver.net/cookie/restore"},"createAccount":{"href":"https://sso.secureserver.net/account/create?plid=497036&prog_id=AfterNIC&realm=idp&path=%2F&app=www"},"o365Login":{"href":"https://sso.secureserver.net?app=o365&realm=pass","target":"_blank"},"login":{"href":"https://sso.secureserver.net?plid=497036&prog_id=AfterNIC&realm=idp&path=%2F&app=www"},"logout":{"href":"https://sso.secureserver.net/logout?plid=497036&prog_id=AfterNIC&realm=idp&app=account"}}...`
  },
  v3: {
    config: {
      props: {
        shared: {
          urls: {
            sso: {
              login: {
                href: 'https://sso.godaddy.com?realm=idp&path=%2F&app=canary.gasket'
              }
            }
          }
        }
      }
    }
  }
};
