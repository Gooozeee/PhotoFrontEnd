export function getPreviewImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const match = url.match(/^(.+)\/(thumb|full)\.webp$/i);
  if (!match) return url;

  return `${match[1]}/preview.webp`;
}
