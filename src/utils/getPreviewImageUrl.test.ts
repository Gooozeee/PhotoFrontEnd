import { describe, expect, it } from "vitest";
import { getPreviewImageUrl } from "./getPreviewImageUrl";

describe("getPreviewImageUrl", () => {
  it("rewrites a thumbnail URL to the preview variant", () => {
    expect(
      getPreviewImageUrl(
        "https://wppdrgxdetyuiolvhrex.supabase.co/storage/v1/object/public/photo-backend/photos/abc123/thumb.webp"
      )
    ).toBe(
      "https://wppdrgxdetyuiolvhrex.supabase.co/storage/v1/object/public/photo-backend/photos/abc123/preview.webp"
    );
  });

  it("rewrites a full URL to the preview variant", () => {
    expect(
      getPreviewImageUrl(
        "https://cdn.example.com/photos/abc123/full.webp"
      )
    ).toBe("https://cdn.example.com/photos/abc123/preview.webp");
  });

  it("is case-insensitive", () => {
    expect(getPreviewImageUrl("https://cdn.example.com/photos/abc123/Thumb.WebP")).toBe(
      "https://cdn.example.com/photos/abc123/preview.webp"
    );
  });

  it("returns non-variant URLs unchanged", () => {
    const original = "https://cdn.example.com/photos/abc123/original.jpg";
    expect(getPreviewImageUrl(original)).toBe(original);
  });

  it("returns null for nullish input", () => {
    expect(getPreviewImageUrl(null)).toBeNull();
    expect(getPreviewImageUrl(undefined)).toBeNull();
  });
});
