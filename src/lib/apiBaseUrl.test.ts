import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './apiBaseUrl';

describe('resolveApiBaseUrl', () => {
  it('uses the configured API base URL when present', () => {
    expect(resolveApiBaseUrl('https://api.example.com/')).toBe('https://api.example.com');
  });

  it('falls back to localhost in development', () => {
    expect(resolveApiBaseUrl(undefined)).toBe('http://localhost:5000');
  });
});
