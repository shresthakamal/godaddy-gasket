const { transformSync, types: t } = require('@babel/core');
const withPatchSpinner = require('../with-patch-spinner');

function updateConfig({ updateContent }) {
  updateContent('gasket.config.js', content => {
    const output = transformSync(content, {
      plugins: [
        function addNextConfig() {
          return {
            visitor: {
              ObjectExpression(path) {
                // this should be the top-level export object
                if (path.parent.left && path.parent.left.object.name === 'module') {
                  let helmet;
                  path.get('properties').forEach(prop => {
                    if (prop.node.key.name === 'helmet') {
                      helmet = prop.node;
                    }
                  });

                  // if we don't have the helmet, create one
                  if (!helmet) {
                    helmet = t.objectProperty(t.identifier('helmet'), t.objectExpression([]));
                    path.node.properties.push(helmet);
                  }

                  if (helmet.value.properties.find(prop => prop.key.name === 'contentSecurityPolicy')) {
                    return;
                  }

                  // add the future prop
                  helmet.value.properties.push(
                    t.objectProperty(t.identifier('contentSecurityPolicy'), t.booleanLiteral(false))
                  );
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

module.exports = withPatchSpinner('Configure Helmet', updateConfig);
