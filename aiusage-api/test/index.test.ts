import { defaultHandler, usageHandler } from '../plugins/routes-plugin.ts';
import { vi, describe, expect, beforeEach, it } from 'vitest';

describe('Routes', () => {
  let mockRequest, mockResponse;
  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  it('defaultHandler should use expected message', async () => {
    await defaultHandler(mockRequest, mockResponse);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Welcome to your default route...'
    });
  });

  it('usageHandler should return usage summary', async () => {
    await usageHandler(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      totalTokens: 128_450,
      period: '2026-08'
    });
  });
});
