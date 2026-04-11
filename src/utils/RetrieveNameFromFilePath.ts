export function generateImageCaptionFromFilePath(filePath: string): string {
    const index = filePath.lastIndexOf('/');
    let result = index !== -1 ? filePath.substring(index + 1) : filePath;
    const dotIndex = result.lastIndexOf('.');
    if (dotIndex !== -1) {
      result = result.substring(0, dotIndex);
    }

    return result;
}
