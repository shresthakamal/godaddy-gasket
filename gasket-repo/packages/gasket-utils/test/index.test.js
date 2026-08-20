/* eslint-disable no-process-env */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { gdEnv } from '../lib/index.js';

describe('gdEnv', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment variables
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(gdEnv).toBeDefined();
  });

  it('should return undefined when GD_ENV is not set', () => {
    delete process.env.GD_ENV;
    delete process.env.GD_REGION;
    expect(gdEnv()).toBeUndefined();
  });

  it('should return undefined when GD_ENV is empty string', () => {
    process.env.GD_ENV = '';
    process.env.GD_REGION = 'us-west-2';
    expect(gdEnv()).toBeUndefined();
  });

  it('should return just the env when GD_REGION is not set', () => {
    process.env.GD_ENV = 'dev';
    delete process.env.GD_REGION;
    expect(gdEnv()).toBe('dev');
  });

  it('should return just the env when GD_REGION is empty string', () => {
    process.env.GD_ENV = 'dev';
    process.env.GD_REGION = '';
    expect(gdEnv()).toBe('dev');
  });

  it('should return env.region when both are set', () => {
    process.env.GD_ENV = 'dev';
    process.env.GD_REGION = 'us-west-2';
    expect(gdEnv()).toBe('dev.us-west-2');
  });

  it('should remove -private suffix from GD_ENV', () => {
    process.env.GD_ENV = 'dev-private';
    delete process.env.GD_REGION;
    expect(gdEnv()).toBe('dev');
  });

  it('should remove -private suffix and combine with region', () => {
    process.env.GD_ENV = 'dev-private';
    process.env.GD_REGION = 'us-west-2';
    expect(gdEnv()).toBe('dev.us-west-2');
  });

  it('should handle test environment', () => {
    process.env.GD_ENV = 'test';
    process.env.GD_REGION = 'us-east-1';
    expect(gdEnv()).toBe('test.us-east-1');
  });

  it('should handle prod environment', () => {
    process.env.GD_ENV = 'prod';
    process.env.GD_REGION = 'us-west-2';
    expect(gdEnv()).toBe('prod.us-west-2');
  });
});
