import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AlbumDialog from './AlbumDialog';
import type { AdminAlbum } from '../../pages/admin/types';

const album: AdminAlbum = {
  id: 'a1',
  name: 'Landscapes',
  description: 'Nature shots',
  coverPhotoId: null,
  coverPhotoUrl: null,
  coverThumbnailUrl: null,
  isPublished: true,
  photosCount: 3,
};

describe('AlbumDialog', () => {
  it('renders an empty form for a new album', () => {
    render(<AlbumDialog title="New album" album={null} saving={false} onSave={() => undefined} onClose={() => undefined} />);

    expect(screen.getByRole('heading', { name: 'New album' })).toBeInTheDocument();
    expect(screen.getByLabelText('Album name')).toHaveValue('');
    expect(screen.getByLabelText('Album description')).toHaveValue('');
    expect(screen.getByRole('checkbox', { name: /Published/ })).not.toBeChecked();
  });

  it('pre-fills values when editing an existing album', () => {
    render(<AlbumDialog title="Rename" album={album} saving={false} onSave={() => undefined} onClose={() => undefined} />);

    expect(screen.getByLabelText('Album name')).toHaveValue('Landscapes');
    expect(screen.getByLabelText('Album description')).toHaveValue('Nature shots');
    expect(screen.getByRole('checkbox', { name: /Published/ })).toBeChecked();
  });

  it('emits name, description and publish state on save', () => {
    const onSave = vi.fn();
    render(<AlbumDialog title="New album" album={null} saving={false} onSave={onSave} onClose={() => undefined} />);

    fireEvent.change(screen.getByLabelText('Album name'), { target: { value: 'Cities' } });
    fireEvent.change(screen.getByLabelText('Album description'), { target: { value: 'Urban shots' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Published/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith({ name: 'Cities', description: 'Urban shots', isPublished: true });
  });

  it('disables save for a blank name', () => {
    render(<AlbumDialog title="New album" album={null} saving={false} onSave={() => undefined} onClose={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('shows the delete button only when onDelete is provided', () => {
    const { rerender } = render(<AlbumDialog title="Rename" album={album} saving={false} onSave={() => undefined} onClose={() => undefined} />);
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();

    rerender(<AlbumDialog title="Rename" album={album} saving={false} onSave={() => undefined} onDelete={() => undefined} onClose={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('invokes onDelete and onClose', () => {
    const onDelete = vi.fn();
    const onClose = vi.fn();
    render(<AlbumDialog title="Rename" album={album} saving={false} onSave={() => undefined} onDelete={onDelete} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('disables buttons while saving', () => {
    render(<AlbumDialog title="Rename" album={album} saving onSave={() => undefined} onClose={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Working...' })).toBeDisabled();
  });
});
