import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SoftwareEngineeringPage from './SoftwareEngineeringPage';

describe('SoftwareEngineeringPage', () => {
  it('gives a concise portfolio overview without the old boasting', () => {
    render(<SoftwareEngineeringPage />);

    expect(screen.getByRole('heading', { name: /How this site works/i })).toBeInTheDocument();
    expect(screen.queryByText(/I built the whole thing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/best rated/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/rating/i)).not.toBeInTheDocument();
    expect(screen.getByText('A photo archive with an admin side.')).toBeInTheDocument();
    expect(screen.getByText('The pieces.')).toBeInTheDocument();
    expect(screen.getByText('How a photo gets there.')).toBeInTheDocument();
    expect(screen.getByText('Why these choices.')).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('\u2014');
  });

  it('shows the four steps and four decisions', () => {
    render(<SoftwareEngineeringPage />);

    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Store')).toBeInTheDocument();
    expect(screen.getByText('Caption')).toBeInTheDocument();
    expect(screen.getByText('Read')).toBeInTheDocument();

    expect(screen.getByText('Postgres queue')).toBeInTheDocument();
    expect(screen.getByText('Sequential uploads')).toBeInTheDocument();
    expect(screen.getByText('Three WebP sizes')).toBeInTheDocument();
    expect(screen.getByText('One API')).toBeInTheDocument();
    expect(screen.getAllByText('Why')).toHaveLength(4);
    expect(screen.getAllByText('Cost')).toHaveLength(4);
  });
});
