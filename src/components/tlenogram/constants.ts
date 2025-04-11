export const overlays = {
  'cracked': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-4BUwosPWLHIJuBhWNqD6vn91zlwOPl.png',
  'branches': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-Pww85QkRX55df7GW10JYVn7b7ejDGd.jpeg',
  'chairs': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-v1ScrsshSwLjJwqqh5k2dIC00u2woA.jpg',
  'forest': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-gbMk6jhu1yVKlbxTbWH9cnhZRAhiYx.jpg',
  'horror': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-GkS1bV88jaR9UYwtT6SZkLE2ciX5Cl.jpeg',
  'city': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-LMMBqJgiRbgyfTcb09R73grtjoamzt.jpg'
} as const;

// Slider constants
export const SLIDER_MIN = 0;
export const SLIDER_MAX = 100;
export const SLIDER_DEFAULT_CENTER = 50; // Represents 0 rotation, 0 offset, 1x zoom

// Transformation ranges mapped from slider
export const ZOOM_MIN = 0.2;
export const ZOOM_MAX = 5.0;
export const ZOOM_DEFAULT = 1.0; // Corresponds to SLIDER_DEFAULT_CENTER

export const ROTATION_MIN = -180;
export const ROTATION_MAX = 180;
export const ROTATION_DEFAULT = 0; // Corresponds to SLIDER_DEFAULT_CENTER

export const OFFSET_MIN_PERCENT = -100;
export const OFFSET_MAX_PERCENT = 100;
export const OFFSET_DEFAULT_PERCENT = 0; // Corresponds to SLIDER_DEFAULT_CENTER

// Initial state defaults
export const INITIAL_BLEND_LEVEL = 100;
export const INITIAL_DARKNESS_LEVEL = 0;
export const INITIAL_NOIR_LEVEL = 0;
export const INITIAL_GRAYSCALE_LEVEL = 100;
export const INITIAL_SIMPLICITY_LEVEL = 0;
export const INITIAL_OVERLAY_TYPE = 'none';
export const INITIAL_OVERLAY_INTENSITY = SLIDER_DEFAULT_CENTER; // 50
export const INITIAL_OVERLAY_ZOOM_SLIDER = SLIDER_DEFAULT_CENTER; // 50 -> 1.0x zoom
export const INITIAL_OVERLAY_ROTATION_SLIDER = SLIDER_DEFAULT_CENTER; // 50 -> 0deg rotation
export const INITIAL_OVERLAY_OFFSET_X_SLIDER = SLIDER_DEFAULT_CENTER; // 50 -> 0% offset
export const INITIAL_OVERLAY_OFFSET_Y_SLIDER = SLIDER_DEFAULT_CENTER; // 50 -> 0% offset

// File upload constants
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_IMAGE_TYPES_STRING = '.jpg,.jpeg,.png,.webp';

// Error messages
export const ERROR_FILE_TOO_LARGE = `file too large. max ${MAX_FILE_SIZE_MB}mb`;
export const ERROR_INVALID_FILE_TYPE = 'only jpg, png, webp allowed';
export const ERROR_READING_FILE = 'error reading file';
export const ERROR_ABORTED_READING = 'file reading was aborted';
export const ERROR_LOADING_IMAGE = 'error loading image';
export const ERROR_GET_INPUT_CONTEXT = 'Internal error: Failed to get input canvas context';
export const ERROR_GET_OVERLAY_CONTEXT = 'Internal error: Failed to get overlay canvas context';
export const ERROR_GET_TEMP_CONTEXT = 'Failed to get temp context for overlay';
export const ERROR_OVERLAY_CANVAS_REF = 'Internal error: Overlay canvas reference not found';
export const ERROR_PROCESSING_OVERLAY = 'Error processing overlay image';
export const ERROR_LOADING_OVERLAY = 'Error loading overlay image';
export const ERROR_APPLYING_OVERLAY = 'Failed to apply overlay';
export const ERROR_READING_OVERLAY = 'Failed to read the overlay file.'; 