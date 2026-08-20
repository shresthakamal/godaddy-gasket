# @godaddy/gasket-plugin-traffic

Gasket plugin relating to Traffic (traffic2) functionality. This plugin derives
the key/value pairs for the Traffic data layer that will be added to the traffic
initialization script for Gasket apps. This plugin will also create the
Traffic session cookies (visitor, pathway, fb_sessiontraffic) if they are not
already set or have expired.

## Installation

This plugin is already included by [@godaddy/gasket-preset-webapp]. The
following steps are only necessary if that preset is not used.

#### New apps

```
gasket create <app-name> --plugins @godaddy/gasket-plugin-traffic
```

#### Existing apps

```
npm i @godaddy/gasket-plugin-traffic
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginTraffic from '@godaddy/gasket-plugin-traffic';

export default makeGasket({
  plugins: [
+   pluginTraffic
  ]
});
```

## Lifecycles

### trafficDataLayer

> ⚠️ **DEPRECATED:** The `trafficDataLayer` lifecycle is deprecated and will be
> removed in a future version. Use the [tccData](#tccData) lifecycle instead,
> which uses `execWaterfall` and makes it simple to add, modify, or remove
> properties from the data layer.

This lifecycle enables the app or other plugins to customize this data layer.
Plugins hooking this event should return a key/value pair object containing
[Page Level Values / Config Properties] to be injected. For example:

```js
export default {
  name: 'gasket-plugin-example',
  hooks: {
    async trafficDataLayer(gasket, context){
      return {
        dcenter: process.env.CLUSTER_NAME
      }
    }
  }
}
```

The hook is passed the following parameters:

| Parameter | Description                         |
|:----------|:------------------------------------|
| `gasket`  | The `gasket` API                    |
| `context` | The context object                  |
|           | - `req` The express request object  |
|           | - `res` The express response object |

### tccData

This lifecycle enables the app or other plugins to customize the Traffic data layer.

```js
export default {
  name: 'gasket-plugin-example',
  hooks: {
    async tccData(gasket, data, context){
      // remove a property
      const { loadSource, ...rest } = data;

      // add/override a property
      return {
        ...rest,
        dcenter: process.env.CLUSTER_NAME
      }
    }
  }
}
```

The hook is passed the following parameters:

| Parameter | Description                         |
|:----------|:------------------------------------|
| `gasket`  | The `gasket` API                    |
| `data`    | The Traffic data layer so far       |
| `context` | The context object                  |
|           | - `req` The gasket request object  |

### signalsConfig

This lifecycle enables the app or other plugins to customize the signals configuration
that will be used for experiment tracking. Plugins hooking this event should return a 
partial configuration object that will be merged with the base configuration.

```js
export default {
  name: 'gasket-plugin-example',
  hooks: {
    async signalsConfig(gasket, config, context){
      return {
        config: {
          experiments: [
            ...config.config.experiments,
            {
              id: 'custom-experiment',
              variant: 'control'
            }
          ]
        }
      }
    }
  }
}
```

The hook is passed the following parameters:

| Parameter | Description                         |
|:----------|:------------------------------------|
| `gasket`  | The `gasket` API                    |
| `config`  | The current signals configuration   |
| `context` | The context object                  |
|           | - `req` The express request object  |


<!-- LINKS -->

[Page Level Values / Config Properties]:https://godaddy-corp.atlassian.net/l/cp/2akXAJK4
[@godaddy/gasket-preset-webapp]:/packages/gasket-preset-webapp/README.md
