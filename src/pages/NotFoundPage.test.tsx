import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NotFoundPage from './NotFoundPage';

vi.mock('../components/NavBar', () => ({
  default: () => <nav>nav bar</nav>,
}));

vi.mock('../components/Footer', () => ({
  default: () => <footer>footer</footer>,
}));

vi.mock('../components/WelcomeImage', () => ({
  default: ({ heading, subHeadingOne }: { heading: string; subHeadingOne: string }) => (
    <section>
      <h1>{heading}</h1>
      <p>{subHeadingOne}</p>
    </section>
  ),
}));

describe('NotFoundPage', () => {
  it('renders the 404 welcome state', () => {
    render(<NotFoundPage />);

    expect(screen.getByText('nav bar')).toBeInTheDocument();
    expect(screen.getByText('404 Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('Come back for more information')).toBeInTheDocument();
    expect(screen.getByText('footer')).toBeInTheDocument();
  });
});
