import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './apiBaseUrl';

describe('resolveApiBaseUrl', () => {
  it('uses the configured API base URL when present', () => {
    expect(resolveApiBaseUrl('https://api.example.com/')).toBe('https://api.example.com');
  });

  it('uses a relative API base in development', () => {
    expect(resolveApiBaseUrl(undefined)).toBe('');
  });
});
