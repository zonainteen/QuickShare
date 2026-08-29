import { CollageLayout } from '../types';

/**
 * Renders multiple photo URLs into a single composite high-res image via Canvas API.
 */
export async function generateCollageComposite(
  photoUrls: string[],
  layout: CollageLayout = 'grid2x2',
  width: number = 1080,
  height: number = 1350
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return photoUrls[0] || '';

  // Background
  ctx.fillStyle = '#0F1015';
  ctx.fillRect(0, 0, width, height);

  // Load images
  const loadedImages = await Promise.all(
    photoUrls.map((url) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = url;
      });
    })
  );

  const drawCover = (
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number = 24
  ) => {
    if (!img.width) return;
    ctx.save();
    
    // Rounded clip
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.clip();

    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let sWidth = img.width;
    let sHeight = img.height;
    let sx = 0;
    let sy = 0;

    if (imgRatio > boxRatio) {
      sWidth = img.height * boxRatio;
      sx = (img.width - sWidth) / 2;
    } else {
      sHeight = img.width / boxRatio;
      sy = (img.height - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
    ctx.restore();

    // Subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.stroke();
  };

  const pad = 24;
  const count = loadedImages.length;

  if (layout === 'splitVertical' || count === 2) {
    const halfH = (height - pad * 3) / 2;
    if (loadedImages[0]) drawCover(loadedImages[0], pad, pad, width - pad * 2, halfH, 32);
    if (loadedImages[1]) drawCover(loadedImages[1], pad, pad * 2 + halfH, width - pad * 2, halfH, 32);
  } else if (layout === 'tripleStory' || count === 3) {
    const topH = (height - pad * 3) * 0.58;
    const botH = (height - pad * 3) * 0.42;
    const halfW = (width - pad * 3) / 2;
    if (loadedImages[0]) drawCover(loadedImages[0], pad, pad, width - pad * 2, topH, 32);
    if (loadedImages[1]) drawCover(loadedImages[1], pad, pad * 2 + topH, halfW, botH, 28);
    if (loadedImages[2]) drawCover(loadedImages[2], pad * 2 + halfW, pad * 2 + topH, halfW, botH, 28);
  } else if (layout === 'heroInset') {
    // 1 Main Hero background + floating polaroid insets
    if (loadedImages[0]) drawCover(loadedImages[0], pad, pad, width - pad * 2, height - pad * 2, 36);
    
    // Insets at bottom right
    const insetW = width * 0.38;
    const insetH = height * 0.28;
    if (loadedImages[1]) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 20;
      drawCover(loadedImages[1], width - insetW - pad * 1.5, height - insetH - pad * 1.5, insetW, insetH, 24);
      ctx.restore();
    }
    if (loadedImages[2]) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 20;
      drawCover(loadedImages[2], width - insetW * 1.8 - pad * 2, height - insetH * 0.9 - pad * 1.5, insetW * 0.8, insetH * 0.8, 20);
      ctx.restore();
    }
  } else {
    // Grid 2x2
    const cellW = (width - pad * 3) / 2;
    const cellH = (height - pad * 3) / 2;
    if (loadedImages[0]) drawCover(loadedImages[0], pad, pad, cellW, cellH, 28);
    if (loadedImages[1]) drawCover(loadedImages[1], pad * 2 + cellW, pad, cellW, cellH, 28);
    if (loadedImages[2]) drawCover(loadedImages[2], pad, pad * 2 + cellH, cellW, cellH, 28);
    if (loadedImages[3]) drawCover(loadedImages[3], pad * 2 + cellW, pad * 2 + cellH, cellW, cellH, 28);
    else if (count === 3 && loadedImages[2]) {
      // Span 3rd across full bottom
      drawCover(loadedImages[2], pad, pad * 2 + cellH, width - pad * 2, cellH, 28);
    }
  }

  // Watermark stamp in corner
  ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('QuickStatus Multi-Story', pad + 16, height - pad - 16);

  return canvas.toDataURL('image/jpeg', 0.92);
}
