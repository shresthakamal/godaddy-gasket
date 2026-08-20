/* eslint-disable no-undefined */
import { describe, it, expect, beforeEach } from 'vitest';
import { transformCollapseChildStrings } from '../../src/transforms/collapse-child-strings.js';
import { ContentNode } from '@godaddy/gasket-content-nodes';

describe('transformCombineChildText', function () {
  let mockGasket: any;
  let mockContext: any;
  let mockContentNodes: ContentNode[];

  beforeEach(function () {
    mockGasket = {};
    mockContext = {};
    mockContentNodes = [['Page', null]];
  });

  it('collapses multiple string-only children to single', function () {
    mockContentNodes = [['h1', null, ['hello <strong>', 'example', '</strong>!!!']]];
    const results = transformCollapseChildStrings.handler(mockGasket, mockContentNodes, mockContext);
    expect(results).toEqual(expect.arrayContaining(
      [['h1', null, ['hello <strong>example</strong>!!!']]]
    ));
  });

  it('does not collapse mixed children', function () {
    mockContentNodes = [['h1', null, ['hello', ['div', null, ['world']]]]];
    const results = transformCollapseChildStrings.handler(mockGasket, mockContentNodes, mockContext);
    expect(results).toEqual(expect.arrayContaining(
      [['h1', null, ['hello', ['div', null, ['world']]]]]
    ));
  });

  it('does no harm to single child', function () {
    mockContentNodes = [['h1', null, ['hello']]];
    const results = transformCollapseChildStrings.handler(mockGasket, mockContentNodes, mockContext);
    expect(results).toEqual(expect.arrayContaining(
      [['h1', null, ['hello']]]
    ));
  });

  it('does no harm to string array props', function () {
    mockContentNodes = [['h1', { items: ['one', 'two'] }, ['hello']]];
    const results = transformCollapseChildStrings.handler(mockGasket, mockContentNodes, mockContext);
    expect(results).toEqual(expect.arrayContaining(
      [['h1', { items: ['one', 'two'] }, ['hello']]]
    ));
  });

  it('collapses fragments with single childString', function () {
    mockContentNodes = [['h1', null, [['Fragment', null, ['hello world']]]]];
    const results = transformCollapseChildStrings.handler(mockGasket, mockContentNodes, mockContext);
    expect(results).toEqual(expect.arrayContaining(
      [['h1', null, ['hello world']]]
    ));
  });

  it('does no harm to fragments with multiple children', function () {
    mockContentNodes = [['h1', null, [['Fragment', null, ['hello', ['div', null, ['world']]]]]]];
    const results = transformCollapseChildStrings.handler(mockGasket, mockContentNodes, mockContext);
    expect(results).toEqual(expect.arrayContaining(
      [['h1', null, [['Fragment', null, ['hello', ['div', null, ['world']]]]]]]
    ));
  });

  it('prunes undefined children', function () {
    // @ts-ignore
    mockContentNodes = ['h1', null, ['hello ', undefined, 'world']];
    const results = transformCollapseChildStrings.handler(mockGasket, mockContentNodes, mockContext);
    expect(results).toEqual(['h1', null, ['hello world']]);
  });
});
