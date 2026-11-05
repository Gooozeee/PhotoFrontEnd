import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BestShots from './BestShots';

type TestPhoto = {
  id: string;
  fileName: string;
  albumId: string | null;
  albumName: string | null;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  description: string | null;
  rating: number | null;
  width: number;
  height: number;
  tags: string[];
};

function makePhoto(overrides: Partial<TestPhoto> = {}): TestPhoto {
  return {
    id: 'h1',
    fileName: 'sunset.jpg',
    albumId: 'a1',
    albumName: 'Landscapes',
    url: 'sunset.webp',
    thumbnailUrl: 'sunset-thumb.webp',
    caption: 'Sunset over the bay',
    description: null,
    rating: 9,
    width: 1200,
    height: 800,
    tags: ['landscape'],
    ...overrides,
  };
}

const highlightsState = vi.hoisted(() => ({
  photos: [] as TestPhoto[],
  loading: false,
}));

vi.mock('../hooks/useDiscovery', () => ({
  useHighlights: () => ({
    photos: highlightsState.photos,
    loading: highlightsState.loading,
    error: null,
  }),
}));

vi.mock('./ImageModal', () => ({
  default: ({
    imageIndex,
    totalImages,
    photoId,
    onClose,
    onNext,
    onPrev,
  }: {
    imageIndex?: number;
    totalImages?: number;
    photoId?: string | null;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
  }) => (
    <div role="dialog" aria-label="Image viewer">
      <span>{photoId}</span>
      <span data-testid="position">{imageIndex} / {totalImages}</span>
      <button type="button" onClick={onClose}>close modal</button>
      <button type="button" onClick={onNext}>next photo</button>
      <button type="button" onClick={onPrev}>prev photo</button>
    </div>
  ),
}));

const DEFAULT_PHOTOS: TestPhoto[] = [
  makePhoto(),
  makePhoto({
    id: 'h2',
    fileName: 'portrait.jpg',
    albumId: 'a2',
    albumName: 'Portraits',
    url: 'portrait.webp',
    thumbnailUrl: null,
    caption: null,
    description: 'A quiet portrait',
    rating: 8,
    width: 800,
    height: 1200,
    tags: ['portrait'],
  }),
];

describe('BestShots', () => {
  beforeEach(() => {
    highlightsState.photos = DEFAULT_PHOTOS.map((photo) => ({ ...photo }));
    highlightsState.loading = false;
  });

  it('renders a short edit without exposing ratings', () => {
    render(<BestShots limit={2} />);

    expect(screen.getByText('Best shots')).toBeInTheDocument();
    expect(screen.getByText('A short edit from across the archive.')).toBeInTheDocument();
    expect(screen.getByAltText('Sunset over the bay')).toBeInTheDocument();
    expect(screen.getByAltText('A quiet portrait')).toBeInTheDocument();
    expect(screen.getByText(/Landscapes/)).toBeInTheDocument();
    expect(screen.getByText(/Portraits/)).toBeInTheDocument();
    expect(screen.queryByText(/\d+ \/ 10/)).not.toBeInTheDocument();
    expect(screen.queryByText(/rated/i)).not.toBeInTheDocument();
  });

  it('renders nothing when there are no shots', () => {
    highlightsState.photos = [];
    const { container } = render(<BestShots />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows a loading state while the request is in flight', () => {
    highlightsState.photos = [];
    highlightsState.loading = true;
    render(<BestShots />);

    expect(screen.getByText('Loading the short edit.')).toBeInTheDocument();
  });

  it('spreads the edit across series before repeating one', () => {
    highlightsState.photos = [
      makePhoto({ id: 'd1', albumId: 'd', albumName: 'Daikoku', caption: 'Daikoku one' }),
      makePhoto({ id: 'd2', albumId: 'd', albumName: 'Daikoku', caption: 'Daikoku two' }),
      makePhoto({ id: 'm1', albumId: 'm', albumName: 'Malta', caption: 'Malta one' }),
    ];

    render(<BestShots limit={2} />);

    const labels = screen.getAllByRole('button', { name: /^Open / }).map((button) => button.getAttribute('aria-label'));
    expect(labels).toEqual(['Open Daikoku one', 'Open Malta one']);
  });

  it('opens the modal for the selected shot and navigates the edit', () => {
    render(<BestShots limit={2} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Sunset over the bay' }));

    expect(screen.getByRole('dialog', { name: 'Image viewer' })).toBeInTheDocument();
    expect(screen.getByText('h1')).toBeInTheDocument();
    expect(screen.getByTestId('position')).toHaveTextContent('1 / 2');

    fireEvent.click(screen.getByRole('button', { name: 'next photo' }));
    expect(screen.getByTestId('position')).toHaveTextContent('2 / 2');

    fireEvent.click(screen.getByRole('button', { name: 'next photo' }));
    expect(screen.getByTestId('position')).toHaveTextContent('1 / 2');

    fireEvent.click(screen.getByRole('button', { name: 'prev photo' }));
    expect(screen.getByTestId('position')).toHaveTextContent('2 / 2');
  });

  it('closes the modal', () => {
    render(<BestShots limit={2} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open A quiet portrait' }));
    fireEvent.click(screen.getByRole('button', { name: 'close modal' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
