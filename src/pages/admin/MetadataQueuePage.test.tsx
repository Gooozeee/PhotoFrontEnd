import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import MetadataQueuePage from './MetadataQueuePage';
import type { AdminAlbum, AdminPhoto, MetadataQueueItem } from './types';

vi.mock('framer-motion', () => {
  const stripMotion = (props: Record<string, unknown> & { children?: ReactElement }) => {
    const { layout, initial, animate, exit, transition, ...rest } = props;
    return <div {...rest}>{props.children}</div>;
  };
  return {
    motion: {
      div: (props: Record<string, unknown> & { children?: ReactElement }) => stripMotion(props),
    },
    AnimatePresence: ({ children }: { children?: ReactElement }) => <>{children}</>,
  };
});

const loadAlbumsMock = vi.fn();
const loadPhotosMock = vi.fn();
const loadMetadataQueueMock = vi.fn();
const enqueueMetadataMock = vi.fn();
const resetMetadataQueueMock = vi.fn();

vi.mock('./api', () => ({
  loadAlbums: (...args: unknown[]) => loadAlbumsMock(...args),
  loadPhotos: (...args: unknown[]) => loadPhotosMock(...args),
  loadMetadataQueue: (...args: unknown[]) => loadMetadataQueueMock(...args),
  enqueueMetadata: (...args: unknown[]) => enqueueMetadataMock(...args),
  resetMetadataQueue: (...args: unknown[]) => resetMetadataQueueMock(...args),
}));

vi.mock('./AdminShell', () => ({
  AdminShell: ({ title, children }: any) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

function createQueue(): MetadataQueueItem[] {
  return [
    { photoId: 'p1', fileName: 'sunset.jpg', albumName: 'Landscapes', state: 'Pending', attempts: 0, lastAttemptAt: null, completedAt: null, lastError: null },
    { photoId: 'p2', fileName: 'car.jpg', albumName: 'Motor', state: 'Completed', attempts: 1, lastAttemptAt: '2024-01-01T10:00:00Z', completedAt: '2024-01-01T10:00:05Z', lastError: null },
    { photoId: 'p3', fileName: 'rain.jpg', albumName: 'Landscapes', state: 'Failed', attempts: 2, lastAttemptAt: '2024-01-01T11:00:00Z', completedAt: null, lastError: 'Gemini metadata generation failed (HTTP 429).' },
  ];
}

function createAlbums(): AdminAlbum[] {
  return [{ id: 'a1', name: 'Landscapes', description: null, coverPhotoId: null, coverPhotoUrl: null, coverThumbnailUrl: null, isPublished: true, photosCount: 1 }];
}

function createPhotos(): AdminPhoto[] {
  return [{ id: 'p1', fileName: 'sunset.jpg', albumId: 'a1', albumName: 'Landscapes', url: '/photos/sunset.jpg', thumbnailUrl: null, description: null, caption: null, rating: null, contentType: 'image/webp', width: 1000, height: 800, fileSizeBytes: 100, takenAt: '2024-01-01T00:00:00Z', importedAt: '2024-01-01T00:00:00Z', location: null, cameraModel: null, tags: [] }];
}

describe('MetadataQueuePage', () => {
  beforeEach(() => {
    loadAlbumsMock.mockReset();
    loadPhotosMock.mockReset();
    loadMetadataQueueMock.mockReset();
    enqueueMetadataMock.mockReset();
    resetMetadataQueueMock.mockReset();
    loadAlbumsMock.mockResolvedValue(createAlbums());
    loadPhotosMock.mockResolvedValue(createPhotos());
    loadMetadataQueueMock.mockResolvedValue(createQueue());
  });

  it('renders queue counts and job list', async () => {
    render(<MetadataQueuePage />);

    expect(await screen.findByText('AI Metadata')).toBeInTheDocument();
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getByText('sunset.jpg')).toBeInTheDocument();
    expect(screen.getByText('car.jpg')).toBeInTheDocument();
    expect(screen.getByText('Gemini metadata generation failed (HTTP 429).')).toBeInTheDocument();
    expect(screen.getByText('3 total')).toBeInTheDocument();
  });

  it('resets failed jobs and refreshes the queue', async () => {
    resetMetadataQueueMock.mockResolvedValue({ reset: 1 });
    render(<MetadataQueuePage />);

    await screen.findByText('sunset.jpg');
    fireEvent.click(screen.getByRole('button', { name: /Reset failed/ }));

    await waitFor(() => {
      expect(resetMetadataQueueMock).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('1 failed job reset to pending.')).toBeInTheDocument();
    expect(loadMetadataQueueMock).toHaveBeenCalledTimes(2);
  });

  it('queues missing metadata and refreshes the queue', async () => {
    enqueueMetadataMock.mockResolvedValue(undefined);
    render(<MetadataQueuePage />);

    await screen.findByText('sunset.jpg');
    fireEvent.click(screen.getByRole('button', { name: 'Queue missing' }));

    await waitFor(() => {
      expect(enqueueMetadataMock).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('Queued photos missing AI metadata.')).toBeInTheDocument();
    expect(loadMetadataQueueMock).toHaveBeenCalledTimes(2);
  });

  it('shows an error when loading the queue fails', async () => {
    loadMetadataQueueMock.mockRejectedValue(new Error('Request failed with 500'));
    render(<MetadataQueuePage />);

    expect(await screen.findByText('Request failed with 500')).toBeInTheDocument();
  });
});
