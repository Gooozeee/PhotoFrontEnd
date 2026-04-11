import { generateImageCaptionFromFilePath } from '../utils/RetrieveNameFromFilePath';

describe('generateImageCaptionFromFilePath', () => {
  it('should extract filename and remove extension', () => {
    const result = generateImageCaptionFromFilePath('/assets/Birds/Seagull Northern Ireland 2022.webp');
    expect(result).toBe('Seagull Northern Ireland 2022');
  });

  it('should handle webp extension with space', () => {
    const result = generateImageCaptionFromFilePath('/assets/Test.Image.webp');
    expect(result).toBe('Test.Image');
  });

  it('should handle jpg extension', () => {
    const result = generateImageCaptionFromFilePath('/path/to/photo.jpg');
    expect(result).toBe('photo');
  });

  it('should return filename without path for simple paths', () => {
    const result = generateImageCaptionFromFilePath('image.webp');
    expect(result).toBe('image');
  });

  it('should return the full string when no slash found', () => {
    const result = generateImageCaptionFromFilePath('noextension');
    expect(result).toBe('noextension');
  });
});