import typescriptPrompts from '@gasket/plugin-typescript/prompts';

/** @type {import('@gasket/core').HookHandler<'presetPrompt'>} */
export default async function presetPrompt(gasket, context, { prompt }) {
  context.apiApp = true;
  context.codeStyle = 'godaddy';

  await typescriptPrompts.promptTypescript(context, prompt);
}
