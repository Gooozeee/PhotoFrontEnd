import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import UploadPage from './UploadPage';
import type { AdminAlbum, AdminPhoto } from './types';

const loadAlbumsMock = vi.fn();
const loadPhotosMock = vi.fn();
const adminFetchMock = vi.fn();
const uploadPhotoWithProgressMock = vi.fn();
const createObjectUrlMock = vi.fn();
const revokeObjectUrlMock = vi.fn();

function LocationProbe() {
  const location = useLocation();

  return <div>{`${location.pathname}${location.search}`}</div>;
}

vi.mock('./api', () => ({
  loadAlbums: (...args: unknown[]) => loadAlbumsMock(...args),
  loadPhotos: (...args: unknown[]) => loadPhotosMock(...args),
  adminFetch: (...args: unknown[]) => adminFetchMock(...args),
  uploadPhotoWithProgress: (...args: unknown[]) => uploadPhotoWithProgressMock(...args),
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
      caption: null,
      rating: null,
      contentType: 'image/webp',
      width: 1200,
      height: 800,
      fileSizeBytes: 120,
      takenAt: '2024-01-01T00:00:00Z',
      importedAt: '2024-01-02T00:00:00Z',
      location: null,
      cameraModel: null,
      tags: [],
    },
    {
      id: 'photo-2',
      fileName: 'city.jpg',
      albumId: null,
      albumName: null,
      url: '/photos/city.jpg',
      thumbnailUrl: '/photos/city-thumb.jpg',
      description: 'City night lights',
      caption: null,
      rating: null,
      contentType: 'image/webp',
      width: 800,
      height: 1200,
      fileSizeBytes: 240,
      takenAt: '2024-02-01T00:00:00Z',
      importedAt: '2024-02-02T00:00:00Z',
      location: 'Paris',
      cameraModel: 'Leica Q2',
      tags: ['night'],
    },
  ];
}

describe('UploadPage', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrlMock,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrlMock,
    });

    loadAlbumsMock.mockReset();
    loadPhotosMock.mockReset();
    adminFetchMock.mockReset();
    uploadPhotoWithProgressMock.mockReset();
    createObjectUrlMock.mockReset();
    revokeObjectUrlMock.mockReset();
    createObjectUrlMock.mockImplementation((file: File) => `blob:${file.name}`);
    loadAlbumsMock.mockResolvedValue(createAlbums());
    loadPhotosMock.mockResolvedValue(createPhotos());
  });

  async function renderUploadPage() {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/admin/upload']}>
          <Routes>
            <Route path="/admin/upload" element={<UploadPage />} />
            <Route path="/admin/photos" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(await screen.findByText('Batch upload')).toBeInTheDocument();
    expect(await screen.findByText('landscape.jpg')).toBeInTheDocument();
  }

  it('uploads queued photos automatically one at a time using the selected album', async () => {
    const user = userEvent.setup();
    uploadPhotoWithProgressMock
      .mockResolvedValueOnce({
        ...createPhotos()[0],
        id: 'photo-3',
        fileName: 'fresh-1.jpg',
        albumId: 'album-1',
        albumName: 'Landscapes',
        exifStatus: {
          hasTakenAt: true,
          hasLocation: false,
          hasCameraModel: true,
        },
      })
      .mockResolvedValueOnce({
        ...createPhotos()[0],
        id: 'photo-4',
        fileName: 'fresh-2.jpg',
        albumId: 'album-1',
        albumName: 'Landscapes',
      });

    await renderUploadPage();

    await act(async () => {
      await user.selectOptions(screen.getByLabelText('Upload album'), 'album-1');
      await user.upload(screen.getByLabelText('Queue photos'), [
        new File(['image-1'], 'fresh-1.jpg', { type: 'image/jpeg' }),
        new File(['image-2'], 'fresh-2.jpg', { type: 'image/jpeg' }),
      ]);
    });

    await waitFor(() => {
      expect(uploadPhotoWithProgressMock).toHaveBeenCalledTimes(2);
    });

    const [firstFormData] = uploadPhotoWithProgressMock.mock.calls[0];
    expect(firstFormData).toBeInstanceOf(FormData);
    expect((firstFormData.get('file') as File).name).toBe('fresh-1.jpg');
    expect(firstFormData.get('albumId')).toBe('album-1');

    const [secondFormData] = uploadPhotoWithProgressMock.mock.calls[1];
    expect((secondFormData.get('file') as File).name).toBe('fresh-2.jpg');
    expect(secondFormData.get('albumId')).toBe('album-1');

    expect(await screen.findByText('/admin/photos?review=photo-3%2Cphoto-4')).toBeInTheDocument();
  });

  it('shows upload progress bars while a file is uploading', async () => {
    const user = userEvent.setup();
    let releaseUpload: (value: unknown) => void = () => undefined;
    uploadPhotoWithProgressMock.mockImplementation((_formData: unknown, onProgress: unknown) => {
      (onProgress as (p: number) => void)(42);
      return new Promise((resolve) => {
        releaseUpload = resolve;
      });
    });

    await renderUploadPage();

    await act(async () => {
      await user.upload(screen.getByLabelText('Queue photos'), [
        new File(['image-1'], 'prog.jpg', { type: 'image/jpeg' }),
      ]);
    });

    expect(await screen.findByText('Batch progress')).toBeInTheDocument();
    expect(screen.getByText('0 of 1 · 0%')).toBeInTheDocument();
    expect(screen.getByText('Current file')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('42% uploaded')).toBeInTheDocument();

    await act(async () => {
      releaseUpload({
        ...createPhotos()[0],
        id: 'photo-3',
        fileName: 'prog.jpg',
      });
    });

    expect(await screen.findByText('/admin/photos?review=photo-3')).toBeInTheDocument();
  });

  it('can create a new batch album before queueing files', async () => {
    const user = userEvent.setup();
    adminFetchMock.mockResolvedValueOnce({
      id: 'album-2',
      name: 'Birds',
      description: 'Birding',
      coverPhotoId: null,
      coverPhotoUrl: null,
      coverThumbnailUrl: null,
      isPublished: false,
      photosCount: 0,
    });
    uploadPhotoWithProgressMock.mockResolvedValueOnce({
      ...createPhotos()[0],
      id: 'photo-3',
      fileName: 'bird.jpg',
      albumId: 'album-2',
      albumName: 'Birds',
    });

    await renderUploadPage();

    await user.click(screen.getByRole('button', { name: 'Create album' }));
    await user.type(screen.getByLabelText('New batch album name'), 'Birds');
    await user.type(screen.getByLabelText('New batch album description'), 'Birding');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Album created. The next batch will upload into Birds.')).toBeInTheDocument();

    await act(async () => {
      await user.upload(screen.getByLabelText('Queue photos'), [
        new File(['image-1'], 'bird.jpg', { type: 'image/jpeg' }),
      ]);
    });

    await waitFor(() => {
      expect(uploadPhotoWithProgressMock).toHaveBeenCalledTimes(1);
    });

    const [formData] = uploadPhotoWithProgressMock.mock.calls[0];
    expect((formData as FormData).get('albumId')).toBe('album-2');
  });

  it('allows retrying a failed upload', async () => {
    const user = userEvent.setup();
    uploadPhotoWithProgressMock
      .mockRejectedValueOnce(new Error('Upload failed'))
      .mockResolvedValueOnce({
        ...createPhotos()[0],
        id: 'photo-3',
        fileName: 'retry.jpg',
      });

    await renderUploadPage();

    await act(async () => {
      await user.upload(screen.getByLabelText('Queue photos'), [
        new File(['image-1'], 'retry.jpg', { type: 'image/jpeg' }),
      ]);
    });

    expect((await screen.findAllByText('Upload failed')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Retry failed' }));
    });

    await waitFor(() => {
      expect(uploadPhotoWithProgressMock).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText('/admin/photos?review=photo-3')).toBeInTheDocument();
  });

  it('marks malformed upload responses as failed instead of crashing', async () => {
    const user = userEvent.setup();
    uploadPhotoWithProgressMock.mockResolvedValue(undefined);

    await renderUploadPage();

    await act(async () => {
      await user.upload(screen.getByLabelText('Queue photos'), [
        new File(['image-1'], 'broken.jpg', { type: 'image/jpeg' }),
      ]);
    });

    expect((await screen.findAllByText('Upload failed')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);
  });

  it('reports per-run completion counts when older uploads remain in queue history', async () => {
    const user = userEvent.setup();
    uploadPhotoWithProgressMock
      .mockResolvedValueOnce({
        ...createPhotos()[0],
        id: 'photo-3',
        fileName: 'first.jpg',
      })
      .mockResolvedValueOnce({
        ...createPhotos()[0],
        id: 'photo-4',
        fileName: 'second.jpg',
      });

    await renderUploadPage();

    await act(async () => {
      await user.upload(screen.getByLabelText('Queue photos'), [
        new File(['image-1'], 'first.jpg', { type: 'image/jpeg' }),
      ]);
    });

    expect(await screen.findByText('/admin/photos?review=photo-3')).toBeInTheDocument();
  });

  it('shows detected metadata for a selected recent upload', async () => {
    await renderUploadPage();

    expect(await screen.findByText('Recent uploads')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /landscape\.jpg/i }));

    expect(screen.getByText('Detected metadata')).toBeInTheDocument();
    expect(screen.getAllByText('Not detected')).toHaveLength(2);
    expect(screen.getByText('1200 × 800')).toBeInTheDocument();
  });

  it('shows load errors from the upload dashboard', async () => {
    loadAlbumsMock.mockRejectedValue(new Error('Failed to load upload data'));

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/admin/upload']}>
          <Routes>
            <Route path="/admin/upload" element={<UploadPage />} />
            <Route path="/admin/photos" element={<div>photo manager</div>} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(await screen.findByText('Failed to load upload data')).toBeInTheDocument();
  });

  it('opens the photo manager after a batch upload completes', async () => {
    const user = userEvent.setup();
    uploadPhotoWithProgressMock.mockResolvedValue({
      ...createPhotos()[0],
      id: 'photo-3',
      fileName: 'review.jpg',
      albumId: 'album-1',
      albumName: 'Landscapes',
    });

    await renderUploadPage();

    await act(async () => {
      await user.upload(screen.getByLabelText('Queue photos'), [
        new File(['image-1'], 'review.jpg', { type: 'image/jpeg' }),
      ]);
    });

    await waitFor(() => {
      expect(screen.getByText('/admin/photos?review=photo-3')).toBeInTheDocument();
    });
  });
});
