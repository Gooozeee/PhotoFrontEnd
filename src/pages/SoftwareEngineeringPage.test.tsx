import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SoftwareEngineeringPage from './SoftwareEngineeringPage';

vi.mock('../components/WelcomeImage', () => ({
  default: ({ heading }: { heading: string }) => <div>{heading}</div>,
}));

vi.mock('../components/Footer', () => ({ default: () => <footer>footer</footer> }));

vi.mock('../components/ImageSwitcher', () => ({
  default: () => <div>image-switcher</div>,
}));

describe('SoftwareEngineeringPage', () => {
  it('explains the ai workflow and the product flow', () => {
    render(<SoftwareEngineeringPage />);

    expect(screen.getByText('AI workflow')).toBeInTheDocument();
    expect(screen.getByText('Queue untagged photos')).toBeInTheDocument();
    expect(screen.getByText('Generate metadata once')).toBeInTheDocument();
    expect(screen.getByText('How it works')).toBeInTheDocument();
    expect(screen.getByText('image-switcher')).toBeInTheDocument();
    expect(screen.getByText('footer')).toBeInTheDocument();
  });
});
