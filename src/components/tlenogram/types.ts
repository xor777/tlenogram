import { overlays } from './constants'

export type OverlayType = keyof typeof overlays | 'none' | 'custom'

// New type for standard overlays used in the overlays object
export type StandardOverlayType = Exclude<OverlayType, 'none' | 'custom'>

export type State = {
  image: string | null
  processedImage: string | null
  error: string | null
  loading: boolean
  blendLevel: number
  darknessLevel: number
  noirLevel: number
  grayscaleLevel: number
  simplicityLevel: number
  overlayType: OverlayType
  overlayIntensity: number
  overlayZoom: number
  overlayRotation: number
  overlayOffsetX: number
  overlayOffsetY: number
  customOverlayUrl: string | null
}

export type Action =
  | { type: 'SET_IMAGE'; payload: string | null }
  | { type: 'SET_PROCESSED_IMAGE'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BLEND_LEVEL'; payload: number }
  | { type: 'SET_DARKNESS_LEVEL'; payload: number }
  | { type: 'SET_NOIR_LEVEL'; payload: number }
  | { type: 'SET_GRAYSCALE_LEVEL'; payload: number }
  | { type: 'SET_SIMPLICITY_LEVEL'; payload: number }
  | { type: 'SET_OVERLAY_TYPE'; payload: OverlayType }
  | { type: 'SET_OVERLAY_INTENSITY'; payload: number }
  | { type: 'SET_OVERLAY_ZOOM'; payload: number }
  | { type: 'SET_OVERLAY_ROTATION'; payload: number }
  | { type: 'SET_OVERLAY_OFFSET_X'; payload: number }
  | { type: 'SET_OVERLAY_OFFSET_Y'; payload: number }
  | { type: 'SET_CUSTOM_OVERLAY_URL'; payload: string | null }
  | { type: 'RESET_IMAGE' } 