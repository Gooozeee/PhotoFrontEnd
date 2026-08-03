import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/apiBaseUrl', () => ({
  resolveApiBaseUrl: () => 'http://localhost:5000',
}));

const getAccessTokenMock = vi.fn();
const signOutAdminMock = vi.fn();

vi.mock('../../lib/supabase', () => ({
  getAccessToken: () => getAccessTokenMock(),
  signOutAdmin: () => signOutAdminMock(),
}));

describe('admin api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
    getAccessTokenMock.mockReset();
    signOutAdminMock.mockReset();
    getAccessTokenMock.mockReturnValue('token-123');
    signOutAdminMock.mockResolvedValue(undefined);
  });

  it('adds the bearer token to admin requests', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([{ id: '1' }]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    const mod = await import('./api');

    await mod.loadPhotos();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/api/admin/photos');
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('returns all albums for the admin pages', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    const mod = await import('./api');

    await mod.loadAlbums();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/api/albums');
  });

  it('loads published albums for public selectors', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    const mod = await import('./api');

    await mod.loadPublishedAlbums();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/api/albums/published');
  });

  it('maps 401 responses to a session error', async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 401 }));
    const mod = await import('./api');

    await expect(mod.loadPhotos()).rejects.toThrow('Admin session missing or expired. Sign in again.');
    expect(signOutAdminMock).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('/');
    expect(window.sessionStorage.getItem('adminRedirectMessage')).toBe('Your admin session expired. You have been signed out.');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('maps 403 responses to an access error', async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 403 }));
    const mod = await import('./api');

    await expect(mod.loadPhotos()).rejects.toThrow('Admin access denied for this account.');
    expect(signOutAdminMock).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('/');
    expect(window.sessionStorage.getItem('adminRedirectMessage')).toBe('This GitHub account is not allowed to access the admin area. You have been signed out.');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('does not hard redirect while verifying the admin session', async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 401 }));
    const mod = await import('./api');

    await expect(mod.verifyAdminSession()).rejects.toThrow('Admin session missing or expired. Sign in again.');
    expect(signOutAdminMock).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('');
    expect(window.sessionStorage.getItem('adminRedirectMessage')).toBeNull();

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('checks admin session with the dedicated endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    const mod = await import('./api');

    await mod.verifyAdminSession();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/api/admin/session');
  });

  it('does not force json content type for form data uploads', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    const mod = await import('./api');

    await mod.adminFetch('/api/photos/upload', {
      method: 'POST',
      body: new FormData(),
    });

    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Content-Type')).toBeNull();
    expect(headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('omits the authorization header when no access token is available', async () => {
    getAccessTokenMock.mockReturnValue(null);
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    const mod = await import('./api');

    await mod.loadPhotos();

    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Authorization')).toBeNull();
  });

  it('loads the metadata queue', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([{ photoId: 'p1', state: 'Pending', attempts: 0 }]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    const mod = await import('./api');

    const queue = await mod.loadMetadataQueue();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/api/admin/metadata/queue');
    expect(queue[0]?.state).toBe('Pending');
  });

  it('posts to enqueue missing metadata', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 202 }));
    const mod = await import('./api');

    await mod.enqueueMetadata();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/api/admin/metadata/enqueue');
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe('POST');
  });

  it('posts to reset failed metadata jobs and returns the reset count', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ reset: 4 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    const mod = await import('./api');

    const result = await mod.resetMetadataQueue();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/api/admin/metadata/reset');
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe('POST');
    expect(result.reset).toBe(4);
  });

  it('maps unknown request failures to a generic error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 500 }));
    const mod = await import('./api');

    await expect(mod.loadPhotos()).rejects.toThrow('Request failed with 500');
  });

  it('maps redirect messages for denied, expired, and unknown admin errors', async () => {
    const mod = await import('./api');

    expect(mod.getAdminRedirectMessage(new Error('Admin access denied for this account.')))
      .toBe('This GitHub account is not allowed to access the admin area. You have been signed out.');
    expect(mod.getAdminRedirectMessage(new Error('Admin session missing or expired. Sign in again.')))
      .toBe('Your admin session expired. You have been signed out.');
    expect(mod.getAdminRedirectMessage(new Error('Unexpected failure')))
      .toBe('Admin access could not be verified. You have been signed out.');
    expect(mod.getAdminRedirectMessage('plain string error'))
      .toBe('Admin access could not be verified. You have been signed out.');
  });
});
