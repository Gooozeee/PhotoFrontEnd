export function generateImageCaptionFromFilePath(filePath: string): string {
    const index = filePath.lastIndexOf('/');
    let result = index !== -1 ? filePath.substring(index + 1) : filePath;
    if (result.endsWith('.webp') || result.endsWith('jpeg')) {
      result = result.slice(0, -14);
    }
    if (result.endsWith('.jpg')) {
      result = result.slice(0, -4);
    }

    return result;
}
