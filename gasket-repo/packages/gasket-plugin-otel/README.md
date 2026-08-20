# @godaddy/gasket-plugin-otel

Gasket plugin to add the `traceId` middleware using OpenTelemetry.


## Installation

#### Existing apps

```
npm i @godaddy/gasket-plugin-otel
```

Modify `plugins` section of your `gasket.js`:

```diff
import { makeGasket } from '@gasket/core';
import pluginOtel from '@godaddy/gasket-plugin-otel';

export default makeGasket({
  plugins: [
    ...otherPlugins,
+   pluginOtel
  ]
})
```

## Configuration

See the [@godaddy/gasket-otel](../gasket-otel/README.md) package for configuration details.

## Actions

### getTraceId

Use the `getTraceId` action to create and/or get a unique `traceId` for the
request.

```js
const traceId = gasket.actions.getTraceId(req);
```

### setTraceIdCookie

Having a meta tag with the `traceId` is required for the Traffic client. On an
SSR page, we can render the meta tag on the server. However, on a static page,
we need to set the `traceId` on the response cookie, then create the meta tag
dynamically in the browser.

Use the `setTraceIdCookie` action to set a `traceId` cookie on the response.

```js
gasket.actions.setTraceIdCookie(req, res);
```

### getOtelMeter

Use the `getOtelMeter` action to get an OpenTelemetry [Meter] for recording
custom metrics (counters, histograms, observable gauges). The metrics pipeline
and global MeterProvider are configured automatically by [@godaddy/gasket-otel],
so instruments you create are exported without further setup.

```js
const meter = gasket.actions.getOtelMeter('my-service');

const activeJobs = meter.createObservableGauge('jobs.active');
activeJobs.addCallback((observer) => observer.observe(getActiveJobCount()));
```

`getOtelMeter(name, options?)` — `name` is **required**; pass your service name
so metrics are attributable. `options` accepts `{ version?, options? }`, where
`options` is OTel's [`MeterOptions`].

[Meter]: https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api.Meter.html
[`MeterOptions`]: https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api.MeterOptions.html

## Middleware

When using [@gasket/plugin-middleware] alongside this plugin, a `res.setTraceIdCookie()`
method is available, which sets the `traceId` cookie on the response cookie.
This should only be called when the app is serving a static page.

In the browser, the static page document should have a script to read the
cookie, create the meta tag, then expire the cookie. Such a script is set up
by using the [withStaticContent] Document HOC from [@godaddy/gasket-next].

## Metrics

Metrics are exported automatically by [@godaddy/gasket-otel]. See that package for configuration details.

<!-- LINKS -->

[@gasket/plugin-middleware]: https://github.com/godaddy/gasket/tree/main/packages/gasket-plugin-middleware/README.md
[@godaaddy/gasket-next]:/packages/gasket-next/README.md
[withStaticContent]:/packages/gasket-next/README.md#withstaticcontent
[@godaddy/gasket-otel]: ../gasket-otel/README.md
