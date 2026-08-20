const { DummyComponent, defaultProps } = require('./fixtures');
const withManifest = require('../lib/with-manifest').default;
const { createFsFromVolume, Volume } = require('memfs');
const { renderToString } = require('react-dom/server');
const handler = require('serve-handler');
const fs = require('node:fs/promises');
const webpack = require('webpack');
const http = require('node:http');
const path = require('node:path');
const React = require('react');

/**
 * Generate a template string for the HTML file.
 * @returns {string} The template string.
 * @public
 */
function template() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test</title>
    </head>
    <body>
      <div id="root">${renderToString(React.createElement(withManifest(DummyComponent), defaultProps))}</div>
      <script src="/cypress/dist/bundle.js"></script>
    </body>
    </html>
  `;
}

/**
 * Create a bundle of the client code..
 * @param {http.IncomingMessage} req Incoming request.
 * @param {http.OutgoingMessage} res Outgoing response.
 * @private
 */
function bundle(req, res) {
  const compiler = webpack({
    target: 'web',
    mode: 'development',
    entry: path.join(__dirname, 'fixtures', 'client.js'),
    output: {
      path: '/',
      filename: 'bundle.js'
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development')
      })
    ],
    module: {
      rules: [
        {
          test: /\.(?:js|mjs|cjs)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }]
              ]
            }
          }
        }
      ]
    }
  });

  // We're using a virtual file system to store the output of the webpack as
  // we don't want to write to disk when running in Cypress.
  const mfs = createFsFromVolume(new Volume());
  compiler.outputFileSystem = mfs;

  return new Promise((resolve, reject) => {
    compiler.run((err) => {
      if (err) return reject(err);

      res.writeHead(200, { 'Content-Type': 'application/javascript' });

      // eslint-disable-next-line no-sync
      res.end(mfs.readFileSync('/bundle.js', 'utf-8'));

      resolve();
    });
  });
}

/**
 * Start a http file serving server when testing in Cypress.
 * @param {Function} on Event handling.
 * @param {object} config Cypress configuration.
 * @public
 */
function setupNodeEvents(on, config) {
  // We're using the root of the repo as public, so we can easily have
  // access to our /dist folder which contains our files, but also any
  // fixtures that we create in this folder
  const opts = {
    public: path.join(__dirname, '..'),
    headers: [{
      source: '**/*.@(js)',
      headers: [{
        key: 'Access-Control-Allow-Origin',
        value: '*'
      }, {
        key: 'Access-Control-Allow-Headers',
        value: 'Origin, X-Requested-With, Content-Type, Accept, Range'
      }]
    }],
    ...(config.serve || {})
  };

  const server = http.createServer(async (req, res) => {
    if (req.url === '/cypress/dist/bundle.js') return await bundle(req, res);
    return handler(req, res, opts);
  });

  // Start the server when the tests start running.
  on('before:run', async () => {
    const start = new Promise((resolve) => server.listen(3000, resolve));

    await fs.writeFile(path.join(__dirname, 'fixtures', 'index.html'), template());
    await start;
  });

  // Kill the server on completion.
  on('after:run', async () => {
    const close = new Promise((resolve) => server.close(resolve));
    await close;
  });
}

// For debugging purposes, if this file is loaded directly we
// start out local file server so we can debug the output without
// needing cypress running.
//
// You can then open the fixtures locally in your browser and debug the output.
if (require.main === module) (async function () {
  setupNodeEvents(function on(when, fn) {
    setupNodeEvents.events = setupNodeEvents.events || {};
    setupNodeEvents.events[when] = fn;
  }, {});

  await setupNodeEvents.events['before:run']();

  // eslint-disable-next-line no-console
  console.log('Local file server started on http://localhost:3000');
}());

// Expose the plugin.
module.exports = setupNodeEvents;
