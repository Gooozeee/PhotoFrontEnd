import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LibraryPage from './LibraryPage';
import type { AdminAlbum, AdminPhoto } from './types';

const loadAlbumsMock = vi.fn();
const loadPhotosMock = vi.fn();
const createAlbumMock = vi.fn();
const updateAlbumMock = vi.fn();
const deleteAlbumMock = vi.fn();
const updatePhotoMock = vi.fn();
const deletePhotoMock = vi.fn();
const uploadPhotoMock = vi.fn();

vi.mock('./api', () => ({
  loadAlbums: (...args: unknown[]) => loadAlbumsMock(...args),
  loadPhotos: (...args: unknown[]) => loadPhotosMock(...args),
  createAlbum: (...args: unknown[]) => createAlbumMock(...args),
  updateAlbum: (...args: unknown[]) => updateAlbumMock(...args),
  deleteAlbum: (...args: unknown[]) => deleteAlbumMock(...args),
  updatePhoto: (...args: unknown[]) => updatePhotoMock(...args),
  deletePhoto: (...args: unknown[]) => deletePhotoMock(...args),
  uploadPhoto: (...args: unknown[]) => uploadPhotoMock(...args),
}));

vi.mock('./AdminShell', () => ({
  AdminShell: ({ title, children }: { title: string; children: React.ReactNode }) => (
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
      name: 'Travel',
      description: null,
      coverPhotoId: null,
      coverPhotoUrl: null,
      coverThumbnailUrl: null,
      isPublished: true,
      photosCount: 1,
    },
    {
      id: 'album-2',
      name: 'Travel/Thailand',
      description: null,
      coverPhotoId: null,
      coverPhotoUrl: null,
      coverThumbnailUrl: null,
      isPublished: false,
      photosCount: 0,
    },
    {
      id: 'album-3',
      name: 'Cities',
      description: null,
      coverPhotoId: null,
      coverPhotoUrl: null,
      coverThumbnailUrl: null,
      isPublished: true,
      photosCount: 0,
    },
  ];
}

function createPhotos(): AdminPhoto[] {
  return [
    {
      id: 'photo-1',
      fileName: 'beach.jpg',
      albumId: 'album-1',
      albumName: 'Travel',
      url: '/photos/beach.jpg',
      thumbnailUrl: '/photos/beach-thumb.jpg',
      description: 'Beach',
      caption: null,
      rating: 8,
      contentType: 'image/webp',
      width: 1000,
      height: 800,
      fileSizeBytes: 200,
      takenAt: '2024-01-01T00:00:00Z',
      importedAt: '2024-01-01T00:00:00Z',
      location: null,
      cameraModel: null,
      tags: [],
    },
    {
      id: 'photo-2',
      fileName: 'loose.jpg',
      albumId: null,
      albumName: null,
      url: '/photos/loose.jpg',
      thumbnailUrl: null,
      description: null,
      caption: null,
      rating: null,
      contentType: 'image/webp',
      width: 800,
      height: 600,
      fileSizeBytes: 100,
      takenAt: '2024-01-02T00:00:00Z',
      importedAt: '2024-01-02T00:00:00Z',
      location: null,
      cameraModel: null,
      tags: [],
    },
  ];
}

function renderLibraryPage() {
  return render(
    <MemoryRouter>
      <LibraryPage />
    </MemoryRouter>
  );
}

describe('LibraryPage', () => {
  beforeEach(() => {
    loadAlbumsMock.mockReset();
    loadPhotosMock.mockReset();
    createAlbumMock.mockReset();
    updateAlbumMock.mockReset();
    deleteAlbumMock.mockReset();
    updatePhotoMock.mockReset();
    deletePhotoMock.mockReset();
    uploadPhotoMock.mockReset();
    loadAlbumsMock.mockResolvedValue(createAlbums());
    loadPhotosMock.mockResolvedValue(createPhotos());
  });

  it('renders the folder tree and root photos', async () => {
    renderLibraryPage();

    expect(await screen.findByRole('heading', { name: 'Library' })).toBeInTheDocument();
    expect(screen.getAllByText('Travel').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cities').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /loose\.jpg/ })).toBeInTheDocument();
  });

  it('opens a folder and shows its photos', async () => {
    renderLibraryPage();

    await screen.findByRole('heading', { name: 'Library' });
    fireEvent.click(screen.getByRole('button', { name: /Open folder Travel/i }));

    expect(await screen.findByRole('button', { name: /beach\.jpg/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /loose\.jpg/ })).not.toBeInTheDocument();
  });

  it('selects a photo with ctrl-click', async () => {
    renderLibraryPage();

    await screen.findByRole('heading', { name: 'Library' });
    fireEvent.click(screen.getByRole('button', { name: /loose\.jpg/ }), { ctrlKey: true });

    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('opens the photo editor on double click', async () => {
    renderLibraryPage();

    await screen.findByRole('heading', { name: 'Library' });
    fireEvent.doubleClick(screen.getByRole('button', { name: /loose\.jpg/ }));

    expect(screen.getByRole('heading', { name: 'Edit photo' })).toBeInTheDocument();
  });

  it('creates a new album from the toolbar', async () => {
    const created = { ...createAlbums()[0], id: 'album-4', name: 'New album', photosCount: 0 };
    createAlbumMock.mockResolvedValue(created);
    renderLibraryPage();

    await screen.findByRole('heading', { name: 'Library' });
    fireEvent.click(screen.getByRole('button', { name: 'New album' }));

    expect(screen.getByRole('heading', { name: /New album in "All albums"/ })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Album name'), { target: { value: 'Mountains' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(createAlbumMock).toHaveBeenCalledWith({ name: 'Mountains', description: '', isPublished: false });
    });
  });

  it('moves selected photos into a folder via the context menu', async () => {
    updatePhotoMock.mockImplementation(async (id: string, payload: { albumId: string | null }) => ({
      ...createPhotos().find((photo) => photo.id === id)!,
      albumId: payload.albumId,
      albumName: 'Cities',
    }));
    renderLibraryPage();

    await screen.findByRole('heading', { name: 'Library' });
    fireEvent.click(screen.getByRole('button', { name: /loose\.jpg/ }), { ctrlKey: true });

    const photoButton = screen.getByRole('button', { name: /loose\.jpg/ });
    fireEvent.contextMenu(photoButton, { clientX: 100, clientY: 80 });

    fireEvent.click(screen.getByRole('menuitem', { name: 'Move to folder…' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Move to Cities' }));

    await waitFor(() => {
      expect(updatePhotoMock).toHaveBeenCalledWith('photo-2', expect.objectContaining({ albumId: 'album-3' }));
    });
  });

  it('opens the delete confirmation and deletes the selected photo', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    deletePhotoMock.mockResolvedValue(undefined);
    renderLibraryPage();

    await screen.findByRole('heading', { name: 'Library' });
    fireEvent.click(screen.getByRole('button', { name: /loose\.jpg/ }), { ctrlKey: true });
    fireEvent.click(screen.getByRole('button', { name: 'Delete selected' }));

    await waitFor(() => {
      expect(deletePhotoMock).toHaveBeenCalledWith('photo-2');
    });
    expect(screen.queryByRole('button', { name: /loose\.jpg/ })).not.toBeInTheDocument();
  });

  it('renames an album through the context menu', async () => {
    updateAlbumMock.mockResolvedValue({ ...createAlbums()[0], name: 'Adventures' });
    renderLibraryPage();

    await screen.findByRole('heading', { name: 'Library' });
    fireEvent.click(screen.getByRole('button', { name: /Open folder Travel/i }));

    await screen.findByRole('button', { name: /beach\.jpg/ });
    const travelFolder = screen.getByRole('button', { name: /Open folder Travel/i });
    fireEvent.contextMenu(travelFolder, { clientX: 100, clientY: 80 });

    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));

    expect(screen.getByRole('heading', { name: /Rename "Travel"/ })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Album name'), { target: { value: 'Adventures' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(updateAlbumMock).toHaveBeenCalledWith('album-1', expect.objectContaining({ name: 'Adventures' }));
    });
  });
});
