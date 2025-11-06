import { Controller, Get } from '@nestjs/common';
import { join } from 'path';
import { readdirSync, existsSync } from 'fs';

@Controller('slides')
export class SlidesController {
  @Get()
  list() {
    try {
      const imagesDir = join(__dirname, '..', 'public', 'images');

      // Check if images directory exists
      if (!existsSync(imagesDir)) {
        // Return default slide images if directory doesn't exist
        // These can be URLs or relative paths served from public folder
        return [
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=300&fit=crop',
          'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=800&h=300&fit=crop',
          'https://images.unsplash.com/photo-1606126613408-eca07fe45455?w=800&h=300&fit=crop',
        ];
      }

      const files = readdirSync(imagesDir);
      // filter common image extensions
      const imgs = files.filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));

      // If no images found, return defaults
      if (imgs.length === 0) {
        return [
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=300&fit=crop',
          'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=800&h=300&fit=crop',
          'https://images.unsplash.com/photo-1606126613408-eca07fe45455?w=800&h=300&fit=crop',
        ];
      }

      return imgs;
    } catch (err) {
      // Return default slide images on error
      return [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=300&fit=crop',
        'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=800&h=300&fit=crop',
        'https://images.unsplash.com/photo-1606126613408-eca07fe45455?w=800&h=300&fit=crop',
      ];
    }
  }
}
