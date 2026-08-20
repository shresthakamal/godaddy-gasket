import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
const mockPromptStub = vi.fn();

import prompt from '../lib/prompt.js';

describe('prompt', function () {
  let mockContext, mockUtils;

  beforeEach(() => {
    mockContext = {
      appName: 'bogus-app'
    };
    mockUtils = {
      prompt: mockPromptStub
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('runs on the create lifecycle event', function () {
    expect(typeof prompt).toBe('function');
  });

  it('prompts for app key', async function () {
    await prompt({}, mockContext, mockUtils);
    expect(mockPromptStub.mock.calls[0][0][0]).toHaveProperty('name', 'app');
  });

  it('uses appName as default for app key prompt', async function () {
    await prompt({}, mockContext, mockUtils);
    expect(mockPromptStub.mock.calls[0][0][0]).toHaveProperty('default', 'bogus-app');
  });

  it('does not prompt when the context is already filled in', async function () {
    await prompt({}, {
      appName: 'wakey hollow',
      header: 'internal-header',
      uxp: {
        isGoDark: false,
        useRtl: false
      },
      plugins: []
    }, mockUtils);
    const keyQuestion = mockPromptStub.mock.calls[0][0][0].when;
    const headerQuestion = mockPromptStub.mock.calls[0][0][1].when;
    const isGoDarkQuestion = mockPromptStub.mock.calls[0][0][2].when;
    const useRtlQuestion = mockPromptStub.mock.calls[0][0][3].when;

    expect(keyQuestion()).toBeFalsy();
    expect(headerQuestion()).toBeFalsy();
    expect(isGoDarkQuestion()).toBeFalsy();
    expect(useRtlQuestion()).toBeFalsy();
  });

  it('does not prompt for RTL when no Gasket Intl', async function () {
    await prompt({}, {
      hasGasketIntl: false,
      plugins: []
    }, mockUtils);
    const useRtlQuestion = mockPromptStub.mock.calls[0][0][3].when;

    expect(useRtlQuestion()).toBeFalsy();
  });

  it('returns the expected result.uxp when context is filled in', async function () {
    const { uxp } = await prompt({}, {
      appName: 'wakey hollow',
      header: 'internal-header',
      uxp: {
        isGoDark: false,
        useRtl: false
      },
      plugins: [],
      additionalKey: 'additional-value'
    }, mockUtils);

    expect(uxp).toEqual({
      app: 'wakey hollow',
      header: 'internal-header',
      isGoDark: false,
      useRtl: false
    });
  });

  it('returns the expected result.uxp when uxp values overrides context values', async function () {
    const { uxp } = await prompt({}, {
      appName: 'wakey hollow',
      header: 'application-header',
      uxp: {
        app: 'unique-uxp-app-name',
        header: 'internal-header',
        isGoDark: false,
        useRtl: false
      },
      plugins: [],
      additionalKey: 'additional-value'
    }, mockUtils);

    expect(uxp).toEqual({
      app: 'unique-uxp-app-name',
      header: 'internal-header',
      isGoDark: false,
      useRtl: false
    });
  });

  it('prompts for header', async function () {
    await prompt({}, mockContext, mockUtils);
    const headerQuestion = mockPromptStub.mock.calls[0][0][1];
    expect(headerQuestion).toHaveProperty('name', 'header');

    // a version 3 choice
    expect(headerQuestion).toHaveProperty('choices', expect.arrayContaining([
      expect.objectContaining({ value: 'internal-header' })
    ]));

    // a version 2 choice
    expect(headerQuestion).toHaveProperty('choices', expect.arrayContaining([
      expect.objectContaining({ value: 'sales-header' })
    ]));
  });

  it('only prompts for v3 header for App Router', async function () {
    mockContext.nextServerType = 'appRouter';
    await prompt({}, mockContext, mockUtils);
    const headerQuestion = mockPromptStub.mock.calls[0][0][1];

    // a version 3 choice
    expect(headerQuestion).toHaveProperty('choices', expect.arrayContaining([
      expect.objectContaining({ value: 'internal-header' })
    ]));

    // NOT a version 2 choice
    expect(headerQuestion).not.toHaveProperty('choices', expect.arrayContaining([
      expect.objectContaining({ value: 'sales-header' })
    ]));
  });

  it('prompts for GoDark for internal header', async function () {
    await prompt({}, mockContext, mockUtils);
    const question = mockPromptStub.mock.calls[0][0][2];
    expect(question).toHaveProperty('name', 'isGoDark');
    expect(question).toHaveProperty('default', false);
    expect(question.when({ header: 'none' })).toEqual(false);
    expect(question.when({ header: 'internal-header' })).toEqual(true);
  });

  it('prompts for using RTL CSS', async function () {
    await prompt({}, mockContext, mockUtils);
    const question = mockPromptStub.mock.calls[0][0][3];
    expect(question).toHaveProperty('name', 'useRtl');
    expect(question).toHaveProperty('default', false);
  });
});
