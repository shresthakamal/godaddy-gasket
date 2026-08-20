# {{{appName}}}

{{{appDescription}}}

## Local Setup

Ensure you are connected to the VPN, then start the app.

```bash
cd {{{appName}}}

{{{installCmd}}}

{{{localCmd}}}
```

The app should now be accessible over https on port 8443 at:

```
https://local.gasket.dev-godaddy.com:8443
```

{{#each readme.markdown}}
{{{markdownCompile this}}}
{{/each}}

<!-- LINKS -->

[App Router]: https://nextjs.org/docs/app
[Page Router]: https://nextjs.org/docs/pages
[Custom Server]: https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
[EcmaScript Modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

{{#each readme.links}}
{{{this}}}
{{/each}}
