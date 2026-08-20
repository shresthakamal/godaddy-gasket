import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prepareRichText } from '../../src/utils/rich-text.js';
import { MARKS, BLOCKS } from '@contentful/rich-text-types';

describe('transformRichText', function () {
  let mockPart, mockNodeMap, mockLogger;
  beforeEach(() => {
    mockNodeMap = {};

    mockLogger = {
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
  });

  it('text with no props', function () {
    mockPart = {
      nodeType: 'text',
      data: {},
      marks: [],
      value: 'hello world'
    };
    const results = prepareRichText(mockPart, mockNodeMap, mockLogger);
    expect(results).toEqual('hello world');
  });

  it('adds preformatted to code with newlines', function () {
    mockPart =
      ['RichText', { code: true }, ['some\nmulti\nlines']];
    mockPart = {
      data: {},
      nodeType: MARKS.CODE,
      content: ['some\nmulti\nlines']
    };

    const results = prepareRichText(mockPart, mockNodeMap, mockLogger);
    expect(results).toEqual(
      ['pre', null, [['code', null, ['some\nmulti\nlines']]]]
    );
  });

  it('does no harm to inline code', function () {
    mockPart = {
      data: {},
      nodeType: BLOCKS.PARAGRAPH,
      content: [
        'some text',
        ['RichText', { code: true }, ['some inline']]
      ]
    };

    const results = prepareRichText(mockPart, mockNodeMap, mockLogger);
    expect(results).toEqual(
      ['p', null, ['some text', ['RichText', { code: true }, ['some inline']]]]
    );
  });

  it('converts paragraph to div if preformatted children', function () {
    mockPart = {
      data: {},
      nodeType: BLOCKS.PARAGRAPH,
      content: [
        ['RichText', { preformatted: true }, ['some\nmulti\nlines']]
      ]
    };

    const results = prepareRichText(mockPart, mockNodeMap, mockLogger);
    expect(results).toEqual(
      ['div', { className: 'p' }, [['RichText', { preformatted: true }, ['some\nmulti\nlines']]]]
    );
  });

  it('deletes paragraph nodes with empty children', function () {
    mockPart = {
      data: {},
      nodeType: BLOCKS.PARAGRAPH,
      content: ['']
    };

    const results = prepareRichText(mockPart, mockNodeMap, mockLogger);
    expect(results).toBeUndefined();
  });

  it('does not harm non-paragraph nodes with empty children', function () {
    mockPart = {
      data: {},
      nodeType: 'Custom',
      content: ['']
    };

    const results = prepareRichText(mockPart, mockNodeMap, mockLogger);
    expect(results).toEqual(
      ['Custom', null, ['']]
    );
  });

  it('ensures hr does not have empty children', function () {
    mockPart = {
      data: {},
      nodeType: BLOCKS.HR,
      content: []
    };

    const results = prepareRichText(mockPart, mockNodeMap, mockLogger);
    expect(results).toEqual(['hr', null]);
  });

  it('list items do not have extra paragraph', function () {
    mockPart = {
      data: {},
      nodeType: BLOCKS.LIST_ITEM,
      content: [
        ['p', null, ['item one']]
      ]
    };

    const results = prepareRichText(mockPart, mockNodeMap, mockLogger);
    expect(results).toEqual(['li', null, ['item one']]);
  });

  it.each([
    'li',
    'p',
    'em',
    'strong'
  ])('br nodes added to a %s node in place of new-line(\\n)', function (tag: string) {
    // equivalent to [tag, null, ['some\nmulti\nlines']] without needing to parse
    mockPart = {
      data: {},
      nodeType: tag,
      value: 'some\nmulti\nlines'
    };

    const results = prepareRichText(mockPart, mockNodeMap, mockLogger);
    expect(results).toEqual([
      tag,
      null,
      [
        ['Fragment', null,
          [
            'some',
            ['br', null],
            'multi',
            ['br', null],
            'lines'
          ]
        ]
      ]
    ]);
  });

  it.each([
    [MARKS.BOLD, 'strong'],
    [MARKS.ITALIC, 'em'],
    [MARKS.UNDERLINE, 'u'],
    [MARKS.CODE, 'code'],
    [MARKS.SUPERSCRIPT, 'sup'],
    [MARKS.SUBSCRIPT, 'sub']
  ])('Takes a custom mapping for %s', function (mark: string, tag: string) {
    mockNodeMap = {
      [mark]: [tag, { className: mark }]
    };

    const mockMarkEntry = {
      data: {},
      nodeType: 'text',
      marks: [{
        type: mark
      }],
      value: 'the string affected'
    };
    const contentNode = prepareRichText(mockMarkEntry, mockNodeMap, mockLogger);
    expect(contentNode).toEqual(
      [
        tag,
        { className: mark },
        ['the string affected']
      ]
    );
  });

  it('Nested marks are mapped correctly', function () {
    mockNodeMap = {
      [MARKS.BOLD]: ['strong', { className: 'bold' }],
      [MARKS.ITALIC]: ['em', { className: 'italic' }]
    };

    const mockNestedEntry = {
      data: { id: 'data-should-be-on-outer-node' },
      nodeType: 'text',
      marks: [
        { type: MARKS.BOLD },
        { type: MARKS.ITALIC }
      ],
      value: 'the string affected'
    };

    const contentNode = prepareRichText(mockNestedEntry, mockNodeMap, mockLogger);
    expect(contentNode).toEqual(
      [
        'strong',
        { className: 'bold', id: 'data-should-be-on-outer-node' },
        [[
          'em',
          { className: 'italic' },
          ['the string affected']
        ]]
      ]
    );
  });
});
