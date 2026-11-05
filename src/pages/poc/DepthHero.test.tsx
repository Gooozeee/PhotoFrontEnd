import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DepthHero } from './DepthHero';

describe('DepthHero', () => {
  it('renders the fallback image without a canvas when disabled', () => {
    const { container } = render(<DepthHero src="/hero.jpg" alt="Hero" disabled />);

    expect(screen.getByAltText('Hero')).toHaveStyle({ opacity: 1 });
    expect(container.querySelector('canvas')).toBeNull();
    expect(container.querySelector('[data-depth-disabled="true"]')).not.toBeNull();
  });

  it('keeps the image visible when WebGL is unavailable', () => {
    const { container } = render(<DepthHero src="/hero.jpg" alt="Hero" />);

    expect(screen.getByAltText('Hero')).toHaveStyle({ opacity: 1 });
    expect(container.querySelector('canvas')).not.toBeNull();
    expect(container.querySelector('[data-depth-ready="false"]')).not.toBeNull();
  });
});
