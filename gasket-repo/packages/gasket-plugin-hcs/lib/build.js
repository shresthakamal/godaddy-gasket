/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-webpack" />


import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promisify } from 'util';
import webpack from 'webpack';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import { getPackageName } from './utils.js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const webpackPromisified = promisify(webpack);
// @ts-ignore - this require path is correct
const { umd } = require('@ux/react-bundle/externals');

/**
 * @param {boolean} [externalizeJsxRuntime] - Whether to include react/jsx-runtime and react/jsx-dev-runtime as externals
 * @returns {object} Webpack externals map for the HCS client bundle
 */
function getClientExternals(externalizeJsxRuntime) {
  const clientExternals = { ...umd };
  if (!externalizeJsxRuntime) {
    delete clientExternals['react/jsx-runtime'];
    delete clientExternals['react/jsx-dev-runtime'];
  }
  return clientExternals;
}

/** @type {import('@gasket/core').HookHandler<'build'>} */
// eslint-disable-next-line max-statements, complexity
async function build(gasket) {

  const getLocaleInfo = () => {
    const locale = process.env.WRHS_LOCALE || process.env.LOCALE || 'en-US';
    const [lang, region] = locale.split('-');
    return { lang, region, locale };
  };

  const getLegacyWebpackVars = () =>  {
    const NODE_ENV = process.env.NODE_ENV || 'development';
    const { lang, region } = getLocaleInfo();
    return {
      'uxcore-env': NODE_ENV,
      'uxcore-market': (process.env.UXCORE_LANG || lang || 'en').toLowerCase(),
      'uxcore-region': (process.env.UXCORE_REGION || region || 'US').toLowerCase(),
      'uxcore-label': process.env.UXCORE_LABEL || 'gd'
    };
  };

  const vars = getLegacyWebpackVars();

  const pkgName = getPackageName(gasket);
  const { hcs: { enableBundleAnalyzer, devMode = false, useMintl = false, useSassLoader = true } } = gasket.config;

  const alias = useMintl ? {
    'react-intl': require.resolve('@godaddy/react-mintl', { paths: [gasket.config.root, __dirname] })
  } : {};
  //
  // Convert the environment variables to sass variables.
  //
  const toSass = function (data) {
    data = Object.assign({}, vars, data || {});

    return Object.keys(data).reduce((sass, key) => {
      return sass + `$${ key }:${ JSON.stringify(data[key]) };`;
    }, '');
  };

  const sassLoader = function (opts) {
    const { options, importer, importerOptions, data, sassVars, sourceMap } =
      opts || {};

    return {
      loader: 'sass-loader',
      options: options || {
        ...(sourceMap && { sourceMap } || {}),
        additionalData: data || toSass(sassVars),
        sassOptions: devMode ? {} : {
          importer: importer || createImporter(importerOptions)
        }
      }
    };
  };

  /**
   * Check if the SCSS import module is available.
   * @type {import('./internal').CreateImporter}
   * @private
   */
  function createImporter(options) {
    return require('sass-import-modules').importer(options);
  }

  /**
   * Get PostCSS plugins configuration
   * @returns {Array} PostCSS plugins
   */
  function getPostcssPlugins() {
    const plugins = [];
    // Add @ux/postcss-config plugins
    try {
      // @ts-ignore - @ux/postcss-config may not have type declarations
      const { plugins: uxPostcssConfig } = require('@ux/postcss-config');
      if (Array.isArray(uxPostcssConfig)) {
        plugins.push(...uxPostcssConfig);
      }
    } catch {
      // Fallback to basic autoprefixer if @ux/postcss-config is not available
      plugins.push(require('autoprefixer')({
        flexbox: 'no-2009'
      }));
    }

    return plugins;
  }

  /** @type {import('webpack').Configuration} */
  const baseCommon = {
    context: gasket.config.root,
    entry: gasket.config?.hcs?.entry || './components/index.js',
    module: {
      rules: [{
        test: /\.(js|ts)x?$/,
        use: {
          loader: 'babel-loader'
        }
      }]
    },
    plugins: [],
    resolve: {
      extensions: ['.js', '.mjs', '.jsx', '.wasm', '.json', '.ts', '.tsx']
    },
    devtool: 'source-map',
    mode: (gasket.config.env === 'local' || gasket.config.env === 'development') ? 'development' : 'production',
    output: {
      path: path.join(gasket.config.root, 'build')
    },
    optimization: {
      chunkIds: 'deterministic',
      minimize: true,
      minimizer: [
        new CssMinimizerPlugin({
          parallel: true,
          minimizerOptions: {
            preset: [
              '@godaddy/cssnano-preset', {
                //
                // The `@ux/icon` sources that we include in the bundle are
                // already optimized and should always be ignored to prevent
                // problematic transformation of it's contents.
                //
                svgo: false,

                //
                // The calc optimizer that is used is complaining about valid
                // var() references that are used inside the functions. We
                // disable these optimizations to silence these warnings.
                //
                calc: false,

                //
                // When building for local or development we want to make sure that we
                // disable all optimizations that the minimizer is doing in
                // the default preset. The only optimization that we want to
                // keep enabled is the duplicate removal to ensure that all
                // dependencies are only included once in the final bundle.
                //
                ...(gasket.config.env === 'local' || gasket.config.env === 'development' ? {
                  colormin: false,
                  convertValues: false,
                  cssDeclarationSorter: false,
                  discardComments: false,
                  discardEmpty: false,
                  discardOverridden: false,
                  mergeLonghand: false,
                  mergeRules: false,
                  minifyFontValues: false,
                  minifyGradients: false,
                  minifyParams: false,
                  minifySelectors: false,
                  normalizeCharset: false,
                  normalizeDisplayValues: false,
                  normalizePositions: false,
                  normalizeRepeatStyle: false,
                  normalizeString: false,
                  normalizeTimingFunctions: false,
                  normalizeUnicode: false,
                  normalizeUrl: false,
                  normalizeWhitespace: false,
                  orderedValues: false,
                  rawCache: false,
                  reduceInitial: false,
                  reduceTransforms: false,
                  uniqueSelectors: false
                } : {})
              }
            ]
          }
        }),
        // -- Spread default config @see https://webpack.js.org/configuration/optimization/#optimizationminimizer
        '...'
      ]
    }
  };

  const styleProcessingRules = [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        // This tells the loader to process css files imported by scss or linaria
        importLoaders: 1
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            require('postcss-rtlcss')({
              mode: 'override'
            }),
            ...getPostcssPlugins()
          ].filter(Boolean)
        }
      }
    }
  ];

  if (useSassLoader) {
    styleProcessingRules.push(
      sassLoader({
        importerOptions: {
          resolvers: ['local', 'tilde', 'node', 'partial']
        }
      }));
  }

  /** @type {import('webpack').Configuration} */
  const baseClient = {
    ...baseCommon,
    module: {
      ...baseCommon.module,
      rules: [
        ...baseCommon.module.rules,
        {
          test: /\.s?css/,
          use: styleProcessingRules
        }
      ]
    },
    plugins: [
      new WebpackManifestPlugin({
        generate: gasket.config.hcs?.webpack?.generateManifest || function generateManifest(seed, files) {
          return files.reduce((acc, file) => {
            acc[file.path] = {
              isChunk: file.isChunk && !file.isInitial
            };
            return acc;
          }, {});
        },
        fileName: '_metadata.json',
        publicPath: ''
      }),
      ...(['local', 'development'].includes(gasket.config.env) ? [new (require('webpack-react-component-name'))()] : []),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({})
      }),
      ...(enableBundleAnalyzer ? [new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)()] : []),
      ...baseCommon.plugins,
      new MiniCssExtractPlugin({
        filename: path.join(pkgName + '.css'),
        runtime: false
      })
    ],
    name: 'client',
    target: 'web',
    output: {
      ...baseCommon.output,
      filename: pkgName + '.js',
      library: {
        name: 'HCS',
        type: 'umd',
        umdNamedDefine: true
      },
      globalObject: 'window'
    },
    resolve: {
      ...baseCommon.resolve,
      mainFields: ['browser', 'module', 'main'],
      symlinks: false,
      alias
    },
    externals: getClientExternals(gasket.config.hcs?.webpack?.externalizeJsxRuntime === true)
  };

  const hcsReact = path.join(gasket.config.root, '/node_modules/@godaddy/gasket-plugin-hcs/node_modules/react');
  let hcsHasReact = false;
  try {
    hcsHasReact = !!(require.resolve(hcsReact));
    // eslint-disable-next-line no-empty
  } catch {}

  const serverStyleProcessingRules = [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        // This tells the loader to process css files imported by scss or linaria
        importLoaders: 1
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            require('postcss-rtlcss')({
              mode: 'override'
            }),
            ...getPostcssPlugins()
          ].filter(Boolean)
        }
      }
    }
  ];

  if (useSassLoader) {
    serverStyleProcessingRules.push(
      sassLoader({
        importerOptions: {
          resolvers: ['local', 'tilde', 'node', 'partial']
        }
      })
    );
  }

  /**
   * Target `node` will enable a functional babel config to differentiate
   * between babel-loader callers and provide any HCS consumer with additional
   * flexiblity.
   * @type {import('webpack').Configuration}
   */
  const baseServer = {
    ...baseCommon,
    name: 'server',
    target: 'node',
    module: {
      ...baseCommon.module,
      rules: [
        ...baseCommon.module.rules,
        {
          test: /\.s?css/,
          use: serverStyleProcessingRules
        }
      ]
    },
    output: {
      ...baseCommon.output,
      filename: pkgName + '.server.cjs',
      library: {
        type: 'commonjs'
      },
      globalObject: 'this'
    },
    externalsPresets: { node: true },
    externals: [
      { react: hcsHasReact ? hcsReact : 'react' },
      // Additional filtering for CSS/SCSS files
      function ignoreStyles({ request }, done) {
        if (/\s?css$/.test(request)) {
          return done(null, `var {}`);
        }
        done();
      }
    ],
    resolve: {
      ...baseCommon.resolve,
      symlinks: false,
      mainFields: ['module', 'main'],
      alias
    }
  };

  const webpackConfig = [];
  const client = gasket.actions.getWebpackConfig(baseClient, { });
  delete client.node;
  webpackConfig.push(client);

  if (!gasket.config?.hcs?.skipSSR) {
    const server = gasket.actions.getWebpackConfig(baseServer, { isServer: true });
    delete server.node;
    webpackConfig.push(server);
  }

  await webpackPromisified(webpackConfig);
}

export default build;
