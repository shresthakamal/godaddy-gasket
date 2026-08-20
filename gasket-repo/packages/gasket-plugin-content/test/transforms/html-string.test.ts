import { vi, describe, it, expect, beforeEach } from 'vitest';
import { htmlStringHandler, transformHtmlStrings, hasTags } from '../../src/transforms/html-strings.js';
import { reactFragment } from '../../src/transforms/string-content-node.js';
import { ContentNode } from '@godaddy/gasket-content-nodes';

describe('hasTags', function () {
  it('true for html tags', function () {
    expect(hasTags('<bold>text</bold>')).toBe(true);
    expect(hasTags('<span class="bold">text</span>')).toBe(true);
    expect(hasTags('some <br/> line')).toBe(true);
    expect(hasTags('<custom-component>hello</custom-component>')).toBe(true);
  });

  it('false for html codes', function () {
    expect(hasTags('hello&nbsp;world')).toBe(false);
    expect(hasTags('big &#36; money')).toBe(false);
  });

  it('false otherwise', function () {
    expect(hasTags('hello world')).toBe(false);
    expect(hasTags('tl;dr')).toBe(false);
    expect(hasTags('4<7>3')).toBe(false);
    expect(hasTags('4 < and 3 > 1')).toBe(false);
  });
});

describe('htmlStringHandler', function () {
  let mockStop: any;
  beforeEach(function () {
    mockStop = vi.fn();
  });

  it('returns html content', function () {
    expect(htmlStringHandler('<bold>text</bold>', mockStop))
      .toEqual([reactFragment, null, [['bold', null, ['text']]]]);
  });

  it('returns original otherwise', function () {
    expect(htmlStringHandler('hello world', mockStop))
      .toEqual('hello world');
  });
});

describe('transformHtmlStrings', function () {
  let mockGasket: any;
  let mockContext: any;

  beforeEach(() => {
    mockGasket = {};
    mockContext = {};
  });

  it('transforms html string children', function () {
    const contentNodes: ContentNode[] = [['example', null, [
      'hello&nbsp;world',
      '<bold>text</bold>'
    ]]];
    const result = transformHtmlStrings.handler(mockGasket, contentNodes, mockContext);
    expect(result).toEqual([['example', null, [
      'hello&nbsp;world',
      [
        reactFragment, null, [['bold', null, ['text']]]
      ]
    ]]]);
  });

  it('transforms nested html string children', function () {
    const contentNodes: ContentNode[] = [
      [
        'example',
        null,
        [
          'hello&nbsp;world',
          [
            'very',
            null,
            [
              [
                'very',
                null,
                [
                  [
                    'deep',
                    null,
                    [
                      '<bold>text</bold>'
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ]
    ];

    const result = transformHtmlStrings.handler(mockGasket, contentNodes, mockContext);

    expect(result).toEqual([
      [
        'example',
        null,
        [
          'hello&nbsp;world',
          [
            'very',
            null,
            [
              [
                'very',
                null,
                [
                  [
                    'deep',
                    null,
                    [
                      [
                        reactFragment, null, [['bold', null, ['text']]]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ]
    ]);
  });

  it('transforms html strings values', function () {
    const contentNodes: ContentNode[] = [
      [
        'example',
        {
          a: 'hello&nbsp;world',
          b: '<bold>text</bold>'
        }
      ]
    ];

    const result = transformHtmlStrings.handler(mockGasket, contentNodes, mockContext);

    expect(result).toEqual([
      [
        'example',
        {
          a: 'hello&nbsp;world',
          b: [
            reactFragment,
            null,
            [
              ['bold', null, ['text']]
            ]
          ]
        }
      ]
    ]);
  });

  it('transforms nested html strings values', function () {
    const contentNodes: ContentNode[] = [
      [
        'example',
        {
          top: { a: 'hello&nbsp;world' },
          very: {
            very: {
              deep: {
                b: '<bold>text</bold>'
              }
            }
          }
        }
      ]
    ];

    const result = transformHtmlStrings.handler(mockGasket, contentNodes, mockContext);

    expect(result).toEqual([
      [
        'example',
        {
          top: { a: 'hello&nbsp;world' },
          very: {
            very: {
              deep: {
                b: [
                  reactFragment,
                  null,
                  [
                    ['bold', null, ['text']]
                  ]
                ]
              }
            }
          }
        }
      ]
    ]);
  });

  it('transforms html strings values in arrays', function () {
    const contentNodes: ContentNode[] = [
      [
        'example',
        {
          a: [
            'hello&nbsp;world',
            'hello world'
          ],
          deep: {
            b: [
              '<bold>text</bold>',
              'text',
              'some <br/> line'
            ]
          }
        }
      ]
    ];

    const result = transformHtmlStrings.handler(mockGasket, contentNodes, mockContext);

    expect(result).toEqual([
      [
        'example',
        {
          a: [
            'hello&nbsp;world',
            'hello world'
          ],
          deep: {
            b: [
              [reactFragment, null, [['bold', null, ['text']]]],
              'text',
              [reactFragment, null, ['some ', ['br', null], ' line']]
            ]
          }
        }
      ]
    ]);
  });

  it('transforms html string in props and children of children', function () {
    const contentNodes: ContentNode[] = [
      [
        'example',
        null,
        [
          [
            'deep',
            { a: '<bold>text</bold>' },
            ['hello&nbsp;world']
          ]
        ]
      ]
    ];

    const result = transformHtmlStrings.handler(mockGasket, contentNodes, mockContext);

    expect(result).toEqual([
      [
        'example',
        null,
        [
          [
            'deep',
            {
              a: [
                reactFragment,
                null,
                [
                  ['bold', null, ['text']]
                ]
              ]
            },
            ['hello&nbsp;world']
          ]
        ]
      ]
    ]);
  });
});
