import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ContentNode } from '@godaddy/gasket-content-nodes';
import { hasEncoding, encodedStringHandler, transformEncodedStrings } from '../../src/transforms/encoded-strings.js';

describe('hasEncoding', function () {
  it('false for html tags', function () {
    expect(hasEncoding('<bold>text</bold>')).toBe(false);
    expect(hasEncoding('<span class="bold">text</span>')).toBe(false);
    expect(hasEncoding('some <br/> line')).toBe(false);
    expect(hasEncoding('<custom-component>hello</custom-component>')).toBe(false);
  });

  it('true for html codes', function () {
    expect(hasEncoding('hello&nbsp;world')).toBe(true);
    expect(hasEncoding('big &#36; money')).toBe(true);
  });

  it('false otherwise', function () {
    expect(hasEncoding('hello world')).toBe(false);
    expect(hasEncoding('tl;dr')).toBe(false);
    expect(hasEncoding('4<7>3')).toBe(false);
    expect(hasEncoding('4 < and 3 > 1')).toBe(false);
  });
});

describe('encodedStringHandler', function () {
  let mockStop: any;
  beforeEach(function () {
    mockStop = vi.fn();
  });

  it('returns encoded html content', function () {
    expect(encodedStringHandler('hello&nbsp;world', mockStop))
      .toEqual(['HtmlWrapper', { html: 'hello&nbsp;world' }]);
  });

  it('returns original otherwise', function () {
    expect(encodedStringHandler('hello world', mockStop))
      .toEqual('hello world');
  });
});


describe('transformEncodedStrings', function () {
  let mockGasket: any;
  let mockContext: any;

  beforeEach(() => {
    mockGasket = {};
    mockContext = {};
  });

  it('transforms html string children', function () {
    const contentNodes: ContentNode[] = [
      [
        'example',
        null,
        [
          'hello&nbsp;world'
        ]
      ]
    ];

    const result = transformEncodedStrings.handler(mockGasket, contentNodes, mockContext);

    expect(result).toEqual([
      [
        'example',
        null,
        [
          ['HtmlWrapper', { html: 'hello&nbsp;world' }]
        ]
      ]
    ]);
  });

  it('transforms html strings values', function () {
    const contentNodes: ContentNode[] = [['example', {
      a: 'hello&nbsp;world'
    }]];

    const result = transformEncodedStrings.handler(mockGasket, contentNodes, mockContext);

    expect(result).toEqual([
      [
        'example',
        {
          a: ['HtmlWrapper', { html: 'hello&nbsp;world' }]
        }
      ]
    ]);
  });

  it('transforms html strings values in arrays', function () {
    const contentNodes: ContentNode[] = [
      [
        'example',
        {
          a: ['hello&nbsp;world', 'hello world']
        }
      ]
    ];

    const result = transformEncodedStrings.handler(mockGasket, contentNodes, mockContext);

    expect(result).toEqual([
      [
        'example',
        {
          a: [
            ['HtmlWrapper', { html: 'hello&nbsp;world' }],
            'hello world'
          ]
        }
      ]
    ]);
  });

  it('transforms html string in children of children', function () {
    const contentNodes: ContentNode[] = [
      [
        'example',
        null,
        [
          ['deep', null, ['hello&nbsp;world']]
        ]
      ]
    ];

    const result = transformEncodedStrings.handler(mockGasket, contentNodes, mockContext);

    expect(result).toEqual([
      [
        'example',
        null,
        [
          [
            'deep',
            null,
            [
              ['HtmlWrapper', { html: 'hello&nbsp;world' }]
            ]
          ]
        ]
      ]
    ]);
  });
});
