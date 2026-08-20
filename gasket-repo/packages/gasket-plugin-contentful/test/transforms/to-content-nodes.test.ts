/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { toContentNodes } from '../../src/transforms/to-content-nodes.js';
import { ContentNode, isContentNode, PartType, traverse } from '@godaddy/gasket-content-nodes';
import { ContentfulContentSettings, Entries } from '../../src/index.js';

import mockPageEntry from '../fixtures/mock-page-entry.json' with { type: 'json' };
import mockEmbeddedInline from '../fixtures/mock-embedded-inline.json' with { type: 'json' };
import mockEntryHyperlink from '../fixtures/mock-entry-hyperlink.json' with { type: 'json' };
import mockAssetHyperlinkRaw from '../fixtures/mock-asset-hyperlink-raw.json' with { type: 'json' };
import mockAssetHyperlinkAssetNode from '../fixtures/mock-asset-hyperlink-asset-node.json' with { type: 'json' };
import mockAssetHyperlinkUnknownNode from '../fixtures/mock-asset-hyperlink-unknown-node.json' with { type: 'json' };
import mockEmbeddedBlock from '../fixtures/mock-embedded-block.json' with { type: 'json' };
import mockHyperLink from '../fixtures/mock-hyperlink.json' with { type: 'json' };
import mockHeading from '../fixtures/mock-heading.json' with { type: 'json' };
import mockAsset from '../fixtures/mock-asset.json' with { type: 'json' };

import { BLOCKS } from '@contentful/rich-text-types';
import * as richText from '../../src/utils/rich-text.js';

const mockEntries = [mockPageEntry] as unknown as Entries;

// eslint-disable-next-line max-statements
describe('toContentNodes', function () {
  let mockContentSettings: ContentfulContentSettings;
  let mockLogger: any;
  let richTextSpy;

  beforeEach(() => {
    richTextSpy = vi.spyOn(richText, 'prepareRichText');
    mockContentSettings = {};

    mockLogger = {
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('transforms contentful data to contentNode tree', function () {
    const [contentNode] = toContentNodes(mockEntries, mockContentSettings, mockLogger);
    expect(isContentNode(contentNode)).toBeTruthy();
  });

  it('transforms rich text', function () {
    const results = toContentNodes(mockEntries, mockContentSettings, mockLogger);
    let foundParagraph: ContentNode | undefined;
    let foundHeading: ContentNode | undefined;

    expect(richTextSpy).toHaveBeenCalled();

    traverse(results, (part, partType, stop) => {
      if (partType === PartType.node) {
        const [name] = part;
        if (name === 'p') {
          foundParagraph = part;
          stop();
        }
        if (name === 'h2') {
          foundHeading = part;
          stop();
        }
      }
      return part;
    });

    expect(foundParagraph).toBeTruthy();
    expect(isContentNode(foundParagraph)).toBeTruthy();

    expect(foundHeading).toBeTruthy();
    expect(isContentNode(foundHeading)).toBeTruthy();
  });

  it('warns for missing content entries', function () {
    toContentNodes(mockEntries, mockContentSettings, mockLogger);
    expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('entry missing content'));
  });

  it('skips warning for missing content entries when skipBadEntries is true', function () {
    mockContentSettings.skipBadEntries = true;
    toContentNodes(mockEntries, mockContentSettings, mockLogger);
    expect(mockLogger.warn).not.toHaveBeenCalledWith(expect.stringContaining('entry missing content'));
  });

  it('warns for unresolved cross-space references', function () {
    toContentNodes(mockEntries, mockContentSettings, mockLogger);
    expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('cross-space reference'));
  });

  it('skips warning for unresolved cross-space references when skipCrossSpaceErrors is true', function () {
    mockContentSettings.skipCrossSpaceErrors = true;
    toContentNodes(mockEntries, mockContentSettings, mockLogger);
    expect(mockLogger.warn).not.toHaveBeenCalledWith(expect.stringContaining('cross-space reference'));
  });

  it('transforms embedded-entry-inline by default', function () {
    const entries: any = [mockEmbeddedInline];
    const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
    expect(contentNode).toEqual(
      ['p', null, [
        'Demo token: ',
        ['EmbeddedToken', { entryId: '2tHpmUp9yK4QVBh6cX2l34', title: 'some:token' }]
      ]]
    );
  });

  it('transforms embedded-entry-block (wraps with p) by default', function () {
    const entries: any = [mockEmbeddedBlock];
    const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
    expect(contentNode).toEqual(
      ['p', null, [
        'Demo token: ',
        ['p', null, [
          ['EmbeddedToken', { entryId: '2tHpmUp9yK4QVBh6cX2l34', title: 'some:token' }]]
        ]
      ]]
    );
  });

  it('transforms entry-hyperlinks by default', function () {
    const entries: any = [mockEntryHyperlink];
    const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
    expect(contentNode).toEqual(
      ['p', null, [
        'Demo link: ',
        ['a', { href: ['LocalizedUrl', { path: '/some/page', entryId: '5oiEIgnh2zeGUJSfmTfRA4' }] }, ['click here!']]
      ]]
    );
  });

  it('transforms asset-hyperlinks by default', function () {
    const entries: any = [mockAssetHyperlinkRaw];
    const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
    expect(contentNode).toEqual(
      ['p', null, [
        'Demo link: ',
        ['a', { href: '//some.cdn.net/image.svg' }, ['click to see!']]
      ]]
    );
  });

  it('transforms asset-hyperlinks - handles asset node', function () {
    const entries: any = [mockAssetHyperlinkAssetNode];
    const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
    expect(contentNode).toEqual(
      ['p', null, [
        'Demo link: ',
        ['a', { href: '//some.cdn.net/image.svg' }, ['click to see!']]
      ]]
    );
  });

  it('transforms asset-hyperlinks - handles unknown node', function () {
    const expected = mockAssetHyperlinkUnknownNode.content[1].data.target;
    const entries: any = [mockAssetHyperlinkUnknownNode];
    const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
    expect(contentNode).toEqual(
      ['p', null, [
        'Demo link: ',
        ['a', { href: expected }, ['click to see!']]
      ]]
    );
  });

  describe('adds sys.ids to props', function () {

    it('entries recieve entryId', function () {
      const [contentNode] = toContentNodes(mockEntries, mockContentSettings, mockLogger);
      expect(isContentNode(contentNode)).toBeTruthy();
      expect(contentNode[1]?.sections[1][1]).toEqual(expect.objectContaining({
        entryId: expect.any(String)
      }));
    });

    it('assets recieve assetId', function () {
      const entries: any = [mockAsset];
      const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
      const [, props] = contentNode;
      expect(props).toEqual(expect.objectContaining({
        assetId: expect.any(String)
      }));
    });
  });

  describe('handles contentful-based assets', function () {

    it('transforms image Assets with default handlers', function () {
      const entries: any = [mockAsset];
      const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
      const [name, props] = contentNode;
      expect(name).toEqual('img');
      expect(props?.src).toEqual('//images.ctfassets.net/path/to/image.svg');
      expect(props?.alt).toEqual('Domain Backorder NextGen Migration - ICT-1968');
    });

  });

  describe('allows custom app mapping', function () {
    it('works with custom function handler', function () {
      mockContentSettings = {
        richText: {
          ['embedded-entry-block']: (part) => ['CustomBlockComponent', null, [part.data.target]]
        }
      };
      const entries: any = [mockEmbeddedBlock];
      const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
      expect(contentNode).toEqual(
        ['p', null, [
          'Demo token: ',
          ['CustomBlockComponent', null, [
            ['EmbeddedToken', { entryId: '2tHpmUp9yK4QVBh6cX2l34', title: 'some:token' }]]
          ]
        ]]
      );
    });

    it('works with custom string handler', function () {
      mockContentSettings = {
        richText: {
          ['hyperlink']: 'CustomLinkComponent'
        }
      };
      const entries: any = [mockHyperLink];
      const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
      expect(contentNode).toEqual(
        [
          'CustomLinkComponent',
          {
            href: 'https://www.godaddy.com/help/turn-off-auto-renew-20008'
          },
          ['turn off the auto-renewal']
        ]
      );
    });

    it('works with custom object handler', function () {
      mockContentSettings = {
        richText: {
          ['heading-3']: ['span', { className: 'h3' }]
        }
      };
      const entries: any = [mockHeading];
      const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
      expect(contentNode).toEqual(
        [
          'span',
          {
            className: 'h3'
          },
          ['Try it now']
        ]
      );
    });

    it('merges app provided & existing props', function () {
      mockContentSettings = {
        richText: {
          ['hyperlink']: ['a', { className: 'custom-link' }]
        }
      };
      const entries: any = [mockHyperLink];
      const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
      expect(contentNode).toEqual(
        [
          'a',
          {
            className: 'custom-link',
            href: 'https://www.godaddy.com/help/turn-off-auto-renew-20008'
          },
          ['turn off the auto-renewal']
        ]
      );
    });

    it('transforms Assets with custom handlers', function () {
      mockContentSettings = {
        asset: {
          ['image/jpeg']: (part) => ['CustomJPEG', part.fields],
          ['image/svg+xml']: (part) => ['CustomSVG', part.fields]
        }
      };
      const entries: any = [mockAsset];
      const [contentNode] = toContentNodes(entries, mockContentSettings, mockLogger);
      const [name, props] = contentNode;
      expect(name).toEqual('CustomSVG');
      expect(props?.file?.url).toEqual('//images.ctfassets.net/path/to/image.svg');
    });

    it('collapses nested text with no props', function () {
      const mockPart = {
        nodeType: BLOCKS.HEADING_1,
        data: {},
        content: [{
          nodeType: 'text',
          data: {},
          marks: [],
          value: 'hello world'
        }]
      };

      const results = toContentNodes(mockPart, {}, mockLogger);
      expect(results).toEqual(
        ['h1', null, ['hello world']]
      );
    });

    it('ensures nested hr does not have empty children', function () {
      const entries = [{
        data: {},
        nodeType: BLOCKS.LIST_ITEM,
        content: [
          {
            data: {},
            nodeType: BLOCKS.HR,
            content: []
          }
        ]
      }];
      const [results] = toContentNodes(entries, {}, mockLogger);
      expect(results).toEqual(
        ['li', null, [['hr', null]]]
      );
    });

    it('does not harm nested non-paragraph nodes with empty children', function () {
      const entries = {
        data: {},
        nodeType: BLOCKS.PARAGRAPH,
        content: [
          {
            data: {},
            nodeType: 'Custom',
            content: ['']
          }
        ]
      };
      const results = toContentNodes(entries, {}, mockLogger);
      expect(results).toEqual(
        ['p', null, [['Custom', null, ['']]]]
      );
    });

    it('deletes paragraph nodes with empty children', function () {
      const entries = [{
        data: {},
        nodeType: BLOCKS.HEADING_1,
        content: [{
          data: {},
          nodeType: BLOCKS.PARAGRAPH,
          content: ['']
        }]
      }];

      const [results] = toContentNodes(entries, {}, mockLogger);
      expect(results).toEqual(
        ['h1', null, []]
      );
    });
  });
});
