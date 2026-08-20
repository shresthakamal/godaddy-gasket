# Debugging Gasket Apps

In this guide, we cover some common issues you may encounter when developing Gasket applications and how to resolve them.

## Cannot reach local.gasket.dev-godaddy.com

This can happen if you are off VPN and have not set up your /etc/hosts files.
Add any local.gasket.* hostnames you are using to point to your local IP:

```bash
127.0.0.1  local.gasket.dev-godaddy.com         # godaddy
127.0.0.1  local.gasket.dev-secureserver.net    # private label
127.0.0.1  local.gasket.dev-gdcorp.tools        # godaddy corporate tools
127.0.0.1  local.gasket.int.dev-gdcorp.tools    # internal godaddy corporate tools
```

## Refused to connect to local.gasket.dev-godaddy.com

This can happen if you are trying to access your app using the wrong port.
By default, Gasket apps run on port 8443 for HTTPS for local development.

1. Check your `gasket.js` file to confirm the port your app is configured to use.
2. Make sure you are using the correct URL format in the browser, such as:
    https://local.gasket.dev-godaddy.com:8443

