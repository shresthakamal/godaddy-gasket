/* eslint-disable no-undefined */
import { describe, it, expect } from 'vitest';
import { toFlattenedContent } from '../src/to-flattened-content.js';
import { ContentNode } from '@godaddy/gasket-content-nodes';

describe('toFlattenedContent', function () {
  describe('basic flattening', function () {
    it('flattens simple ContentNode tuple to object', function () {
      const mockContentNodes: ContentNode[] = [['Component', { title: 'Hello', count: 5 }]];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([{ title: 'Hello', count: 5 }]);
    });

    it('flattens array of Product tuples like real-world example', function () {
      const mockContentNodes: ContentNode[] = [
        ['Product', { entryId: '4CkuSpcuHggOlZAbG5sE6Y', name: 'Productivity - Microsoft 365 Email Essentials' }],
        ['Product', { entryId: 'wNXWXJdK0fw6FaPPP9ozV', name: 'Productivity - Microsoft 365 Email Plus' }]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        { entryId: '4CkuSpcuHggOlZAbG5sE6Y', name: 'Productivity - Microsoft 365 Email Essentials' },
        { entryId: 'wNXWXJdK0fw6FaPPP9ozV', name: 'Productivity - Microsoft 365 Email Plus' }
      ]);
    });

    it('handles arrays of ContentNodes', function () {
      const mockContentNodes: ContentNode[] = [
        ['Item1', { id: 1 }],
        ['Item2', { id: 2 }],
        ['Item3', { id: 3 }]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ]);
    });

    it('preserves primitive values', function () {
      const mockContentNodes: ContentNode[] = [
        ['Component', { text: 'hello', number: 42, bool: true }]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([{ text: 'hello', number: 42, bool: true }]);
    });

    it('handles ContentNodes with null props', function () {
      const mockContentNodes: ContentNode[] = [['Component', null]];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([{}]);
    });
  });

  describe('edge cases', function () {
    it('handles null contentNodes', function () {
      const results = toFlattenedContent(null);
      expect(results).toBeNull();
    });

    it('handles undefined contentNodes', function () {
      const results = toFlattenedContent(undefined);
      expect(results).toBeUndefined();
    });

    it('handles empty arrays', function () {
      const results = toFlattenedContent([]);
      expect(results).toEqual([]);
    });

    it('handles ContentNodes with empty children arrays', function () {
      const mockContentNodes: ContentNode[] = [
        ['Component', { name: 'Test' }, []]
      ];
      const results = toFlattenedContent(mockContentNodes);
      // 3-element tuples are flattened with children included
      expect(results).toEqual([{ name: 'Test', children: [] }]);
    });

    it('handles ContentNodes with undefined children', function () {
      const mockContentNodes: ContentNode[] = [
        ['Component', { name: 'Test' }, undefined]
      ];
      const results = toFlattenedContent(mockContentNodes);
      // 3-element tuples with undefined children are flattened (children not included)
      expect(results).toEqual([{ name: 'Test' }]);
    });
  });

  describe('nested structures', function () {
    it('handles nested ContentNode structures', function () {
      const mockContentNodes: ContentNode[] = [
        [
          'Parent',
          { name: 'Parent' },
          [
            ['Child', { name: 'Child' }]
          ]
        ]
      ];
      const results = toFlattenedContent(mockContentNodes);
      // All tuples are flattened - 3-element tuples become objects with children property
      expect(results).toEqual([
        {
          name: 'Parent',
          children: [{ name: 'Child' }]
        }
      ]);
    });

    it('handles deeply nested structures', function () {
      const mockContentNodes: ContentNode[] = [
        [
          'Level1',
          { level: 1 },
          [
            [
              'Level2',
              { level: 2 },
              [
                [
                  'Level3',
                  { level: 3 }
                ]
              ]
            ]
          ]
        ]
      ];
      const results = toFlattenedContent(mockContentNodes);
      // All tuples are flattened recursively
      expect(results).toEqual([
        {
          level: 1,
          children: [
            {
              level: 2,
              children: [{ level: 3 }]
            }
          ]
        }
      ]);
    });

    it('handles multiple levels of nesting with mixed 2 and 3-element tuples', function () {
      const mockContentNodes: ContentNode[] = [
        [
          'Container',
          { id: 'container' },
          [
            ['Item', { id: 'item1' }],
            [
              'NestedContainer',
              { id: 'nested' },
              [
                ['NestedItem', { id: 'nested-item' }]
              ]
            ]
          ]
        ]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        {
          id: 'container',
          children: [
            { id: 'item1' },
            {
              id: 'nested',
              children: [{ id: 'nested-item' }]
            }
          ]
        }
      ]);
    });
  });

  describe('children handling', function () {
    it('handles ContentNodes with children arrays', function () {
      const mockContentNodes: ContentNode[] = [
        [
          'Container',
          { className: 'container' },
          [
            ['Item', { id: 1 }, ['Text 1']],
            ['Item', { id: 2 }, ['Text 2']]
          ]
        ]
      ];
      const results = toFlattenedContent(mockContentNodes);
      // All tuples are flattened - 3-element tuples become objects with children
      expect(results).toEqual([
        {
          className: 'container',
          children: [
            {
              id: 1,
              children: ['Text 1']
            },
            {
              id: 2,
              children: ['Text 2']
            }
          ]
        }
      ]);
    });

    it('handles ContentNodes with string children in array', function () {
      const mockContentNodes: ContentNode[] = [
        ['Component', { id: 1 }, ['text child']]
      ];
      const results = toFlattenedContent(mockContentNodes);
      // 3-element tuples are flattened with children array
      expect(results).toEqual([
        {
          id: 1,
          children: ['text child']
        }
      ]);
    });

    it('handles ContentNodes with multiple string children', function () {
      const mockContentNodes: ContentNode[] = [
        ['Component', { id: 1 }, ['text1', 'text2', 'text3']]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        {
          id: 1,
          children: ['text1', 'text2', 'text3']
        }
      ]);
    });

    it('handles ContentNodes with children containing mixed types', function () {
      const mockContentNodes: ContentNode[] = [
        [
          'Container',
          { id: 1 },
          [
            ['Child1', { id: 2 }],
            'string',
            ['Child2', { id: 3 }]
          ]
        ]
      ];
      const results = toFlattenedContent(mockContentNodes);
      // All tuples are flattened recursively
      expect(results).toEqual([
        {
          id: 1,
          children: [
            { id: 2 },
            'string',
            { id: 3 }
          ]
        }
      ]);
    });

    it('handles ContentNodes based on README examples', function () {
      // Example from README: ['button', { className: 'btn' }, [['span', { className: 'btn-text' }, ['Submit']]]]
      const mockContentNodes: ContentNode[] = [
        [
          'button',
          { className: 'btn' },
          [
            ['span', { className: 'btn-text' }, ['Submit']]
          ]
        ]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        {
          className: 'btn',
          children: [
            {
              className: 'btn-text',
              children: ['Submit']
            }
          ]
        }
      ]);
    });
  });

  describe('real-world scenarios', function () {
    it('handles Product list like notifications/renewals use case', function () {
      const mockContentNodes: ContentNode[] = [
        ['Product', { entryId: 'prod1', name: 'Domain Registration', price: 9.99 }],
        ['Product', { entryId: 'prod2', name: 'SSL Certificate', price: 49.99 }],
        ['Product', { entryId: 'prod3', name: 'Email Hosting', price: 2.99 }]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        { entryId: 'prod1', name: 'Domain Registration', price: 9.99 },
        { entryId: 'prod2', name: 'SSL Certificate', price: 49.99 },
        { entryId: 'prod3', name: 'Email Hosting', price: 2.99 }
      ]);
    });

    it('handles Fragment components with nested content', function () {
      // Based on mock-content-nodes.json structure
      const mockContentNodes: ContentNode[] = [
        [
          'Fragment',
          null,
          [
            ['h2', null, ['Find an awesome web address']],
            ['p', null, ['See how easily you could find an incredible extension']]
          ]
        ]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        {
          children: [
            { children: ['Find an awesome web address'] },
            { children: ['See how easily you could find an incredible extension'] }
          ]
        }
      ]);
    });

    it('handles PageFreeform structure with sections', function () {
      const mockContentNodes: ContentNode[] = [
        [
          'PageFreeform',
          {
            title: 'Domain Names',
            slug: '/domain-names',
            entryId: '6m1OtVPcd0fllxfdfszUZA'
          },
          [
            [
              'Billboard',
              {
                entryTitle: 'Billboard Title',
                colorway: 'secondary'
              },
              [
                ['Fragment', null, [['h2', null, ['Title']]]]
              ]
            ]
          ]
        ]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        {
          title: 'Domain Names',
          slug: '/domain-names',
          entryId: '6m1OtVPcd0fllxfdfszUZA',
          children: [
            {
              entryTitle: 'Billboard Title',
              colorway: 'secondary',
              children: [
                {
                  children: [
                    {
                      children: ['Title']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]);
    });

    it('handles mixed 2-element and 3-element tuples in same array', function () {
      const mockContentNodes: ContentNode[] = [
        ['Product', { id: 1, name: 'Product 1' }],
        [
          'Category',
          { id: 2, name: 'Category 1' },
          [
            ['Product', { id: 3, name: 'Product 2' }]
          ]
        ],
        ['Product', { id: 4, name: 'Product 3' }]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        { id: 1, name: 'Product 1' },
        {
          id: 2,
          name: 'Category 1',
          children: [{ id: 3, name: 'Product 2' }]
        },
        { id: 4, name: 'Product 3' }
      ]);
    });
  });

  describe('props handling', function () {
    it('handles ContentNodes with props containing null values', function () {
      const mockContentNodes: ContentNode[] = [
        ['Component', { name: 'Test', value: null, count: 0 }]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([{ name: 'Test', value: null, count: 0 }]);
    });

    it('handles ContentNodes with props containing undefined values', function () {
      const mockContentNodes: ContentNode[] = [
        ['Component', { name: 'Test', value: undefined }]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([{ name: 'Test', value: undefined }]);
    });

    it('handles props containing nested ContentNode structures', function () {
      const mockContentNodes: ContentNode[] = [
        [
          'Parent',
          {
            nested: ['Child', { id: 1 }],
            regular: 'value'
          }
        ]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        {
          nested: { id: 1 },
          regular: 'value'
        }
      ]);
    });

    it('handles props containing nested objects with arrays', function () {
      const mockContentNodes: ContentNode[] = [
        [
          'Component',
          {
            items: [1, 2, 3],
            nested: {
              deep: ['DeepNode', { value: 'test' }]
            }
          }
        ]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        {
          items: [1, 2, 3],
          nested: {
            deep: { value: 'test' }
          }
        }
      ]);
    });

    it('handles ContentNodes with props that are arrays containing ContentNodes', function () {
      const mockContentNodes: ContentNode[] = [
        [
          'Parent',
          {
            items: [
              ['Item', { id: 1 }],
              ['Item', { id: 2 }]
            ]
          }
        ]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        {
          items: [
            { id: 1 },
            { id: 2 }
          ]
        }
      ]);
    });

    it('handles regular objects in the data structure', function () {
      const mockContentNodes: ContentNode[] = [
        ['Component', { nested: { key: 'value', arr: [1, 2, 3] } }]
      ];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        { nested: { key: 'value', arr: [1, 2, 3] } }
      ]);
    });

    it('handles real-world Contentful structure with nested tuples in props', function () {
      // Simulates the actual structure from getContentfulEntries
      const mockContentNodes: ContentNode[] = [
        [
          'Index',
          {
            entryId: '5T8xGOOiWMLZlJAOjmL7mz',
            name: 'Index',
            indexEntry: ['IndexEntry', {
              entryId: '18hoyyy9Tkn80eld1CyJGI',
              name: 'Feature Flag List',
              items: [
                ['FeatureFlag', {
                  entryId: '5W0UN7BQXa4loJCt9bT3Gy',
                  name: 'Flag1',
                  rules: [
                    ['Rule', {
                      entryId: '2PjKcbup7Q5t2If5YjMF29',
                      name: 'Rule1',
                      rule: { type: 'and', rules: [] }
                    }]
                  ]
                }],
                ['FeatureFlag', {
                  entryId: '4ZIk1a1YftL7vVNmkO9p1j',
                  name: 'Enable Dismissible Campaigns',
                  rules: [
                    ['Rule', {
                      entryId: '7Mv4wr8JLNG2ktsGNo4b3p',
                      name: 'Rule2',
                      rule: { type: 'and', rules: [] }
                    }]
                  ]
                }]
              ]
            }]
          }
        ]
      ];
      const results = toFlattenedContent(mockContentNodes);
      // All tuples should be flattened recursively, including nested ones in props
      expect(results).toEqual([
        {
          entryId: '5T8xGOOiWMLZlJAOjmL7mz',
          name: 'Index',
          indexEntry: {
            entryId: '18hoyyy9Tkn80eld1CyJGI',
            name: 'Feature Flag List',
            items: [
              {
                entryId: '5W0UN7BQXa4loJCt9bT3Gy',
                name: 'Flag1',
                rules: [
                  {
                    entryId: '2PjKcbup7Q5t2If5YjMF29',
                    name: 'Rule1',
                    rule: { type: 'and', rules: [] }
                  }
                ]
              },
              {
                entryId: '4ZIk1a1YftL7vVNmkO9p1j',
                name: 'Enable Dismissible Campaigns',
                rules: [
                  {
                    entryId: '7Mv4wr8JLNG2ktsGNo4b3p',
                    name: 'Rule2',
                    rule: { type: 'and', rules: [] }
                  }
                ]
              }
            ]
          }
        }
      ]);
    });
  });

  describe('invalid or malformed data', function () {
    it('handles arrays that are not ContentNode tuples', function () {
      const mockContentNodes = [
        [123, 'not a ContentNode'],
        ['ValidNode', { id: 1 }],
        ['not a string', { id: 2 }]
      ] as unknown as ContentNode[];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        [123, 'not a ContentNode'],
        { id: 1 },
        { id: 2 }
      ]);
    });

    it('handles arrays with length 1', function () {
      const mockContentNodes = [
        ['Single']
      ] as unknown as ContentNode[];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([['Single']]);
    });

    it('handles arrays with length > 3', function () {
      const mockContentNodes = [
        ['Component', { id: 1 }, ['child'], 'extra', 'more']
      ] as unknown as ContentNode[];
      const results = toFlattenedContent(mockContentNodes);
      // Arrays with length !== 2 are not flattened, just recursively processed
      expect(results).toEqual([
        ['Component', { id: 1 }, ['child'], 'extra', 'more']
      ]);
    });

    it('handles mixed arrays with ContentNodes and regular values', function () {
      const mockContentNodes = [
        ['Node1', { id: 1 }],
        'string value',
        ['Node2', { id: 2 }],
        42
      ] as unknown as ContentNode[];
      const results = toFlattenedContent(mockContentNodes);
      expect(results).toEqual([
        { id: 1 },
        'string value',
        { id: 2 },
        42
      ]);
    });

    it('handles arrays where second element is not an object or null', function () {
      // Arrays like ['name', 'string'] or ['name', 123] should not be treated as ContentNode tuples
      const mockContentNodes = [
        ['Component', 'not an object'],
        ['Component', 123],
        ['Component', true]
      ] as unknown as ContentNode[];
      const results = toFlattenedContent(mockContentNodes);
      // These should be mapped recursively, not flattened
      expect(results).toEqual([
        ['Component', 'not an object'],
        ['Component', 123],
        ['Component', true]
      ]);
    });
  });
});

