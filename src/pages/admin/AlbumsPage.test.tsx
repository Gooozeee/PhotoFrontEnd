import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AlbumsPage from './AlbumsPage';
import type { AdminAlbum, AdminPhoto } from './types';

const loadAlbumsMock = vi.fn();
const loadPhotosMock = vi.fn();
const adminFetchMock = vi.fn();

vi.mock('./api', () => ({
  loadAlbums: (...args: unknown[]) => loadAlbumsMock(...args),
  loadPhotos: (...args: unknown[]) => loadPhotosMock(...args),
  adminFetch: (...args: unknown[]) => adminFetchMock(...args),
}));

vi.mock('./AdminShell', () => ({
  AdminShell: ({ title, children }: any) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

function createAlbums(): AdminAlbum[] {
  return [
    {
      id: 'album-1',
      name: 'Landscapes',
      description: 'Outdoor work',
      coverPhotoId: 'photo-1',
      coverPhotoUrl: '/covers/landscapes.jpg',
      coverThumbnailUrl: '/covers/landscapes-thumb.jpg',
      isPublished: true,
      photosCount: 1,
    },
    {
      id: 'album-2',
      name: 'Cities',
      description: 'Urban work',
      coverPhotoId: null,
      coverPhotoUrl: null,
      coverThumbnailUrl: null,
      isPublished: false,
      photosCount: 1,
    },
  ];
}

function createPhotos(): AdminPhoto[] {
  return [
    {
      id: 'photo-1',
      fileName: 'landscape.jpg',
      albumId: 'album-1',
      albumName: 'Landscapes',
      url: '/photos/landscape.jpg',
      thumbnailUrl: '/photos/landscape-thumb.jpg',
      description: 'Mountain range',
      contentType: 'image/webp',
      width: 1200,
      height: 800,
      fileSizeBytes: 120,
      takenAt: '2024-01-01T00:00:00Z',
      importedAt: '2024-01-02T00:00:00Z',
      location: 'Mournes',
      cameraModel: 'Sony',
      tags: ['nature'],
    },
    {
      id: 'photo-3',
      fileName: 'waterfall.jpg',
      albumId: 'album-1',
      albumName: 'Landscapes',
      url: '/photos/waterfall.jpg',
      thumbnailUrl: '/photos/waterfall-thumb.jpg',
      description: 'Waterfall',
      contentType: 'image/webp',
      width: 900,
      height: 1200,
      fileSizeBytes: 130,
      takenAt: '2024-01-03T00:00:00Z',
      importedAt: '2024-01-04T00:00:00Z',
      location: 'Glenariff',
      cameraModel: 'Sony',
      tags: ['nature'],
    },
    {
      id: 'photo-2',
      fileName: 'city.jpg',
      albumId: 'album-2',
      albumName: 'Cities',
      url: '/photos/city.jpg',
      thumbnailUrl: '/photos/city-thumb.jpg',
      description: 'Street scene',
      contentType: 'image/webp',
      width: 1000,
      height: 700,
      fileSizeBytes: 110,
      takenAt: '2024-02-01T00:00:00Z',
      importedAt: '2024-02-02T00:00:00Z',
      location: 'Belfast',
      cameraModel: 'Canon',
      tags: ['urban'],
    },
  ];
}

describe('AlbumsPage', () => {
  beforeEach(() => {
    loadAlbumsMock.mockReset();
    loadPhotosMock.mockReset();
    adminFetchMock.mockReset();
    loadAlbumsMock.mockResolvedValue(createAlbums());
    loadPhotosMock.mockResolvedValue(createPhotos());
  });

  it('loads albums and saves the selected album', async () => {
    render(<AlbumsPage />);

    expect(await screen.findByText('Edit album')).toBeInTheDocument();

    adminFetchMock.mockResolvedValue({ ...createAlbums()[0], name: 'Updated Landscapes' });

    const saveButton = screen.getByRole('button', { name: 'Save album' });
    const form = saveButton.closest('form');
    const nameInput = form?.querySelector('input[name="name"]') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Updated Landscapes' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(adminFetchMock).toHaveBeenCalledTimes(1);
    });

    const [path, init] = adminFetchMock.mock.calls[0];
    expect(path).toBe('/api/albums/album-1');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(String(init.body))).toMatchObject({
      name: 'Updated Landscapes',
      isPublished: true,
      coverPhotoId: 'photo-1',
    });
    expect(await screen.findByText('Album saved')).toBeInTheDocument();
  });

  it('uses the set cover shortcut for the selected album without a separate save', async () => {
    render(<AlbumsPage />);

    expect(await screen.findByText('Photos in this album')).toBeInTheDocument();

    adminFetchMock.mockResolvedValue({ ...createAlbums()[0], coverPhotoId: 'photo-3' });

    fireEvent.click(screen.getAllByRole('button', { name: 'Set cover' })[1]);

    await waitFor(() => {
      expect(adminFetchMock).toHaveBeenCalledTimes(1);
    });

    const [, init] = adminFetchMock.mock.calls[0];
    expect(JSON.parse(String(init.body))).toMatchObject({ coverPhotoId: 'photo-3' });
    expect(await screen.findByText('Album cover updated')).toBeInTheDocument();
  });

  it('creates a new album', async () => {
    render(<AlbumsPage />);

    expect(await screen.findByText('All albums')).toBeInTheDocument();

    adminFetchMock.mockResolvedValue({
      id: 'album-3',
      name: 'Birds',
      description: 'Birding',
      coverPhotoId: null,
      coverPhotoUrl: null,
      coverThumbnailUrl: null,
      isPublished: false,
      photosCount: 0,
    });

    const createButton = screen.getByRole('button', { name: 'Create album' });
    const form = createButton.closest('form');
    const nameInput = form?.querySelector('input[name="name"]') as HTMLInputElement;
    const descriptionInput = form?.querySelector('input[name="description"]') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Birds' } });
    fireEvent.change(descriptionInput, { target: { value: 'Birding' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(adminFetchMock).toHaveBeenCalledTimes(1);
    });

    const [path, init] = adminFetchMock.mock.calls[0];
    expect(path).toBe('/api/albums');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toMatchObject({
      name: 'Birds',
      description: 'Birding',
      isPublished: false,
    });
    expect(await screen.findByText('Album created')).toBeInTheDocument();
    expect(screen.getByText('Birds')).toBeInTheDocument();
  });

  it('refreshes the edit form values when switching albums', async () => {
    render(<AlbumsPage />);

    expect(await screen.findByText('Edit album')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cities/i }));

    expect(screen.getByRole('textbox', { name: 'Album name' })).toHaveValue('Cities');
    expect(screen.getByRole('checkbox', { name: 'Publish this album' })).not.toBeChecked();
  });

  it('renders a cover placeholder for albums without a cover image', async () => {
    render(<AlbumsPage />);

    expect(await screen.findByText('All albums')).toBeInTheDocument();

    expect(screen.getByText('No cover yet')).toBeInTheDocument();
  });

  it('shows load errors from the admin api', async () => {
    loadAlbumsMock.mockRejectedValue(new Error('Failed to load albums'));

    render(<AlbumsPage />);

    expect(await screen.findByText('Failed to load albums')).toBeInTheDocument();
  });
});
