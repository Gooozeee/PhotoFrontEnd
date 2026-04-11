import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NavBar from './NavBar';

vi.mock('../assets/degooseLogoWhite.webp', () => ({ default: 'logo.webp' }));

describe('NavBar', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  it('renders primary navigation links', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('opens and closes the mobile menu', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const toggle = screen.getByLabelText('Toggle menu');
    fireEvent.click(toggle);

    expect(screen.getAllByText('Home')).toHaveLength(2);
    expect(screen.getAllByText('Work')).toHaveLength(2);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getAllByText('Home')[1]);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
