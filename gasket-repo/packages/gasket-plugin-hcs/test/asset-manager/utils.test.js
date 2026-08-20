import { describe, it, expect } from 'vitest';
import { isSimpleTag, getHostName } from '../../lib/asset-manager/utils.js';

describe('Utils', () => {

  describe('isSimpleTag', () => {
    it('Correctly checks for simple tags', () => {
      expect(isSimpleTag({})).toBeFalsy();
      expect(isSimpleTag({ foo: 'bar' })).toBeFalsy();
      expect(isSimpleTag({ tagName: ['invalid'] })).toBeFalsy();
      expect(isSimpleTag({ tagName: 'script' })).toBeTruthy();
      expect(isSimpleTag({ tagName: 'style' })).toBeTruthy();
    });
  });

  describe('getHostName', () => {
    it('Returns the hostname from a URL', () => {
      expect(getHostName('https://godaddy.com/some/path/some/file.js')).toEqual('godaddy.com');
      expect(getHostName('https://subdomain.godaddy.com/some/path/some/file.js')).toEqual('subdomain.godaddy.com');
      expect(getHostName('http://cdn.net/some/path/some/file.js?paramOne=foo')).toEqual('cdn.net');
      expect(getHostName('//cdn.com/some/path/some/style.css')).toEqual('cdn.com');
    });
  });

  describe('getHostName: second', () => {
    it('Returns empty string for invalid URL', () => {
      expect(getHostName({ type: 'invalid parameter of type object' })).toEqual('');
      expect(getHostName('')).toEqual('');
      expect(getHostName(void 0)).toEqual('');
      expect(getHostName('justsomestring')).toEqual('');
    });
  });

});
