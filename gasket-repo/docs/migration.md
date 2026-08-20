# Migrating to Gasket

This guide provides architectural pointers and tips when migrating from `X` to
Gasket. A specific migration guide exists for migrating from `GD-web-app` which
is tailored towards technical implementation and requirements. This guide should
help make generic architectural decisions when adopting Gasket.

It is recommended to first read through this guide before following a [specific
migration guide](#application-specific-guides).

## Before you start

It can be tempting to rewrite all of your application code to Gasket to make use
of all its features. However, avoid a "great rewrite" migration at all costs!
Overvaluing shiny new features is a common pitfall. Make sure you plan ahead by
using the following pointers as guidance. First and foremost look to boost the
confidence of you and your team using Gasket.

Approach the migration with small planned incremental steps. While planning,
keep in mind that Gasket is both a client and server-side service. The migration
could involve migrating your server-side code. Gaskets' lifecycles
and plugins are a really good fit to do this migration incrementally.

1. [Be strict](#1-be-strict)
2. [Minimize risk](#2-minimize-risk)
3. [Incremental exposure](#3-incremental-exposure)
4. [Measure performance and resources](#4-measure-performance-and-resources)
5. [Leverage your tests](#5-leverage-your-tests)
6. [embrace opportunity](#6-embrace-opportunity)

## Migrating with confidence

#### 1\. Be strict

Gasket is primarily a web framework with awesome support for React. However, it
also provides plenty of plugins for specific features. There is no need to adopt
all plugins at once. Be rigorous and only change the parts of your service that
require changing.

> For example, gasket offers a large set of development tooling options. You
> don't need to start using these immediately. If your running unit tests in
> `jasmine` today, stick with that. Do not feel tempted to also switch to
> `mocha` or `jest`, just because Gasket prompts while creating a new
> boilerplate app.

#### 2\. Minimize risk

Start with migrating a small customer-facing route of your app. Or if possible,
migrate a route that has internal exposure only. The route or view should be as
simple as possible. It should have mostly static content or have a minimal set
of UI actions. Isolating critical business logic from the initial set of changes
makes it easier to transition.

> Start with an app route that has little or no `state` at all. Less complex
> `state` usually implies less dependency on `redux` reducers. Gasket is built
> on [Next.JS] which enforces a _structure_ to enable it to add complex
> features. Features like server-side rendering should work out-of-the-box.
> While others, like preloading pages with the `Link` component from Next.JS
> requires changing component internals. However, regular anchor elements still
> work as before. Our advice is to refrain from changing component internals.
> Slowly adopting new Gasket features over time is recommended.

#### 3\. Incremental exposure

Incrementally expose customers to the new service running on Gasket. There is no
need to migrate all customers at once. Using a proxy service can enable you to
reroute parts of traffic. Expose a small sample set of customers to the route on
Gasket and ramp up in sequential sprints. Do monitor and measure the new route,
both for unexpected errors as well as performance.

> Initiall, start with exposing just 5% of customers to the route on Gasket.
> I.e. after ramp up in steps: 10%, 25%, 100%. You can configure [Nginx] to
> split traffic between Gasket and the current service. The proxy can then be
> used as [ingress controller][ingress] to distribute traffic within Kubernetes.

#### 4\. Measure performance and resources

Do not assume your application will be performing better on Gasket. Measure to
know how the framework change affects your performance. Use [RUM], [Dojo] and/or
[Lighthouse] to get key metrics on performance. This is especially important if
your migration also involves switching network ontology from for example
Openstack to AWS.

_Key performance indicators to monitor while switching to Gasket are:_

- TTFB: Time to first byte Server-side rendering could negatively affect this
  metric. Especially if the implemented `getInitialProps`
  ([Next.JS component lifecycle][initial-props]) is blocking or slow.
- TFMP: Time to first meaningful paint
- TTI: Time to interactive This could, for example, be negatively affected by
  complex `state` or slower JS parse times due to unexpected bundle size
  increases.

In addition, if your migration involves moving to AWS, consider using something
like [Cloudwatch] to monitor and measure your resource consumption. Gasket could
result in different resource consumption, setting up the correct scale for
services is important.

#### 5\. Leverage your tests

UI and E2E testing will be pivotal in a smooth transition. You should be able to
treat Gasket as a black box. Output should be similar (not identical) for the
same input. From a customers perspective the UX should not change by using
Gasket. E2E tests will help build confidence your service is doing what it
should do. If you have no E2E tests consider writing a suite of tests before you
migrate.

#### 6\. Embrace opportunity

New features might be planned during the migration. Discuss with your team and
PM if it would be more efficient to add this feature to the new service running
on Gasket, rather than backporting it first.

## Example

This example deliberately simplifies how actual sprint work might be planned.
The goal here is to demonstrate a single developer could kickstart the
migration, while devoting more resources as soon as the migration is underway.

| Sprint # | Routes              | Exposure |
|:---------|:--------------------|:---------|
| 1        | _setup gasket repo_ |          |
|          | /legal              | 5%       |
| 2        | _setup proxy_       |          |
|          | /legal              | 10%      |
|          | /create/user        | 5%       |
| 3        | /legal              | 25%      |
|          | /create/user        | 10%      |
|          | /dashboard          | 5%       |
| 4        | /legal              | 100%     |
|          | /create/user        | 25%      |
|          | /dashboard          | 10%      |
|          | _new feature_       |          |

## Application specific guides

The guides to migrate to Gasket from `gd-webapp` can be found here:

- [gd-webapp guide](from-gd-webapp.md)

[Next.JS]: https://nextjs.org/
[Nginx]: https://www.nginx.com/blog/performing-a-b-testing-nginx-plus/
[ingress]: https://kubernetes.io/docs/concepts/services-networking/ingress/
[RUM]: http://perfdash.int.godaddy.com/
[Dojo]: https://dojo.godaddy.com/customer
[Lighthouse]: https://developers.google.com/web/tools/lighthouse/
[initial-props]: https://nextjs.org/docs#fetching-data-and-component-lifecycle
[Cloudwatch]: https://aws.amazon.com/cloudwatch/
