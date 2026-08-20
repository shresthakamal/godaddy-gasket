const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v7/update-to-esm');
const patch = wrapper.wrapped;

const defaults = `
import Image from 'next/image'
import Document from 'next/document';
import React from 'react';
import dynamic from 'next/dynamic';
`;

const defaultsFixed = `
import ImageDefault from 'next/image.js';
const Image = ImageDefault.default || ImageDefault;
import DocumentDefault from 'next/document';
const Document = DocumentDefault.default || DocumentDefault;
import React from 'react';
import dynamic from 'next/dynamic';
`;

const cjsFile = `
const thing = require('./thing');
`;

const cjsFixed = `
const thing = require('./thing.cjs');
`;

const filePathDefaults = 'test.js';
const filePathCjs = 'cjs.js';

describe('v7 patch - update esm', function () {
  let mockContext;

  it('is decorated with spinner', async function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('updates defaults interop', async function () {
    mockContext = makeContext({
      cwd: '/path/to/app',
      pkg: {},
      git: {
        mv: jest.fn()
      }
    });
    mockContext.files.set(filePathDefaults, defaults);
    await patch(mockContext);
    const results = mockContext.files.get(filePathDefaults);
    expect(results).toEqual(defaultsFixed);
  });

  it('updates updates cjs files', async function () {
    mockContext = makeContext({
      cwd: '/path/to/app',
      pkg: {},
      git: {
        mv: jest.fn()
      }
    });
    mockContext.files.set(filePathCjs, cjsFile);
    await patch(mockContext);
    const results = mockContext.files.get('cjs.cjs');
    expect(results).toEqual(cjsFixed);
  });
});
