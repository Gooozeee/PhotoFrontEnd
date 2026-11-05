import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SoftwareEngineeringPage from './SoftwareEngineeringPage';

describe('SoftwareEngineeringPage', () => {
  it('explains the system without the old boasting', () => {
    render(<SoftwareEngineeringPage />);

    expect(screen.getByRole('heading', { name: /How this site works/i })).toBeInTheDocument();
    expect(screen.queryByText(/I built the whole thing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/best rated/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/rating/i)).not.toBeInTheDocument();
    expect(screen.getByText('The pieces that run')).toBeInTheDocument();
    expect(screen.getByText('Captions leave the request path')).toBeInTheDocument();
    expect(screen.getByText('Decision, reason, cost')).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('\u2014');
  });

  it('gives every part a trade-off and every decision a reason and a cost', () => {
    render(<SoftwareEngineeringPage />);

    expect(screen.getAllByText('Trade-off')).toHaveLength(10);
    expect(screen.getByText('Queue in Postgres')).toBeInTheDocument();
    expect(screen.getByText('Synchronous uploads')).toBeInTheDocument();
    expect(screen.getAllByText('Why')).toHaveLength(4);
    expect(screen.getAllByText('Cost')).toHaveLength(4);
    expect(screen.getByText('Known limits')).toBeInTheDocument();
  });
});
