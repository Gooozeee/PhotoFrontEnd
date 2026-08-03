import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FolderTree from './FolderTree';
import { buildAlbumTree } from '../../utils/buildAlbumTree';
import type { AdminAlbum } from '../../pages/admin/types';

function album(id: string, name: string, photosCount = 0): AdminAlbum {
  return {
    id,
    name,
    description: null,
    coverPhotoId: null,
    coverPhotoUrl: null,
    coverThumbnailUrl: null,
    isPublished: false,
    photosCount,
  };
}

describe('FolderTree', () => {
  it('renders top-level folders', () => {
    const tree = buildAlbumTree([album('a', 'Travel')]);
    render(<FolderTree nodes={tree} expanded={new Set()} selectedPath={[]} onToggle={() => undefined} onSelect={() => undefined} onFolderContextMenu={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Open folder Travel' })).toBeInTheDocument();
  });

  it('shows nested folders only when expanded', () => {
    const tree = buildAlbumTree([album('a', 'Travel/Thailand')]);
    render(<FolderTree nodes={tree} expanded={new Set()} selectedPath={[]} onToggle={() => undefined} onSelect={() => undefined} onFolderContextMenu={() => undefined} />);

    expect(screen.queryByRole('button', { name: 'Open folder Thailand' })).not.toBeInTheDocument();

    render(<FolderTree nodes={tree} expanded={new Set(['Travel'])} selectedPath={[]} onToggle={() => undefined} onSelect={() => undefined} onFolderContextMenu={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Open folder Thailand' })).toBeInTheDocument();
  });

  it('toggles expansion', () => {
    const tree = buildAlbumTree([album('a', 'Travel/Thailand')]);
    const onToggle = vi.fn();
    render(<FolderTree nodes={tree} expanded={new Set()} selectedPath={[]} onToggle={onToggle} onSelect={() => undefined} onFolderContextMenu={() => undefined} />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand Travel' }));

    expect(onToggle).toHaveBeenCalledWith(['Travel']);
  });

  it('selects a folder on click', () => {
    const tree = buildAlbumTree([album('a', 'Travel')]);
    const onSelect = vi.fn();
    render(<FolderTree nodes={tree} expanded={new Set()} selectedPath={[]} onSelect={onSelect} onToggle={() => undefined} onFolderContextMenu={() => undefined} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open folder Travel' }));

    expect(onSelect).toHaveBeenCalledWith(['Travel']);
  });

  it('opens a context menu on right-click', () => {
    const tree = buildAlbumTree([album('a', 'Travel')]);
    const onFolderContextMenu = vi.fn();
    render(<FolderTree nodes={tree} expanded={new Set()} selectedPath={[]} onSelect={() => undefined} onToggle={() => undefined} onFolderContextMenu={onFolderContextMenu} />);

    fireEvent.contextMenu(screen.getByRole('button', { name: 'Open folder Travel' }), { clientX: 50, clientY: 60 });

    expect(onFolderContextMenu).toHaveBeenCalledWith(['Travel'], 50, 60);
  });

  it('highlights the selected folder', () => {
    const tree = buildAlbumTree([album('a', 'Travel')]);
    render(<FolderTree nodes={tree} expanded={new Set()} selectedPath={['Travel']} onSelect={() => undefined} onToggle={() => undefined} onFolderContextMenu={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Open folder Travel' })).toHaveClass('bg-white/15');
  });

  it('shows photo counts on folders', () => {
    const tree = buildAlbumTree([album('a', 'Travel', 7)]);
    render(<FolderTree nodes={tree} expanded={new Set()} selectedPath={[]} onSelect={() => undefined} onToggle={() => undefined} onFolderContextMenu={() => undefined} />);

    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
