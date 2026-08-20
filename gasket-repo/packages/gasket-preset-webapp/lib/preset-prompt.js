import { promptNextServerType } from '@gasket/plugin-nextjs/prompts';
import typescriptPrompts from '@gasket/plugin-typescript/prompts';

/** @type {import('@gasket/core').HookHandler<'presetPrompt'>} */
export default async function presetPrompt(gasket, context, { prompt }) {
  context.addStylelint = true;
  context.codeStyle = 'godaddy';

  await typescriptPrompts.promptTypescript(context, prompt);
  await promptNextServerType(context, prompt);
  context.nextDevProxy = context.nextServerType !== 'customServer';
}
