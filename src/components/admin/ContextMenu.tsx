import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type ContextMenuItem = {
  label: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
};

export type ContextMenuPosition = { x: number; y: number };

type Props = {
  items: ContextMenuItem[];
  x: number;
  y: number;
  onClose: () => void;
};

export default function ContextMenu({ items, x, y, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const rect = menu.getBoundingClientRect();
    const clampedX = Math.min(x, window.innerWidth - rect.width - 8);
    const clampedY = Math.min(y, window.innerHeight - rect.height - 8);
    setPosition({ x: Math.max(8, clampedX), y: Math.max(8, clampedY) });
  }, [x, y]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    function handleDismiss() {
      onClose();
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleDismiss, true);
    window.addEventListener("resize", handleDismiss);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleDismiss, true);
      window.removeEventListener("resize", handleDismiss);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-[60] min-w-[180px] rounded-2xl border border-white/10 bg-[#141416] p-1.5 shadow-2xl shadow-black/60"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item, index) => (
        <button
          key={`${item.label}-${index}`}
          role="menuitem"
          type="button"
          disabled={item.disabled}
          onClick={() => {
            onClose();
            item.onClick?.();
          }}
          className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
            item.danger ? "text-red-300 hover:bg-red-500/15" : "text-white/85 hover:bg-white/10"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
