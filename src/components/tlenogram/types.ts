export type OverlayType = 'none' | 'cracked' | 'branches' | 'chairs' | 'forest' | 'horror' | 'city'

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
  | { type: 'RESET_IMAGE' } 