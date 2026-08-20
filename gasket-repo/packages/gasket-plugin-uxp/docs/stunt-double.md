# Stunt Double

The `stuntDouble` presentation central parameter may be used to bypass hydra and its caches and request directly to the header origin set in `gasket.config.presentationCentral.stuntDoubleUrl`. Apps may hook the `presentationCentral` lifecycle to conditionally add this parameter, e.g.
```js
// gasket config
{
  ...,
  presentationCentral: {
    ...presentationCentralConfig,
    pcStuntDoubleUrl: 'https://example-header.godaddy.com/v3'
  }
}

// plugin
{
  name: 'example-plugin',
  hooks: presentationCentral(gasket, params, { req }) {
    const { headerPreview } = req.query ?? {};
    if(headerPreview) {
      params.stuntDouble = true; // PC request will go to https://example-header.godaddy.com/v3/:app instead of hydra
    }
  }
}
```

This is a backwards compatible extension of the [legacy stunt double](https://github.com/gdcorp-uxp/hydra/blob/main/legacy-hydra-docs/stunt-double-integration.md) functionality, which uses a url from cookies.
