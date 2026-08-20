import * as exported from '../src/index';

describe('index', function () {
  it('has expected exports', function () {
    const expected = [
      // ignores types
      'PartType',
      'determinePartType',
      'traverse',
      'reverseTraverse',
      'reverseTraverseAsync',
      'transform',
      'cleanChildren',
      'isContentNode',
      'isContentNodeChildren',
      'isContentNodeOrString',
      'reverseTransformNodesAsync'
    ];

    expected.forEach(name => {
      expect(exported).toHaveProperty(name);
    });

    expect(Object.keys(exported)).toHaveLength(expected.length);
  });
});
