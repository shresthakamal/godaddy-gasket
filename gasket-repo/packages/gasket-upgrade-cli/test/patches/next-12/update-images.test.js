const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/next-12/update-images');
const patch = wrapper.wrapped;

const filePath = 'any.js';

const mockSingle = `
import someImage from '../public/some-image.png';

function MyComponent() {
  return <img src={ someImage } />
}`;

const expectedSingle = `
import Image from 'next/image';
import someImage from '../public/some-image.png';

function MyComponent() {
  return <Image src={ someImage } />
}`;

const mockMultiple = `
import someImage from '../public/some-image.png';
import otherImage from '../public/other-image.png';

function MyComponent() {
  return <>
    <img width={ '50%' } src={ someImage } />
    <img
      width={ '100%' }
      src={ otherImage }
      label='Some other image'
       />
  </>
}`;

const expectedMultiple = `
import Image from 'next/image';
import someImage from '../public/some-image.png';
import otherImage from '../public/other-image.png';

function MyComponent() {
  return <>
    <Image width={ '50%' } src={ someImage } />
    <Image
      width={ '100%' }
      src={ otherImage }
      label='Some other image'
       />
  </>
}`;

const mockNonImport = `
function MyComponent() {
  return <img src='/path/to/cdn/image.png'  />
}`;


describe('next 12 patch - update images', function () {
  let mockContext, mockSpinner;

  beforeEach(function () {
    mockContext = makeContext();
    mockContext.files.set('package.json', { name: 'app-name' });
    mockSpinner = {
      info: jest.fn()
    };
  });

  it('replaces `img` tags with `Image`', async function () {
    mockContext.files.set(filePath, mockSingle);
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get(filePath);

    expect(results).toEqual(expectedSingle);
  });

  it('replaces multiple `img` tags with attributes with `Image`', async function () {
    mockContext.files.set(filePath, mockMultiple);
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get(filePath);

    expect(results).toEqual(expectedMultiple);
  });

  it('does not modify `img` if not using a import image src', async function () {
    mockContext.files.set(filePath, mockNonImport);
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get(filePath);

    expect(results).toEqual(mockNonImport);
  });

  it('adds message with affected files', async function () {
    mockContext.files.set(filePath, mockMultiple);
    await patch(mockContext, mockSpinner);
    const results = mockContext.messages;

    expect(results).toHaveLength(1);
    expect(results[0]).toContain(filePath);
    expect(results[0]).toContain('next/image');
  });

  it('adds nextSteps when files modified', async function () {
    mockContext.files.set(filePath, mockMultiple);
    await patch(mockContext, mockSpinner);
    const results = mockContext.nextSteps;

    expect(results).toHaveLength(1);
    expect(results[0]).toContain('next/image');
    expect(results[0]).toContain('https://nextjs.org/docs/api-reference/next/image');
  });

  it('does not add message if no modifications', async function () {
    mockContext.files.set(filePath, mockNonImport);
    await patch(mockContext, mockSpinner);
    const results = mockContext.messages;

    expect(results).toHaveLength(0);
  });

  it('does not add nextSteps if no modifications', async function () {
    mockContext.files.set(filePath, mockNonImport);
    await patch(mockContext, mockSpinner);
    const results = mockContext.nextSteps;

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
