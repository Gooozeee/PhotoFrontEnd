import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WelcomeImage from './WelcomeImage';

vi.mock('../assets/paiMountains.webp', () => ({ default: 'hero.webp' }));

vi.mock('react-icons/io5', () => ({
  IoChevronDown: () => <span>down</span>,
}));

describe('WelcomeImage', () => {
  it('renders headline and subheading', () => {
    render(<WelcomeImage heading="Hello" subHeadingOne="World" />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('calls the scroll handler', () => {
    const onScroll = vi.fn();

    render(<WelcomeImage heading="Hello" subHeadingOne="World" onScrollIndicatorClick={onScroll} />);
    fireEvent.click(screen.getByRole('button'));

    expect(onScroll).toHaveBeenCalled();
  });
});
