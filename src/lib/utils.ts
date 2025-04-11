import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  // SLIDER_MIN, // No longer used
  SLIDER_MAX,
  SLIDER_DEFAULT_CENTER,
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_DEFAULT,
  // ROTATION_MIN, // No longer used
  ROTATION_MAX,
  // ROTATION_DEFAULT, // No longer used
  // OFFSET_MIN_PERCENT, // No longer used
  OFFSET_MAX_PERCENT,
  // OFFSET_DEFAULT_PERCENT, // No longer used
} from '@/components/tlenogram/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Maps slider value (SLIDER_MIN-SLIDER_MAX) to zoom scale (ZOOM_MIN-ZOOM_MAX)
// SLIDER_MIN (0)             -> ZOOM_MIN (0.2)
// SLIDER_DEFAULT_CENTER (50) -> ZOOM_DEFAULT (1.0)
// SLIDER_MAX (100)           -> ZOOM_MAX (5.0)
export function sliderValueToZoom(value: number): number {
  if (value < SLIDER_DEFAULT_CENTER) {
    // Map 0-49 to ZOOM_MIN-ZOOM_DEFAULT
    const normalized = value / SLIDER_DEFAULT_CENTER; // 0 to almost 1
    return ZOOM_MIN + normalized * (ZOOM_DEFAULT - ZOOM_MIN);
  } else {
    // Map 50-100 to ZOOM_DEFAULT-ZOOM_MAX
    const normalized = (value - SLIDER_DEFAULT_CENTER) / (SLIDER_MAX - SLIDER_DEFAULT_CENTER); // 0 to 1
    return ZOOM_DEFAULT + normalized * (ZOOM_MAX - ZOOM_DEFAULT);
  }
}

// Maps slider value (SLIDER_MIN-SLIDER_MAX) to rotation degrees (ROTATION_MIN to ROTATION_MAX)
// SLIDER_MIN (0)             -> ROTATION_MIN (-180)
// SLIDER_DEFAULT_CENTER (50) -> ROTATION_DEFAULT (0)
// SLIDER_MAX (100)           -> ROTATION_MAX (180)
export function sliderValueToRotation(value: number): number {
  // const normalized = (value - SLIDER_DEFAULT_CENTER) / (SLIDER_MAX - SLIDER_DEFAULT_CENTER); // -1 to 1 (since slider goes 0-100)
  // We need to scale this normalized value (0 to 1) from the second half of the slider
  // Or adjust the logic to map 0-100 -> -1 to 1 centered at 50
  // const normalizedCentered = (value - SLIDER_DEFAULT_CENTER) / (SLIDER_MAX - SLIDER_DEFAULT_CENTER); // This gives 0 to 1 for 50-100
  // Let's re-normalize to -1 to 1 based on the full slider range 0-100
  const fullNormalized = (value / SLIDER_MAX) * 2 - 1; // Maps 0 -> -1, 50 -> 0, 100 -> 1
  // return normalizedCentered * ROTATION_MAX; // This was incorrect
  return fullNormalized * ROTATION_MAX; // Maps -1 -> -180, 0 -> 0, 1 -> 180
}

// Maps slider value (SLIDER_MIN-SLIDER_MAX) to offset percentage (OFFSET_MIN_PERCENT to OFFSET_MAX_PERCENT)
// SLIDER_MIN (0)             -> OFFSET_MIN_PERCENT (-100)
// SLIDER_DEFAULT_CENTER (50) -> OFFSET_DEFAULT_PERCENT (0)
// SLIDER_MAX (100)           -> OFFSET_MAX_PERCENT (100)
export function sliderValueToOffsetPercent(value: number): number {
  // Normalize to -1 to 1 based on the full slider range 0-100, centered at 50
  const fullNormalized = (value / SLIDER_MAX) * 2 - 1; // Maps 0 -> -1, 50 -> 0, 100 -> 1
  return fullNormalized * OFFSET_MAX_PERCENT;
}

// Maps offset percentage (OFFSET_MIN_PERCENT to OFFSET_MAX_PERCENT) back to slider value (SLIDER_MIN-SLIDER_MAX)
export function offsetPercentToSliderValue(percent: number): number {
  const normalized = percent / OFFSET_MAX_PERCENT; // -1 to 1
  const sliderValue = (normalized + 1) / 2 * SLIDER_MAX; // Maps -1 -> 0, 0 -> 50, 1 -> 100
  return Math.round(sliderValue);
} 