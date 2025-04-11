import { sliderValueToZoom, sliderValueToRotation, sliderValueToOffsetPercent } from "@/lib/utils";
import { ERROR_GET_TEMP_CONTEXT, ERROR_PROCESSING_OVERLAY, ERROR_LOADING_OVERLAY } from '@/components/tlenogram/constants';

// Define the return type for calculateOverlayParameters for clarity
export type OverlayParameters = {
    zoomScale: number;
    rotationRadians: number;
    offsetX: number;
    offsetY: number;
    finalDrawWidth: number;
    finalDrawHeight: number;
    startX: number;
    startY: number;
};

export async function loadAndProcessOverlay(
  overlayUrl: string,
  isCustom: boolean
): Promise<HTMLCanvasElement> {
  const overlayImg = new window.Image();
  overlayImg.crossOrigin = 'anonymous';

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    overlayImg.onload = () => {
      try {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (!tempCtx) {
          throw new Error(ERROR_GET_TEMP_CONTEXT);
        }

        tempCanvas.width = overlayImg.width;
        tempCanvas.height = overlayImg.height;
        tempCtx.drawImage(overlayImg, 0, 0);

        if (isCustom) {
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
          }
          tempCtx.putImageData(imageData, 0, 0);
        }
        resolve(tempCanvas);
      } catch (error: unknown) {
        console.error("Error processing overlay image:", error);
        let errorMessage = ERROR_PROCESSING_OVERLAY;
        if (error instanceof Error) {
          errorMessage = `${ERROR_PROCESSING_OVERLAY}: ${error.message}`;
        } else if (typeof error === 'string') {
          errorMessage = `${ERROR_PROCESSING_OVERLAY}: ${error}`;
        }
        reject(new Error(errorMessage));
      }
    };
    overlayImg.onerror = (err) => {
      console.error("Error loading overlay image:", err);
      reject(new Error(ERROR_LOADING_OVERLAY));
    };
    overlayImg.src = overlayUrl;
  });
}


export function calculateOverlayParameters(
  overlayZoom: number,
  overlayRotation: number,
  overlayOffsetX: number,
  overlayOffsetY: number,
  inputCanvasWidth: number,
  inputCanvasHeight: number,
  overlaySourceWidth: number,
  overlaySourceHeight: number
): OverlayParameters {
  const zoomScale = sliderValueToZoom(overlayZoom);
  const rotationDegrees = sliderValueToRotation(overlayRotation);
  const rotationRadians = rotationDegrees * Math.PI / 180;
  const offsetXPercent = sliderValueToOffsetPercent(overlayOffsetX);
  const offsetYPercent = sliderValueToOffsetPercent(overlayOffsetY);

  const baseScaleX = inputCanvasWidth / overlaySourceWidth;
  const baseScaleY = inputCanvasHeight / overlaySourceHeight;
  const baseScale = Math.max(baseScaleX, baseScaleY); // Maintain aspect ratio, cover area

  const finalDrawWidth = overlaySourceWidth * baseScale * zoomScale;
  const finalDrawHeight = overlaySourceHeight * baseScale * zoomScale;

  const offsetX = (inputCanvasWidth * offsetXPercent) / 100;
  const offsetY = (inputCanvasHeight * offsetYPercent) / 100;

  // Calculate base start coordinates for centered tiling (before offset)
  let baseStartX = (inputCanvasWidth / 2) % finalDrawWidth - (finalDrawWidth / 2);
  let baseStartY = (inputCanvasHeight / 2) % finalDrawHeight - (finalDrawHeight / 2);
  while (baseStartX > 0) baseStartX -= finalDrawWidth;
  while (baseStartY > 0) baseStartY -= finalDrawHeight;

  // Apply user offset to the calculated base start position
  const startX = baseStartX + offsetX;
  const startY = baseStartY + offsetY;


  return {
    zoomScale,
    rotationRadians,
    offsetX,
    offsetY,
    finalDrawWidth,
    finalDrawHeight,
    startX,
    startY
  };
}

export function applyOverlayTransformations(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    rotationRadians: number
) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvasWidth, canvasHeight);
    ctx.clip();

    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate(rotationRadians);
    ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
}

export function drawTiledOverlayImage(
    ctx: CanvasRenderingContext2D,
    overlaySourceCanvas: HTMLCanvasElement,
    params: OverlayParameters,
    canvasWidth: number,
    canvasHeight: number
) {
    const { startX, startY, finalDrawWidth, finalDrawHeight } = params;

    const loopStartX = startX - finalDrawWidth;
    const loopStartY = startY - finalDrawHeight;
    const loopEndX = canvasWidth + finalDrawWidth;
    const loopEndY = canvasHeight + finalDrawHeight;

    for (let y = loopStartY; y < loopEndY; y += finalDrawHeight) {
        for (let x = loopStartX; x < loopEndX; x += finalDrawWidth) {
            ctx.drawImage(overlaySourceCanvas, x, y, finalDrawWidth, finalDrawHeight);
        }
    }
} 