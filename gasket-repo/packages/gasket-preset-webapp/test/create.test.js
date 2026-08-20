import { vi } from 'vitest';
import create from '../lib/create.js';

describe('create', function () {
  let mockContext;

  beforeEach(function () {
    mockContext = {
      files: {
        add: vi.fn()
      }
    };
  });

  it('adds markdown partial', async function () {
    await create({}, mockContext);
    expect(mockContext.files.add).toHaveBeenCalledWith(
      expect.stringMatching(/generator\/\*$/)
    );
  });
});
