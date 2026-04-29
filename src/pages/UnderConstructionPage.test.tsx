import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UnderConstructionPage from './UnderConstructionPage';

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

describe('UnderConstructionPage', () => {
  it('renders the construction placeholder content', () => {
    render(<UnderConstructionPage />);

    expect(screen.getByText('nav bar')).toBeInTheDocument();
    expect(screen.getByText('Page Under Construction')).toBeInTheDocument();
    expect(screen.getByText('Come back for more information')).toBeInTheDocument();
    expect(screen.getByText('footer')).toBeInTheDocument();
  });
});
