const mockConstructor = jest.fn();
const mockLoad = jest.fn();
const mockApply = jest.fn();
const mockSave = jest.fn();
const mockInstall = jest.fn();
const mockReport = jest.fn();
const mockWarn = jest.fn();
const mockWithSpinner = jest.fn().mockImplementation((label, fn) => {
  return (ctx) => fn(ctx, { warn: mockWarn });
});

jest.spyOn(console, 'log').mockImplementation(() => {});

jest.mock('../lib/patcher', () => {
  const Patcher = jest.requireActual('../lib/patcher');
  return class MockPatcher extends Patcher {
    constructor() {
      super(...arguments);
      mockConstructor(...arguments);
    }

    load() {
      mockLoad(...arguments);
    }

    apply() {
      mockApply(...arguments);
    }

    save() {
      mockSave(...arguments);
    }
  };
});

jest.mock('../lib/install', () => {
  return mockInstall;
});

jest.mock('../lib/print-report', () => {
  return mockReport;
});

jest.mock('../lib/with-spinner', () => {
  return mockWithSpinner;
});


function getOpts(opts) {
  return {
    install: true,
    next12: false,
    next13: false,
    v3: false,
    v5: false,
    v6: false,
    v7: false,
    ...opts
  };
}

const mockOpts = jest.fn();

jest.mock('commander', () => {
  const BaseCommand = jest.requireActual('commander').Command;
  return {
    Command: class MockCommand extends BaseCommand {
      constructor() {
        super();
      }
      opts() {
        return mockOpts();
      }
      parse() {
        // ignore
      }
    }
  };
});

describe('Command', function () {
  let run;

  beforeEach(() => {
    run = require('../lib/index');

    mockOpts.mockReturnValue(getOpts({  }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('instantiates patcher', async () => {
    await run();
    expect(mockConstructor).toHaveBeenCalled();
  });

  it('loads files', async () => {
    await run();
    expect(mockLoad).toHaveBeenCalled();
  });

  it('applies v6 patches', async () => {
    mockOpts.mockReturnValue(getOpts({ v6: true }));
    await run();
    expect(mockApply).toHaveBeenCalledWith([
      require('../lib/patches/v6/update-dependencies'),
      require('../lib/patches/v6/update-imports'),
      require('../lib/patches/v6/rename-static-dir'),
      require('../lib/patches/v6/move-locales-to-public'),
      require('../lib/patches/v6/ignore-locales-artifacts'),
      require('../lib/patches/v6/update-golf-manifest'),
      require('../lib/patches/v6/configure-intl-plugin'),
      require('../lib/patches/v6/update-eslint-locales-config'),
      require('../lib/patches/v6/update-locale-paths'),
      require('../lib/patches/v6/cleanup-redux-reducers'),
      require('../lib/patches/v6/update-redux-store'),
      require('../lib/patches/v6/update-css-modules'),
      require('../lib/patches/v6/add-custom-error-page')
    ]);
  });

  it('applies v7 patches', async () => {
    mockOpts.mockReturnValue(getOpts({ v7: true }));
    await run();
    expect(mockApply).toHaveBeenCalledWith([
      require('../lib/patches/v7/configure-response-data-plugin'),
      require('../lib/patches/v7/rename-deprecated-functions'),
      require('../lib/patches/v7/update-elastic-apm-setup'),
      require('../lib/patches/v7/update-nextjs-document-file'),
      require('../lib/patches/v7/update-nextjs-app-file'),
      require('../lib/patches/v7/update-logger'),
      require('../lib/patches/v7/update-dependencies'),
      require('../lib/patches/v7/update-imports'),
      require('../lib/patches/v7/rename-locale-required'),
      require('../lib/patches/v7/update-presets'),
      require('../lib/patches/v7/update-gasket-file'),
      require('../lib/patches/v7/add-server-file'),
      require('../lib/patches/v7/update-package-scripts'),
      require('../lib/patches/v7/update-to-esm'),
      require('../lib/patches/v7/add-next-config'),
      require('../lib/patches/v7/fixup-package-scripts')
    ]);
  });

  it('applies common patches', async () => {
    await run();
    expect(mockApply).toHaveBeenCalledWith([
      require('../lib/patches/common/sort-package')
    ]);
  });

  it('executes install', async () => {
    await run();
    expect(mockInstall).toHaveBeenCalled();
  });

  it('prints report', async () => {
    await run();
    expect(mockReport).toHaveBeenCalled();
  });

  it('runs eslint fix', async () => {
    await run();
    expect(mockWithSpinner).toHaveBeenLastCalledWith('Run ESLint with --fix', expect.any(Function));
  });
});
