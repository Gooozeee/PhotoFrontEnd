import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

vi.mock('./poc/LightTablePoc', () => ({
  default: ({ standalone }: { standalone?: boolean }) => (
    <div>{standalone ? 'standalone light table' : 'new homepage'}</div>
  ),
}));

describe('HomePage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('renders the new light table homepage', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText('new homepage')).toBeInTheDocument();
  });

  it('shows the admin redirect message from navigation state', () => {
    render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/',
          state: { adminMessage: 'This GitHub account is not allowed to access the admin area. You have been signed out.' },
        }]}
      >
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('This GitHub account is not allowed to access the admin area. You have been signed out.');
  });

  it('shows and clears the persisted admin redirect message after a hard redirect', () => {
    window.sessionStorage.setItem('adminRedirectMessage', 'Your admin session expired. You have been signed out.');

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Your admin session expired. You have been signed out.');
    expect(window.sessionStorage.getItem('adminRedirectMessage')).toBeNull();
  });
});
