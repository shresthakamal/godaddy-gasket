import { vi } from 'vitest';

const mockTypescriptPrompt = vi.fn();
const mockSwaggerPrompt = vi.fn();

vi.mock('@gasket/plugin-typescript/prompts', () => ({
  default: {
    promptTypescript: vi.fn().mockImplementation((context, prompt) => {
      // Only call the mock if typescript is not already set
      if (!('typescript' in context)) {
        mockTypescriptPrompt(context, prompt);
      }
    })
  }
}));

vi.mock('@gasket/plugin-swagger/prompts', () => ({
  default: {
    promptSwagger: vi.fn().mockImplementation((context, prompt) => {
      // Only call the mock if useSwagger is not already set
      if (!('useSwagger' in context)) {
        mockSwaggerPrompt(context, prompt);
      }
    })
  }
}));

const preset = await import('../lib/index.js');

describe('presetPrompt', () => {
  let presetPrompt, mockContext, mockPrompt, mockAnswers;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {};
    mockAnswers = { typescript: false };
    mockPrompt = { prompt: vi.fn().mockImplementation(() => mockAnswers) };
    presetPrompt = preset.default ? preset.default.hooks.presetPrompt : preset.hooks.presetPrompt;
  });

  it('is an async function', () => {
    expect(typeof presetPrompt).toBe('function');
    expect(presetPrompt.constructor.name).toBe('AsyncFunction');
  });

  it('set context.apiApp to true', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockContext.apiApp).toBe(true);
  });

  it('set context.codeStyle to true', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockContext.codeStyle).toBe('godaddy');
  });

  it('does not prompt if context.typescript exists', async () => {
    mockContext.typescript = true;
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockTypescriptPrompt).not.toHaveBeenCalled();
  });

  it('does not prompt if context.useSwagger exists', async () => {
    mockContext.useSwagger = true;
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockSwaggerPrompt).not.toHaveBeenCalled();
  });

  it('prompts for swagger', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockSwaggerPrompt).toHaveBeenCalledWith(mockContext, mockPrompt.prompt);
  });

  it('prompts for typescript', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockTypescriptPrompt).toHaveBeenCalledWith(mockContext, mockPrompt.prompt);
  });

  it('runs without errors', async () => {
    await expect(presetPrompt({}, mockContext, mockPrompt)).resolves.not.toThrow();
    expect(mockContext.apiApp).toBe(true);
  });
});
