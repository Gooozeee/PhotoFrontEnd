import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UploadProgressBanner } from './UploadProgressBanner';

describe('UploadProgressBanner', () => {
  it('shows batch and current-file progress', () => {
    render(
      <UploadProgressBanner
        total={4}
        completed={1}
        failed={1}
        currentFileName="sunset.jpg"
        currentPercent={42}
      />,
    );

    expect(screen.getByText('Upload in progress')).toBeInTheDocument();
    expect(screen.getByText('3 files left · 1 of 4 done · 1 failure')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('sunset.jpg')).toBeInTheDocument();
    expect(screen.getByText('42% sent')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Batch upload progress' })).toHaveAttribute('aria-valuenow', '25');
  });

  it('explains that a fully sent file is still processing on the server', () => {
    render(
      <UploadProgressBanner total={2} completed={1} currentFileName="large.jpg" currentPercent={100} />,
    );

    expect(screen.getByText('Upload sent. Processing on the server…')).toBeInTheDocument();
  });

  it('renders nothing when there is no batch', () => {
    const { container } = render(<UploadProgressBanner total={0} completed={0} />);

    expect(container).toBeEmptyDOMElement();
  });
});
