import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSessionMock = vi.fn();
const signInWithOAuthMock = vi.fn();
const signOutMock = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: getSessionMock,
      signInWithOAuth: signInWithOAuthMock,
      signOut: signOutMock,
    },
  })),
}));

describe('supabase helpers', () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    getSessionMock.mockReset();
    signInWithOAuthMock.mockReset();
    signOutMock.mockReset();
  });

  it('stores and reads the access token', async () => {
    const mod = await import('./supabase');

    mod.setAccessToken('token-123');

    expect(mod.getAccessToken()).toBe('token-123');
  });

  it('syncs the current session access token into storage', async () => {
    getSessionMock.mockResolvedValue({ data: { session: { access_token: 'session-token' } } });
    const mod = await import('./supabase');

    const session = await mod.syncAccessToken();

    expect(session).toEqual({ access_token: 'session-token' });
    expect(mod.getAccessToken()).toBe('session-token');
  });

  it('starts GitHub OAuth with /admin redirect', async () => {
    signInWithOAuthMock.mockResolvedValue({ error: null });
    const mod = await import('./supabase');

    await mod.signInWithGitHub();

    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: 'github',
      options: { redirectTo: 'http://localhost:3000/admin' },
    });
  });

  it('clears the token on sign out', async () => {
    signOutMock.mockResolvedValue(undefined);
    const mod = await import('./supabase');
    mod.setAccessToken('token-123');

    await mod.signOutAdmin();

    expect(mod.getAccessToken()).toBeNull();
  });
});
