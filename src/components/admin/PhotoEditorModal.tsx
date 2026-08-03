import { FormEvent } from "react";
import type { AdminAlbum, AdminPhoto, UpdatePhotoPayload } from "../../pages/admin/types";

type Props = {
  photo: AdminPhoto;
  albums: AdminAlbum[];
  saving: boolean;
  onSave: (payload: UpdatePhotoPayload) => void;
  onClose: () => void;
};

export default function PhotoEditorModal({ photo, albums, saving, onSave, onClose }: Props) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      fileName: form.get("fileName")?.toString() ?? photo.fileName,
      description: form.get("description")?.toString() || null,
      fileSizeBytes: Number(form.get("fileSizeBytes") ?? photo.fileSizeBytes),
      contentType: form.get("contentType")?.toString() ?? photo.contentType,
      width: Number(form.get("width") ?? photo.width),
      height: Number(form.get("height") ?? photo.height),
      takenAt: form.get("takenAt")?.toString() ?? photo.takenAt,
      albumId: form.get("albumId")?.toString() || null,
      location: form.get("location")?.toString() || null,
      cameraModel: form.get("cameraModel")?.toString() || null,
      tags: (form.get("tags")?.toString() || "").split(",").map((item) => item.trim()).filter(Boolean),
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto flex h-full max-w-7xl items-stretch justify-end">
        <aside role="dialog" aria-modal="true" aria-labelledby="photo-editor-title" className="flex h-full w-full max-w-2xl flex-col overflow-auto rounded-3xl border border-white/10 bg-[#09090B] p-5 space-y-4 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between gap-3">
            <h2 id="photo-editor-title" className="text-xl">Edit photo</h2>
            <button type="button" className="text-sm text-white/50" onClick={onClose}>
              Close
            </button>
          </div>
          <img src={photo.url} alt={photo.fileName} className="w-full rounded-3xl object-cover bg-black/30 aspect-[16/10]" />
          <form key={photo.id} className="space-y-3" onSubmit={handleSubmit}>
            <label className="block text-sm text-white/70">
              <span className="mb-1 block">File name</span>
              <input name="fileName" defaultValue={photo.fileName} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
            </label>
            <label className="block text-sm text-white/70">
              <span className="mb-1 block">Description</span>
              <input name="description" defaultValue={photo.description ?? ""} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
            </label>
            <label className="block text-sm text-white/70">
              <span className="mb-1 block">Location</span>
              <input name="location" defaultValue={photo.location ?? ""} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
            </label>
            <label className="block text-sm text-white/70">
              <span className="mb-1 block">Camera model</span>
              <input name="cameraModel" defaultValue={photo.cameraModel ?? ""} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
            </label>
            <label className="block text-sm text-white/70">
              <span className="mb-1 block">Tags</span>
              <input name="tags" defaultValue={photo.tags.join(", ")} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
            </label>
            <label className="block text-sm text-white/70">
              <span className="mb-1 block">Taken at</span>
              <input name="takenAt" defaultValue={photo.takenAt} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
            </label>
            <label className="block text-sm text-white/70">
              <span className="mb-1 block">Album</span>
              <select name="albumId" defaultValue={photo.albumId ?? ""} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2">
                <option value="">No album</option>
                {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="block text-sm text-white/70">
                <span className="mb-1 block">Size bytes</span>
                <input name="fileSizeBytes" type="number" defaultValue={photo.fileSizeBytes} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
              </label>
              <label className="block text-sm text-white/70">
                <span className="mb-1 block">Width</span>
                <input name="width" type="number" defaultValue={photo.width} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
              </label>
              <label className="block text-sm text-white/70">
                <span className="mb-1 block">Height</span>
                <input name="height" type="number" defaultValue={photo.height} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
              </label>
            </div>
            <label className="block text-sm text-white/70">
              <span className="mb-1 block">Content type</span>
              <input name="contentType" defaultValue={photo.contentType} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
            </label>
            <button disabled={saving} className="w-full px-4 py-2.5 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-50">Save photo</button>
          </form>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm space-y-1">
            <p className="text-white/70 uppercase tracking-[0.2em] text-xs">Detected metadata</p>
            <p><span className="text-white/45">Taken:</span> {new Date(photo.takenAt).toLocaleString()}</p>
            <p><span className="text-white/45">Location:</span> {photo.location ?? "Not detected"}</p>
            <p><span className="text-white/45">Camera:</span> {photo.cameraModel ?? "Not detected"}</p>
            <p><span className="text-white/45">Size:</span> {photo.width} × {photo.height}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
