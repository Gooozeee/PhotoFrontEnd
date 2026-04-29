import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPage from './AdminPage';
import RequireAdminSession from './admin/RequireAdminSession';

const mockSyncAccessToken = vi.fn();
const mockSignInWithGitHub = vi.fn();
const mockSignOutAdmin = vi.fn();
const mockUnsubscribe = vi.fn();
const mockSetAccessToken = vi.fn();
const mockVerifyAdminSession = vi.fn();

vi.mock('../lib/supabase', () => ({
  setAccessToken: (...args: unknown[]) => mockSetAccessToken(...args),
  syncAccessToken: (...args: unknown[]) => mockSyncAccessToken(...args),
  signInWithGitHub: (...args: unknown[]) => mockSignInWithGitHub(...args),
  signOutAdmin: (...args: unknown[]) => mockSignOutAdmin(...args),
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      })),
    },
  },
}));

vi.mock('./admin/api', async () => {
  const actual = await vi.importActual<typeof import('./admin/api')>('./admin/api');
  return {
    ...actual,
    verifyAdminSession: (...args: unknown[]) => mockVerifyAdminSession(...args),
  };
});

function HomeProbe() {
  const location = useLocation();
  const message = (location.state as { adminMessage?: string } | null)?.adminMessage;

  return <div>{message ?? 'home'}</div>;
}

describe('AdminPage', () => {
  beforeEach(() => {
    mockSyncAccessToken.mockReset();
    mockSignInWithGitHub.mockReset();
    mockSignOutAdmin.mockReset();
    mockUnsubscribe.mockReset();
    mockSetAccessToken.mockReset();
    mockVerifyAdminSession.mockReset();
    mockVerifyAdminSession.mockResolvedValue(undefined);
  });

  it('shows the GitHub sign-in screen when signed out', async () => {
    mockSyncAccessToken.mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Sign in with GitHub')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeInTheDocument();
  });

  it('starts GitHub OAuth when requested', async () => {
    const user = userEvent.setup();
    mockSyncAccessToken.mockResolvedValue(null);
    mockSignInWithGitHub.mockResolvedValue(undefined);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(await screen.findByRole('button', { name: 'Continue with GitHub' }));

    expect(mockSignInWithGitHub).toHaveBeenCalledTimes(1);
  });

  it('redirects to upload when already signed in', async () => {
    mockSyncAccessToken.mockResolvedValue({ access_token: 'token' });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/upload" element={<div>upload page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('upload page')).toBeInTheDocument();
  });

  it('signs out and redirects home when the signed-in account is not an allowed admin', async () => {
    mockSyncAccessToken.mockResolvedValue({ access_token: 'token' });
    mockVerifyAdminSession.mockRejectedValue(new Error('Admin access denied for this account.'));
    mockSignOutAdmin.mockResolvedValue(undefined);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<HomeProbe />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('This GitHub account is not allowed to access the admin area. You have been signed out.')).toBeInTheDocument();
    expect(mockSignOutAdmin).toHaveBeenCalledTimes(1);
  });
});

describe('RequireAdminSession', () => {
  beforeEach(() => {
    mockSyncAccessToken.mockReset();
    mockSignOutAdmin.mockReset();
    mockUnsubscribe.mockReset();
    mockSetAccessToken.mockReset();
    mockVerifyAdminSession.mockReset();
    mockVerifyAdminSession.mockResolvedValue(undefined);
  });

  it('redirects to /admin when no session exists', async () => {
    mockSyncAccessToken.mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={['/admin/photos']}>
        <Routes>
          <Route path="/admin" element={<div>admin login</div>} />
          <Route element={<RequireAdminSession />}>
            <Route path="/admin/photos" element={<div>photos page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('admin login')).toBeInTheDocument();
  });

  it('renders nested admin routes when a session exists', async () => {
    mockSyncAccessToken.mockResolvedValue({ access_token: 'token' });

    render(
      <MemoryRouter initialEntries={['/admin/photos']}>
        <Routes>
          <Route path="/admin" element={<div>admin login</div>} />
          <Route element={<RequireAdminSession />}>
            <Route path="/admin/photos" element={<div>photos page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('photos page')).toBeInTheDocument();
  });

  it('signs out and redirects home when the session is not allowed for admin', async () => {
    mockSyncAccessToken.mockResolvedValue({ access_token: 'token' });
    mockVerifyAdminSession.mockRejectedValue(new Error('Admin access denied for this account.'));
    mockSignOutAdmin.mockResolvedValue(undefined);

    render(
      <MemoryRouter initialEntries={['/admin/photos']}>
        <Routes>
          <Route path="/" element={<HomeProbe />} />
          <Route path="/admin" element={<div>admin login</div>} />
          <Route element={<RequireAdminSession />}>
            <Route path="/admin/photos" element={<div>photos page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('This GitHub account is not allowed to access the admin area. You have been signed out.')).toBeInTheDocument();
    expect(mockSignOutAdmin).toHaveBeenCalledTimes(1);
  });

  it('shows a loading message while the session is resolving', async () => {
    let resolveSession: ((value: null) => void) | undefined;
    mockSyncAccessToken.mockImplementation(() => new Promise((resolve) => {
      resolveSession = resolve;
    }));

    render(
      <MemoryRouter initialEntries={['/admin/photos']}>
        <Routes>
          <Route path="/admin" element={<div>admin login</div>} />
          <Route element={<RequireAdminSession />}>
            <Route path="/admin/photos" element={<div>photos page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Checking admin session...')).toBeInTheDocument();

    resolveSession?.(null);

    await waitFor(() => {
      expect(screen.getByText('admin login')).toBeInTheDocument();
    });
  });
});
