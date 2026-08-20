import { vi } from 'vitest';

const mockTypescriptPrompt = vi.fn();

vi.mock('@gasket/plugin-typescript/prompts', function () {
  return {
    default: {
      promptTypescript: vi.fn().mockImplementation(function (context, prompt) {
        if (!('typescript' in context)) {
          mockTypescriptPrompt(context, prompt);
        }
      })
    }
  };
});

const preset = await import('../lib/index.js');

describe('presetPrompt', function () {
  let presetPrompt, mockContext, mockPrompt, mockGasket;

  beforeEach(function () {
    vi.clearAllMocks();
    mockGasket = { config: {} };
    mockContext = {};
    mockPrompt = { prompt: vi.fn() };
    presetPrompt = preset.default
      ? preset.default.hooks.presetPrompt
      : preset.hooks.presetPrompt;
  });

  it('sets context.apiApp and context.codeStyle', async function () {
    await presetPrompt(mockGasket, mockContext, mockPrompt);

    expect(mockContext.apiApp).toBe(true);
    expect(mockContext.codeStyle).toBe('godaddy');
  });

  it('calls typescript prompt when typescript not in context', async function () {
    await presetPrompt(mockGasket, mockContext, mockPrompt);

    expect(mockTypescriptPrompt).toHaveBeenCalledWith(
      mockContext,
      expect.anything()
    );
  });

  it('does not call typescript prompt when typescript already set', async function () {
    mockContext.typescript = true;
    await presetPrompt(mockGasket, mockContext, mockPrompt);

    expect(mockTypescriptPrompt).not.toHaveBeenCalled();
  });
});
