import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PhotosPage from './PhotosPage';
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
      photosCount: 2,
    },
    {
      id: 'album-2',
      name: 'Cities',
      description: 'Urban work',
      coverPhotoId: 'photo-3',
      coverPhotoUrl: '/covers/cities.jpg',
      coverThumbnailUrl: '/covers/cities-thumb.jpg',
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
      id: 'photo-2',
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
      id: 'photo-3',
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

describe('PhotosPage', () => {
  beforeEach(() => {
    loadAlbumsMock.mockReset();
    loadPhotosMock.mockReset();
    adminFetchMock.mockReset();
    vi.restoreAllMocks();

    loadAlbumsMock.mockResolvedValue(createAlbums());
    loadPhotosMock.mockResolvedValue(createPhotos());
  });

  it('starts in browse mode and opens the editor only after clicking a photo', async () => {
    render(<PhotosPage />);

    expect(await screen.findByRole('button', { name: 'Browse all photos' })).toBeInTheDocument();
    expect(screen.queryByText('Edit photo')).not.toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: 'Open landscape.jpg' }));

    expect(await screen.findByText('Edit photo')).toBeInTheDocument();
  });

  it('shows album-first navigation and filters the grid by album', async () => {
    render(<PhotosPage />);

    expect(await screen.findByRole('button', { name: 'Open album Landscapes' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open album Cities' }));

    expect(screen.getByRole('button', { name: 'Open city.jpg' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open landscape.jpg' })).not.toBeInTheDocument();
  });

  it('saves the selected photo metadata', async () => {
    render(<PhotosPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Open landscape.jpg' }));

    adminFetchMock.mockResolvedValue({ ...createPhotos()[0], fileName: 'mountain-edited.jpg' });

    const saveButton = screen.getByRole('button', { name: 'Save photo' });
    const form = saveButton.closest('form');
    const fileNameInput = form?.querySelector('input[name="fileName"]') as HTMLInputElement;

    fireEvent.change(fileNameInput, { target: { value: 'mountain-edited.jpg' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(adminFetchMock).toHaveBeenCalledTimes(1);
    });

    const [path, init] = adminFetchMock.mock.calls[0];
    expect(path).toBe('/api/photos/photo-1');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(String(init.body))).toMatchObject({
      fileName: 'mountain-edited.jpg',
      albumId: 'album-1',
    });
    expect(await screen.findByText('Photo saved')).toBeInTheDocument();
  });

  it('supports ctrl-click multi-selection and bulk clear album', async () => {
    adminFetchMock.mockImplementation((path: string) => {
      if (path === '/api/photos/photo-1') {
        return Promise.resolve({ ...createPhotos()[0], albumId: null, albumName: null });
      }

      if (path === '/api/photos/photo-2') {
        return Promise.resolve({ ...createPhotos()[1], albumId: null, albumName: null });
      }

      return Promise.resolve(undefined);
    });

    render(<PhotosPage />);

    const firstPhoto = await screen.findByRole('button', { name: 'Open landscape.jpg' });
    const secondPhoto = screen.getByRole('button', { name: 'Open waterfall.jpg' });

    fireEvent.click(firstPhoto, { ctrlKey: true });
    fireEvent.click(secondPhoto, { ctrlKey: true });

    expect(screen.getByText('2 selected')).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox', { name: 'Bulk move destination' }), { target: { value: '__clear__' } });
      fireEvent.click(screen.getByRole('button', { name: 'Bulk move' }));
    });

    await waitFor(() => {
      expect(adminFetchMock).toHaveBeenCalledTimes(2);
    });

    const [, init] = adminFetchMock.mock.calls[0];
    expect(JSON.parse(String(init.body))).toMatchObject({ albumId: null });
  });

  it('updates album counts immediately after a bulk move', async () => {
    const user = userEvent.setup();
    adminFetchMock.mockResolvedValueOnce({ ...createPhotos()[0], albumId: 'album-2', albumName: 'Cities' });
    adminFetchMock.mockResolvedValueOnce({ ...createPhotos()[1], albumId: 'album-2', albumName: 'Cities' });

    render(<PhotosPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Open landscape.jpg' }), { ctrlKey: true });
    fireEvent.click(screen.getByRole('button', { name: 'Open waterfall.jpg' }), { ctrlKey: true });

    fireEvent.change(screen.getByRole('combobox', { name: 'Bulk move destination' }), { target: { value: 'album-2' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Bulk move' }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Open album Landscapes' })).toHaveTextContent('0 photos');
      expect(screen.getByRole('button', { name: 'Open album Cities' })).toHaveTextContent('3 photos');
    });
  });

  it('filters photos that are not in any album', async () => {
    loadPhotosMock.mockResolvedValue([
      ...createPhotos(),
      {
        id: 'photo-4',
        fileName: 'loose.jpg',
        albumId: null,
        albumName: null,
        url: '/photos/loose.jpg',
        thumbnailUrl: '/photos/loose-thumb.jpg',
        description: 'Loose photo',
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
    ]);

    render(<PhotosPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Browse photos with no album' }));

    expect(screen.getByRole('heading', { name: 'No album' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open loose.jpg' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open landscape.jpg' })).not.toBeInTheDocument();
  });

  it('can create a new album and move the selected photos into it', async () => {
    const user = userEvent.setup();
    adminFetchMock
      .mockResolvedValueOnce({
        id: 'album-3',
        name: 'Birds',
        description: 'Birding',
        coverPhotoId: null,
        coverPhotoUrl: null,
        coverThumbnailUrl: null,
        isPublished: false,
        photosCount: 0,
      })
      .mockResolvedValueOnce({ ...createPhotos()[0], albumId: 'album-3', albumName: 'Birds' })
      .mockResolvedValueOnce({ ...createPhotos()[1], albumId: 'album-3', albumName: 'Birds' });

    render(<PhotosPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Open landscape.jpg' }), { ctrlKey: true });
    fireEvent.click(screen.getByRole('button', { name: 'Open waterfall.jpg' }), { ctrlKey: true });

    fireEvent.change(screen.getByRole('combobox', { name: 'Bulk move destination' }), { target: { value: '__create__' } });
    fireEvent.click(screen.getByRole('button', { name: 'Bulk move' }));

    expect(screen.queryByText('Edit photo')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('New move album name'), 'Birds');
    await user.type(screen.getByLabelText('New move album description'), 'Birding');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(adminFetchMock).toHaveBeenCalledTimes(3);
    });

    expect(await screen.findByText('Album created and 2 photos moved')).toBeInTheDocument();
  });

  it('supports shift-click range selection', async () => {
    render(<PhotosPage />);

    const firstPhoto = await screen.findByRole('button', { name: 'Open landscape.jpg' });
    const secondPhoto = screen.getByRole('button', { name: 'Open waterfall.jpg' });

    fireEvent.click(firstPhoto);
    fireEvent.click(secondPhoto, { shiftKey: true });

    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('deletes the selected photos in bulk', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    adminFetchMock.mockResolvedValue(undefined);

    render(<PhotosPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Open landscape.jpg' }), { ctrlKey: true });
    fireEvent.click(screen.getByRole('button', { name: 'Open waterfall.jpg' }), { ctrlKey: true });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete selected' }));
    });

    await waitFor(() => {
      expect(adminFetchMock).toHaveBeenCalledWith('/api/photos/photo-1', { method: 'DELETE' });
      expect(adminFetchMock).toHaveBeenCalledWith('/api/photos/photo-2', { method: 'DELETE' });
    });

    expect(await screen.findByText('Deleted 2 photos')).toBeInTheDocument();
  });

  it('clears hidden selection when the search scope changes', async () => {
    render(<PhotosPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Open landscape.jpg' }), { ctrlKey: true });
    fireEvent.click(screen.getByRole('button', { name: 'Open waterfall.jpg' }), { ctrlKey: true });

    expect(screen.getByText('2 selected')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search photos' }), { target: { value: 'city' } });

    expect(screen.getByText('0 selected')).toBeInTheDocument();
  });
});
