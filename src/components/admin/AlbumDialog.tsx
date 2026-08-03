import { useState } from "react";
import type { AdminAlbum } from "../../pages/admin/types";

type Props = {
  title: string;
  album?: AdminAlbum | null;
  saving: boolean;
  onSave: (values: { name: string; description: string; isPublished: boolean }) => void;
  onDelete?: () => void;
  onClose: () => void;
};

export default function AlbumDialog({ title, album, saving, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState(album?.name ?? "");
  const [description, setDescription] = useState(album?.description ?? "");
  const [isPublished, setIsPublished] = useState(album?.isPublished ?? false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div role="dialog" aria-modal="true" aria-labelledby="album-dialog-title" className="w-full max-w-md rounded-3xl border border-white/10 bg-[#09090B] p-6 space-y-4 shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between gap-3">
          <h2 id="album-dialog-title" className="text-xl">{title}</h2>
          <button type="button" className="text-sm text-white/50" onClick={onClose}>Close</button>
        </div>

        <label className="block text-sm text-white/70">
          <span className="mb-1 block">Name</span>
          <input
            aria-label="Album name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
          />
        </label>

        <label className="block text-sm text-white/70">
          <span className="mb-1 block">Description</span>
          <textarea
            aria-label="Album description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 resize-none"
          />
        </label>

        <label className="flex items-center gap-3 text-sm text-white/70">
          <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} className="h-4 w-4 accent-white" />
          <span>Published (visible on the public site)</span>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={saving || !name.trim()}
            onClick={() => onSave({ name: name.trim(), description: description.trim(), isPublished })}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-50"
          >
            {saving ? "Working..." : "Save"}
          </button>
          {onDelete ? (
            <button type="button" onClick={onDelete} className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/20 transition">
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
