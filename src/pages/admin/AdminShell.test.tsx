import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminShell } from './AdminShell';

const signOutAdminMock = vi.fn();

vi.mock('../../lib/supabase', () => ({
  signOutAdmin: () => signOutAdminMock(),
}));

describe('AdminShell', () => {
  beforeEach(() => {
    signOutAdminMock.mockReset();
    signOutAdminMock.mockResolvedValue(undefined);
  });

  it('renders stats and navigation', () => {
    render(
      <MemoryRouter>
        <AdminShell title="Albums" active="albums" stats={{ albums: 2, photos: 10, published: 1 }}>
          <div>content</div>
        </AdminShell>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Albums' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Library' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upload' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'AI Metadata' })).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('signs out from the admin shell', async () => {
    const user = userEvent.setup();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    });

    render(
      <MemoryRouter>
        <AdminShell title="Albums" active="albums" stats={{ albums: 2, photos: 10, published: 1 }}>
          <div>content</div>
        </AdminShell>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(signOutAdminMock).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('/admin');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });
});
