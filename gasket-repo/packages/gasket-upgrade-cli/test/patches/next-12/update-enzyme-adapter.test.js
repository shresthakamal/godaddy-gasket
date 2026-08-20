const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/next-12/update-enzyme-adapter');
const patch = wrapper.wrapped;

const mockSetup = `
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
`;

describe('next 12 patch - update enzyme adapter', function () {
  let mockContext, mockPackage, mockSpinner;

  beforeEach(function () {
    mockContext = makeContext();
    mockPackage = {
      dependencies: {}
    };
    mockSpinner = {
      info: jest.fn()
    };

    mockContext.files.set('package.json', mockPackage);
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('replaces adapter package dependency', async function () {
    mockPackage.devDependencies = {
      'enzyme-adapter-react-16': '^1.10.0'
    };
    await patch(mockContext, mockSpinner);

    expect(mockPackage.devDependencies).not.toHaveProperty('enzyme-adapter-react-16');
    expect(mockPackage.devDependencies).toHaveProperty('@wojtekmaj/enzyme-adapter-react-17', '^0.6.6');

    expect(mockSpinner.info).not.toHaveBeenCalled();
  });

  it('replaces adapter in js files', async function () {
    mockPackage.devDependencies = {
      'enzyme-adapter-react-16': '^1.10.0'
    };

    mockContext.files.set('jest.setup.js', mockSetup);

    await patch(mockContext, mockSpinner);

    expect(mockContext.files.get('jest.setup.js')).not.toContain('enzyme-adapter-react-16');
    expect(mockContext.files.get('jest.setup.js')).toContain('@wojtekmaj/enzyme-adapter-react-17');
  });

  it('ignores if no enzyme adapter', async function () {
    mockPackage.devDependencies = {};
    await patch(mockContext, mockSpinner);

    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('(skipped)')
    );
  });
});
