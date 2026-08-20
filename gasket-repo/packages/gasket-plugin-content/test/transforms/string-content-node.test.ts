import { describe, it, expect } from 'vitest';
import {
  isTextNode,
  getNodeAttributes,
  createContentNodeChildren,
  handleTextNode,
  transformStringContentNode,
  createContentNode,
  reactFragment
} from '../../src/transforms/string-content-node.js';

const rawText = 'This is a textNode';
const attributes = { attr: true, attr2: true };

const textNode = {
  nodeType: 3,
  childNodes: [],
  rawText
};

const paragraphNode = {
  nodeType: 1,
  childNodes: [textNode],
  rawTagName: 'p'
};

const imageNode = {
  nodeType: 1,
  childNodes: [],
  attributes,
  rawTagName: 'img'
};

describe('isTextNode', function () {
  it('returns true with a nodeType of 3', function () {
    expect(isTextNode(textNode)).toBe(true);
  });

  it('returns false when nodeType is not 3', function () {
    expect(isTextNode(paragraphNode)).toBe(false);
  });
});

describe('getNodeAttributes', function () {
  it('empty object returns null', function () {
    expect(getNodeAttributes({})).toBe(null);
  });

  it('undefined returns null', function () {
    // eslint-disable-next-line no-undefined
    expect(getNodeAttributes(undefined)).toBe(null);
  });

  it('object is returned if not empty', function () {
    expect(getNodeAttributes(attributes)).toEqual(attributes);
  });
});

describe('createContentNodeChildren', function () {
  it('handles text nodes', function () {
    expect(createContentNodeChildren([textNode])).toEqual([
      rawText
    ]);
  });

  it('handles html', function () {
    expect(createContentNodeChildren([paragraphNode])).toEqual([
      ['p', null, [rawText]]
    ]);
  });
});

describe('handleTextNode', function () {
  it('handles text nodes', function () {
    expect(handleTextNode(textNode)).toEqual(rawText);
  });

  it('removes shorthand React Fragment', function () {
    expect(handleTextNode({ ...textNode, rawText: '<>fragment text</>' })).toEqual('fragment text');
  });
});

describe('createContentNode', function () {
  it('handles node with no tagName', function () {
    expect(createContentNode({
      nodeType: 3,
      childNodes: []
    })).toEqual([
      reactFragment, null
    ]);
  });

  it('handles node with attributes', function () {
    expect(createContentNode({ ...paragraphNode, attributes })).toEqual([
      'p', attributes, [rawText]
    ]);
  });

  it('handles node without attributes', function () {
    expect(createContentNode(paragraphNode)).toEqual([
      'p', null, [rawText]
    ]);
  });

  it('handles node with no children', function () {
    expect(createContentNode(imageNode)).toEqual([
      'img', attributes
    ]);
  });
});

describe('transformStringContentNode', function () {
  it('handles shorthand fragment with text', function () {
    expect(transformStringContentNode('<>hello</>')).toEqual([
      reactFragment, null, ['hello']
    ]);
  });

  it('handles long form Fragment text', function () {
    expect(transformStringContentNode('<React.Fragment>hello</React.Fragment>')).toEqual([
      reactFragment, null, [['React.Fragment', null, ['hello']]]
    ]);
  });

  it('handles html with text', function () {
    expect(transformStringContentNode('<p>hello</p>')).toEqual([
      reactFragment, null, [['p', null, ['hello']]]
    ]);
  });

  it('handles html with attributes', function () {
    expect(transformStringContentNode('<p style="font-size:100px;color:blue">hello</p>')).toEqual([
      reactFragment, null, [['p', { style: 'font-size:100px;color:blue' }, ['hello']]]
    ]);
  });

  it('handles nested html', function () {
    expect(transformStringContentNode('<div>well<bold>hello <i>again</i> world</bold>!!!<div>')).toEqual([
      reactFragment, null, [['div', null, ['well', ['bold', null, ['hello ', ['i', null, ['again']], ' world']], '!!!']]]
    ]);
  });

  it('handles content without parent wrapping tag', function () {
    expect(transformStringContentNode('well <bold>hello <i>again</i> world</bold>!!!')).toEqual([
      reactFragment, null, ['well ', ['bold', null, ['hello ', ['i', null, ['again']], ' world']], '!!!']
    ]);
  });

  it('handles html with self closing tag', function () {
    expect(transformStringContentNode('<img src="example.com"/>')).toEqual([
      reactFragment, null, [['img', { src: 'example.com' }]]
    ]);
  });
});
