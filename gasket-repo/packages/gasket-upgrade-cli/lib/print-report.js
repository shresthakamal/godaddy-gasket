/* eslint-disable no-console */

/**
 * Outputs create command details to the console
 * @param {PatchContext} context - Context
 */
function printReport(context) {
  const { messages, nextSteps } = context || {};

  console.log(`✨Success!
  
⚠️ Be sure to test your app!
  This upgrade tool gets things close but there may be other changes required.
  Consult the upgrade guides for further details.

Messages
${messages && messages.map(msg => `  - ${msg}`).join('\n')}

Next Steps
${nextSteps && nextSteps.map(msg => `  - ${msg}`).join('\n')}

`);

}

module.exports = printReport;
