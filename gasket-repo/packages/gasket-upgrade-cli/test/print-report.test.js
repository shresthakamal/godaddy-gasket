const printReport = require('../lib/print-report');

describe('printReport', () => {
  let logStub;

  beforeEach(function () {
    logStub = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('logs success message', async () => {
    printReport();
    expect(logStub).toHaveBeenCalledWith(
      expect.stringContaining('✨Success!')
    );
  });

  it('prints report with messages', async () => {
    const messages = ['bogus', 'fake'];
    printReport({ messages });
    expect(logStub).toHaveBeenCalledWith(
      expect.stringContaining('- bogus')
    );
    expect(logStub).toHaveBeenCalledWith(
      expect.stringContaining('- fake')
    );
  });

  it('prints report with next steps', async () => {
    const messages = ['bogus', 'fake'];
    const nextSteps = ['step one', 'step two'];
    printReport({ messages, nextSteps });
    expect(logStub).toHaveBeenCalledWith(
      expect.stringContaining('- step one')
    );
    expect(logStub).toHaveBeenCalledWith(
      expect.stringContaining('- step two')
    );
  });
});
