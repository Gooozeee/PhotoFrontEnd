import { IoChevronForward, IoFolder, IoFolderOpen } from "react-icons/io5";
import type { AlbumTreeNode } from "../../utils/buildAlbumTree";

type Props = {
  nodes: AlbumTreeNode[];
  expanded: Set<string>;
  selectedPath: string[];
  onToggle: (path: string[]) => void;
  onSelect: (path: string[]) => void;
  onFolderContextMenu: (path: string[], x: number, y: number) => void;
};

function pathKey(path: string[]) {
  return path.join("/");
}

export default function FolderTree({ nodes, expanded, selectedPath, onToggle, onSelect, onFolderContextMenu }: Props) {
  const selectedKey = pathKey(selectedPath);

  function renderNodes(level: AlbumTreeNode[], depth: number) {
    return level.map((node) => {
      const key = pathKey(node.path);
      const isExpanded = expanded.has(key);
      const isSelected = selectedKey === key;
      const hasChildren = node.children.length > 0;
      const photoCount = node.album?.photosCount ?? 0;

      return (
        <div key={key}>
          <button
            type="button"
            aria-label={`Open folder ${node.name}`}
            onClick={() => onSelect(node.path)}
            onContextMenu={(event) => {
              event.preventDefault();
              onFolderContextMenu(node.path, event.clientX, event.clientY);
            }}
            className={`flex w-full items-center gap-1.5 rounded-xl px-2 py-1.5 text-left text-sm transition ${
              isSelected ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
            }`}
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
          >
            {hasChildren ? (
              <span
                role="button"
                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.name}`}
                tabIndex={-1}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(node.path);
                }}
                className="flex h-5 w-5 items-center justify-center rounded text-white/50 hover:text-white"
              >
                <IoChevronForward size={12} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </span>
            ) : (
              <span className="w-5" />
            )}
            {isExpanded ? <IoFolderOpen size={16} className="shrink-0 text-white/60" /> : <IoFolder size={16} className="shrink-0 text-white/60" />}
            <span className="min-w-0 flex-1 truncate">{node.name}</span>
            {photoCount > 0 ? <span className="text-[10px] text-white/40 tabular-nums">{photoCount}</span> : null}
          </button>
          {isExpanded ? <div>{renderNodes(node.children, depth + 1)}</div> : null}
        </div>
      );
    });
  }

  return <nav aria-label="Album folders" className="space-y-0.5">{renderNodes(nodes, 0)}</nav>;
}
