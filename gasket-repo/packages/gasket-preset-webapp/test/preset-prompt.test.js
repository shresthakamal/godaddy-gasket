import { vi } from 'vitest';

const mockAppRouterPrompt = vi.fn();
const mockNextServerTypePrompt = vi.fn();
const mockNextDevProxyPrompt = vi.fn();
const mockTypescriptPrompt = vi.fn();

vi.mock('@gasket/plugin-nextjs/prompts', function () {
  return {
    promptAppRouter: vi.fn().mockImplementation(function (context, prompt) {
      mockAppRouterPrompt(context, prompt);
    }),
    promptNextServerType: vi
      .fn()
      .mockImplementation(function (context, prompt) {
        mockNextServerTypePrompt(context, prompt);
      }),
    promptNextDevProxy: vi
      .fn()
      .mockImplementation(function (context, prompt) {
        mockNextDevProxyPrompt(context, prompt);
      })
  };
});

vi.mock('@gasket/plugin-typescript/prompts', function () {
  return {
    default: {
      promptTypescript: vi.fn().mockImplementation(function (context, prompt) {
        // Only call the mock if typescript is not already set
        if (!('typescript' in context)) {
          mockTypescriptPrompt(context, prompt);
        }
      })
    }
  };
});

const preset = await import('../lib/index.js');

describe('presetPrompt', function () {
  let presetPrompt, mockContext, mockPrompt, mockAnswers;

  beforeEach(function () {
    vi.clearAllMocks();
    mockContext = {};
    mockAnswers = { typescript: false };
    mockPrompt = {
      prompt: vi.fn().mockImplementation(function () {
        return mockAnswers;
      })
    };
    presetPrompt = preset.default
      ? preset.default.hooks.presetPrompt
      : preset.hooks.presetPrompt;
  });

  it('set context.addStylelint to true', async function () {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockContext.addStylelint).toBe(true);
  });

  it('set context.codeStyle to "godaddy"', async function () {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockContext.codeStyle).toBe('godaddy');
  });

  it('does not prompt if context.typescript exists', async function () {
    vi.clearAllMocks();
    mockContext.typescript = true;
    await presetPrompt({}, mockContext, mockPrompt);
    // Test that the preset runs without error when typescript is pre-set
    expect(mockContext.addStylelint).toBe(true);
  });

  it('prompts for typescript', async function () {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockTypescriptPrompt).toHaveBeenCalled();
  });

  it('prompts for next server type', async function () {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockNextServerTypePrompt).toHaveBeenCalled();
  });

  it('sets nextDevProxy to true when nextServerType is not customServer', async function () {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockContext.nextDevProxy).toBe(true);
  });

  it('sets nextDevProxy to false when nextServerType is customServer', async function () {
    mockContext.nextServerType = 'customServer';
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockContext.nextDevProxy).toBe(false);
  });

  it('runs without errors', async function () {
    await expect(
      presetPrompt({}, mockContext, mockPrompt)
    ).resolves.not.toThrow();
    expect(mockContext.addStylelint).toBe(true);
  });
});
