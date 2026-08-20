const { transformSync, types: t } = require('@babel/core');
const withPatchSpinner = require('../with-patch-spinner');

const label = 'Configure Intl Plugin';

function updateConfig(context, spinner) {
  if (context.moveLocaleToPublic) {
    spinner.info(`${label} (avoided)`);
    return;
  }

  context.updateContent('gasket.config.js', content => {
    const output = transformSync(content, {
      plugins: [
        function addIntlConfig() {
          return {
            visitor: {
              ObjectExpression(path) {
                // this should be the top-level export object
                if (path.parent.left && path.parent.left.object.name === 'module') {
                  let intlConfig;
                  path.get('properties').forEach(prop => {
                    if (prop.node.key.name === 'intl') {
                      intlConfig = prop.node;
                    }
                  });

                  // if we don't have the nextConfig, create one
                  if (!intlConfig) {
                    intlConfig = t.objectProperty(t.identifier('intl'), t.objectExpression([]));
                    path.node.properties.push(intlConfig);
                  }

                  if (!intlConfig.value.properties.find(prop => prop.key.name === 'localesDir')) {
                    intlConfig.value.properties.push(
                      t.objectProperty(t.identifier('localesDir'), t.stringLiteral('./locales'))
                    );
                  }

                  if (!intlConfig.value.properties.find(prop => prop.key.name === 'serveStatic')) {
                    intlConfig.value.properties.push(
                      t.objectProperty(t.identifier('serveStatic'), t.booleanLiteral(true))
                    );
                  }
                }
              }
            }
          };
        }
      ]
    });

    return output.code;
  });
}

module.exports = withPatchSpinner(label, updateConfig);
