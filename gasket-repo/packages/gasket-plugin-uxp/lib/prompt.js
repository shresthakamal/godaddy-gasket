/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-intl" />
/// <reference types="@gasket/plugin-nextjs" />

import { headerDetails } from './constants.js';

/** @type {import('@gasket/core').HookHandler<'prompt'>} */
export default async function promptHook(gasket, context, { prompt }) {

  const {
    appName,
    header: contextHeader,
    hasGasketIntl,
    nextServerType
  } = context;


  /** @type {import('.').UxpCreateContext } */
  // @ts-ignore - must default to emptu object if not set
  const contextUxp = context.uxp || {};

  const { app = appName, header = contextHeader, isGoDark, useRtl } = contextUxp;

  const v3Only = nextServerType === 'appRouter';
  const headerChoices = headerDetails.filter(choice => {
    return v3Only ? choice.version !== 2 && choice.uxcore !== 2301 : true;
  }).map(choice => ({
    value: choice.value,
    short: choice.name,
    name: `${choice.name.padEnd(17)}- ${choice.description}`
  }));

  context.uxp = {
    app,
    /** @type {import('.').HeaderName} */
    // @ts-ignore - we can't use the string type constraint from prompt results
    header,
    isGoDark,
    useRtl,
    ...await prompt([
      {
        type: 'input',
        name: 'app',
        message: 'What is your app key?',
        default: app,
        when: () => !app
      },
      {
        type: 'list',
        name: 'header',
        message: 'What header do you want?',
        choices: headerChoices,
        default: header,
        when: () => !header
      },
      {
        name: 'isGoDark',
        message: 'Do you want to use the GoDark theme?',
        type: 'confirm',
        default: false,
        when: answers => [header, answers && answers.header].includes('internal-header') && !('isGoDark' in contextUxp)
      },
      {
        name: 'useRtl',
        message: 'Do you need to support RTL languages?',
        type: 'confirm',
        default: false,
        when: () => !('useRtl' in contextUxp) && hasGasketIntl !== false
      }
    ])
  };

  return context;
}
