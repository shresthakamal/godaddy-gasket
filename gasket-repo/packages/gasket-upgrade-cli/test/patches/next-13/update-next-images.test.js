const mockExec = jest.fn();

jest.mock('child_process', () => ({ exec: mockExec }));
jest.mock('util', () => ({
  ...jest.requireActual('util'),
  promisify: (fn) => fn
}));

const wrapper = require('../../../lib/patches/next-13/update-next-images');
const { makeContext } = require('../../../lib/patcher');
const patch = wrapper.wrapped;
const filePath = 'any.js';

const mockSingle = `
import Image from 'next/image'

export default function Home() {
  return (
    <div>
      <Image src={ example } layout='responsive' height='375' width='1900' alt='Example Banner'/>
    </div>
  )
}`;

const mockNonImport = `
function MyComponent() {
  return <img src='/path/to/cdn/image.png'  />
}`;

const mockCodeModReturnSingle = `Sending 1 files to free worker...
 OKK ${filePath}
All done.`;

describe('next 13 patch - update images', function () {
  let mockContext, mockSpinner;

  beforeEach(function () {
    mockContext = makeContext();
    mockContext.files.set('package.json', { name: 'app-name' });
    mockSpinner = {
      info: jest.fn()
    };
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('should replace next/image components', async function () {
    mockContext.files.set(filePath, mockSingle);
    mockExec.mockResolvedValue({ stdout: mockCodeModReturnSingle });

    await patch(mockContext, mockSpinner);

    expect(mockExec).toHaveBeenCalledWith(
      `npx @next/codemod@^13 next-image-experimental ${filePath} --force`,
      { encoding: 'utf-8' }
    );
  });

  it('does not add message if no modifications', async function () {
    mockContext.files.set(filePath, mockNonImport);

    await patch(mockContext, mockSpinner);

    const results = mockContext.messages;
    expect(results).toHaveLength(0);
  });

  it('logs info if no modifications', async function () {
    mockContext.files.set(filePath, mockNonImport);

    await patch(mockContext, mockSpinner);

    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('(avoided)')
    );
  });
});
