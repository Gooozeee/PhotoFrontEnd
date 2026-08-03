import { IoImageOutline } from "react-icons/io5";

const STORAGE_KEY = "admin.library.thumbSize";
export const MIN_SIZE = 20;
export const MAX_SIZE = 100;

function clamp(value: number) {
  if (Number.isNaN(value)) return 50;
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, value));
}

export function loadThumbSize(defaultValue = 50): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return defaultValue;
    return clamp(Number(raw));
  } catch {
    return defaultValue;
  }
}

export function saveThumbSize(value: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // storage unavailable; ignore
  }
}

export function thumbSizePixels(value: number): number {
  return Math.floor(64 + (clamp(value) / 100) * 288);
}

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function SizeSlider({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
      <IoImageOutline size={18} className="text-white/50" />
      <input
        aria-label="Thumbnail size"
        type="range"
        min={MIN_SIZE}
        max={MAX_SIZE}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-28 cursor-pointer accent-white"
      />
      <IoImageOutline size={26} className="text-white/70" />
      <span className="text-xs text-white/50 w-8 tabular-nums">{value}%</span>
    </div>
  );
}
