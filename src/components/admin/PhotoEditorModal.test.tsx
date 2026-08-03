import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PhotoEditorModal from './PhotoEditorModal';
import type { AdminAlbum, AdminPhoto } from '../../pages/admin/types';

const photo: AdminPhoto = {
  id: 'p1',
  fileName: 'sunset.jpg',
  albumId: 'a1',
  albumName: 'Landscapes',
  url: '/photos/sunset.jpg',
  thumbnailUrl: '/photos/sunset-thumb.jpg',
  description: 'Golden hour',
  caption: 'Sunset over the bay',
  rating: 8,
  contentType: 'image/webp',
  width: 1200,
  height: 800,
  fileSizeBytes: 250000,
  takenAt: '2024-01-01T18:00:00Z',
  importedAt: '2024-01-02T00:00:00Z',
  location: 'Mournes',
  cameraModel: 'Sony A7',
  tags: ['sunset', 'sea'],
};

const albums: AdminAlbum[] = [
  { id: 'a1', name: 'Landscapes', description: null, coverPhotoId: null, coverPhotoUrl: null, coverThumbnailUrl: null, isPublished: true, photosCount: 1 },
  { id: 'a2', name: 'Cities', description: null, coverPhotoId: null, coverPhotoUrl: null, coverThumbnailUrl: null, isPublished: false, photosCount: 0 },
];

describe('PhotoEditorModal', () => {
  it('pre-fills the form from the photo', () => {
    render(<PhotoEditorModal photo={photo} albums={albums} saving={false} onSave={() => undefined} onClose={() => undefined} />);

    expect(screen.getByRole('heading', { name: 'Edit photo' })).toBeInTheDocument();
    expect(screen.getByLabelText('File name')).toHaveValue('sunset.jpg');
    expect(screen.getByLabelText('Description')).toHaveValue('Golden hour');
    expect(screen.getByLabelText('Location')).toHaveValue('Mournes');
    expect(screen.getByLabelText('Camera model')).toHaveValue('Sony A7');
    expect(screen.getByLabelText('Tags')).toHaveValue('sunset, sea');
    expect(screen.getByLabelText('Album')).toHaveValue('a1');
  });

  it('submits the edited payload on save', () => {
    const onSave = vi.fn();
    render(<PhotoEditorModal photo={photo} albums={albums} saving={false} onSave={onSave} onClose={() => undefined} />);

    fireEvent.change(screen.getByLabelText('File name'), { target: { value: 'beach.jpg' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New description' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Tags'), { target: { value: 'sunset, sea, waves' } });
    fireEvent.change(screen.getByLabelText('Album'), { target: { value: 'a2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save photo' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0];
    expect(payload.fileName).toBe('beach.jpg');
    expect(payload.description).toBe('New description');
    expect(payload.location).toBeNull();
    expect(payload.tags).toEqual(['sunset', 'sea', 'waves']);
    expect(payload.albumId).toBe('a2');
    expect(payload.fileSizeBytes).toBe(250000);
  });

  it('disables save while saving', () => {
    render(<PhotoEditorModal photo={photo} albums={albums} saving onSave={() => undefined} onClose={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Save photo' })).toBeDisabled();
  });

  it('renders the detected metadata panel', () => {
    render(<PhotoEditorModal photo={photo} albums={albums} saving={false} onSave={() => undefined} onClose={() => undefined} />);

    expect(screen.getByText('Detected metadata')).toBeInTheDocument();
    expect(screen.getByText('Mournes')).toBeInTheDocument();
    expect(screen.getByText('Sony A7')).toBeInTheDocument();
  });

  it('calls onClose', () => {
    const onClose = vi.fn();
    render(<PhotoEditorModal photo={photo} albums={albums} saving={false} onSave={() => undefined} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
