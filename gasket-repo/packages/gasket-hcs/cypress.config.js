const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('./cypress/serve.js')(on, config);
    }
  },

  //
  // Required to make our ./cypress/serve.js plugin work when using Cypress's
  // open instead of run mode as our server uses the before / after events to
  // manage the server instance.
  //

  // eslint-disable-next-line id-length
  experimentalInteractiveRunEvents: true
});
