# Shipping Production Gasket Applications @ GoDaddy

This is an end-to-end guide on how to create, build, deploy, and monitor your
own Gasket app at GoDaddy. This guide is designed so you may skip around to
sections of interest without having to read from the beginning.


## Create your app

See `Setup Artifactory` for a guide on setting up your artifactory, then create a Gasket
app using the instructions in `Quickstart`. During the create stage, the `create-gasket-app`
cli will ask series of questions to help you set up your initial gasket app.

- [Setup Artifactory][artifactory]
- [Quickstart][quickstart]
- [create-gasket-app][create-gasket-app]
- Talk to us!
  - [#gasket-support] on Slack.

## Build your app

Once you have your gasket app created, it is time to start building. GoDaddy
Gasket web apps are built around `Next.js` and uses its page routing and app routing, which
enforces a certain structure. To learn more about `Next.js`, refer to `Learn
Next.js`. For more specifics on routing, refer to `Guides/Routing`. To learn
more about the typical structure of a Gasket app and any special files and
directories to be aware of and their purposes, please refer to `Learn
Gasket/Structure`.

Additionally, many react components and plugins which can be added as needed.
For example, to secure parts of your app with GoDaddy SSO, the `auth` component
and plugin can be used. For a list of the provided react component libraries and
their purposes, please refer to `Structure/Components`. For a list of the
available plugins, including how to configure them in your Gasket application,
please refer to `Structure/Plugins`. In addition, Gasket also provides templates,
which are collections of plugins that serve a special purpose.

The core functionality of Gasket web apps can be extended through plugins and
configurations. You may want to familiarize yourself with the concept of
lifecycle hooks and events before adding your extensions. See `Guides/Authoring
Plugins` for more details.

The `Gasket canary app` is an sample Gasket app that provides examples on some
plugins and components which can be cloned to be used as a playground.

- Learn Gasket
  - [Structures]
  - [Plugins]
  - [Templates]
  - [Lifecycles]
- [Explore the Gasket canary app][canary-app]
- [Learn Next.js][nextjs]
  - [Automatic Code Splitting][nextjs-code-splitting]
  - [Prefetching Pages][nextjs-prefetch]
  - [Dynamic Import][nextjs-dynamic-import]
  - [Routing][routing]
- [Guides]
  - [Authoring Plugins]
  - GoDaddy [SSO Authentication][sso-auth]
  - [JWT with Fetch][auth-fetch]
  - [Reseller Support][reseller-support]
- Talk to us!
  - [#gasket-support] on Slack.

## Deploy your app

`Katana` is the recommended platform for deploying your Gasket app. 
It simplifies the development, deployment, and management of applications on AWS. 
Everything you need to know about deploying your Next.js Gasket app, including 
required files, and environment specific configurations are included in the `Deployment` guide. 
If you intend to deploy to `docker`, make sure to checkout the provided sample 
definition for a container that runs a Gasket application in `Docker Deployment`.

- [Deployment][deployment]
- [Docker Deployment][docker-deployment]
- [Katana][katana]
  - [Get Started with Katana][katana-start]
- Talk to us!
  - [#gasket-support] on Slack.

## Monitor your app

Katana provides built-in ways to view logs and monitor your deployed applications. 
Katana configures your application to send its logs to Amazon CloudWatch Logs.
- Katana
  - [Monitoring]
  - [Logs]
- Talk to us!
  - [#gasket-support] on Slack.

<!-- LINKS -->

[APM]: https://www.elastic.co/products/apm
[artifactory]: https://github.com/gdcorp-engineering/javascript-best-practices/blob/master/nodejs/using-npm-with-artifactory.md#readme
[katana]: https://tdl.gdcorp.tools/docs/products/compute/managed/katana/
[Monitoring]: https://tdl.gdcorp.tools/docs/products/compute/managed/katana/monitoring/
[logs]: https://tdl.gdcorp.tools/docs/products/compute/managed/katana/monitoring/#logs
[katana-start]: https://tdl.gdcorp.tools/docs/products/compute/managed/katana/get-started/
[nextjs]: https://nextjs.org/docs
[nextjs-code-splitting]: https://nextjs.org/learn/dashboard-app/navigating-between-pages#automatic-code-splitting-and-prefetching
[nextjs-prefetch]: https://nextjs.org/docs/app/guides/prefetching
[nextjs-dynamic-import]: https://nextjs.org/docs/pages/guides/lazy-loading#nextdynamic

[Authoring Plugins]: https://github.com/godaddy/gasket/blob/main/docs/authoring-plugins.md
[routing]: https://github.com/godaddy/gasket/tree/main/packages/gasket-plugin-nextjs/docs/routing.md
[deployment]: https://github.com/godaddy/gasket/blob/main/packages/gasket-plugin-nextjs/docs/deployment.md
[docker-deployment]: https://github.com/godaddy/gasket/blob/main/packages/gasket-plugin-nextjs/docs/docker-deployment.md
[canary-app]: https://github.com/gdcorp-uxp/gasket-canary
[#gasket-support]: https://godaddy.slack.com/messages/CABCTNQ5P
[create-gasket-app]: https://github.com/godaddy/gasket/tree/main/packages/create-gasket-app
[Templates]: https://github.com/godaddy/gasket/blob/main/packages/create-gasket-app/README.md#templates

<!-- REPO LINKS -->

[quickstart]: quick-start.md
[sso-auth]: /packages/gasket-plugin-auth/docs/authentication.md
[auth-fetch]: /packages/gasket-plugin-auth/docs/fetch.md
[reseller-support]: /packages/gasket-plugin-uxp/docs/white-labeling.md
[Lifecycles]: ../README.md#lifecycles
[Plugins]: ../README.md#plugins
[Structures]: ../README.md#structures
[Guides]: ../README.md#guides

