import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Layout from './Layout';

vi.mock('./NavBar', () => ({
  default: () => <nav>nav bar</nav>,
}));

vi.mock('react-router-dom', () => ({
  Outlet: () => <main>outlet content</main>,
}));

describe('Layout', () => {
  it('renders the nav bar and nested route outlet', () => {
    render(<Layout />);

    expect(screen.getByText('nav bar')).toBeInTheDocument();
    expect(screen.getByText('outlet content')).toBeInTheDocument();
  });
});
