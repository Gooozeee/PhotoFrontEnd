import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

const scrollIntoViewMock = vi.fn();

vi.mock('../components/WelcomeImage', () => ({
  default: ({ onScrollIndicatorClick }: { onScrollIndicatorClick?: () => void }) => (
    <button type="button" onClick={onScrollIndicatorClick}>hero</button>
  ),
}));

vi.mock('../components/GalleryBanner', () => ({
  default: ({ title }: { title?: string }) => <div>{title}</div>,
}));

vi.mock('../components/Footer', () => ({ default: () => <footer>footer</footer> }));

describe('HomePage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('renders the gallery banner and footer', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Image Gallery')).toBeInTheDocument();
    expect(screen.getByText('footer')).toBeInTheDocument();
  });

  it('scrolls to the gallery section from the hero control', () => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewMock,
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'hero' }));

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('shows the admin redirect message from navigation state', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/', state: { adminMessage: 'This GitHub account is not allowed to access the admin area. You have been signed out.' } }]}>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('This GitHub account is not allowed to access the admin area. You have been signed out.');
  });

  it('shows and clears the persisted admin redirect message after a hard redirect', () => {
    window.sessionStorage.setItem('adminRedirectMessage', 'Your admin session expired. You have been signed out.');

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Your admin session expired. You have been signed out.');
    expect(window.sessionStorage.getItem('adminRedirectMessage')).toBeNull();
  });
});
