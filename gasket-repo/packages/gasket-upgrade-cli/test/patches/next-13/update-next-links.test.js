const mockExec = jest.fn();

jest.mock('child_process', () => ({ exec: mockExec }));
jest.mock('util', () => ({
  ...jest.requireActual('util'),
  promisify: (fn) => fn
}));

const wrapper = require('../../../lib/patches/next-13/update-next-links');
const { makeContext } = require('../../../lib/patcher');
const patch = wrapper.wrapped;
const filePath = 'any.js';

const mockSingle = `
import Image from 'next/link'

export default function Home() {
  return (
    <div>
      <Link href="/about">
        <a onClick={() => console.log('clicked')}>About</a>
      </Link>
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

describe('next 13 patch - update link components', function () {
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

  it('should fix up next/link components', async function () {
    mockContext.files.set(filePath, mockSingle);
    mockExec.mockRejectedValueOnce({ stdout: mockCodeModReturnSingle });

    await patch(mockContext, mockSpinner);

    expect(mockExec).toHaveBeenCalledWith(
      `npx @next/codemod@^13 new-link ${filePath} --force`,
      { encoding: 'utf-8' }
    );
  });

  it('adds messages for modified files', async function () {
    mockContext.files.set(filePath, mockSingle);
    mockExec.mockResolvedValueOnce({ stdout: mockCodeModReturnSingle });

    await patch(mockContext, mockSpinner);

    const results = mockContext.messages;
    expect(results).toHaveLength(1);
    expect(results[0]).toContain('updated to use the latest version');
  });

  it('should not add a message if no modifications', async function () {
    mockContext.files.set(filePath, mockNonImport);
    await patch(mockContext, mockSpinner);

    const results = mockContext.messages;
    expect(results).toHaveLength(0);
  });

  it('should log info if no modifications', async function () {
    mockContext.files.set(filePath, mockNonImport);
    await patch(mockContext, mockSpinner);

    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('(avoided)')
    );
  });
});
