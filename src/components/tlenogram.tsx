'use client'

import { useReducer, useRef, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Loader2, Upload, Download } from "lucide-react"
import useDebounce from '@/hooks/useDebounce'

const DEBOUNCE_DELAY = 100

type OverlayType = 'none' | 'cracked' | 'branches' | 'chairs' | 'forest' | 'horror' | 'city'

const overlays: Record<OverlayType, string | null> = {
  'none': null,
  'cracked': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-4BUwosPWLHIJuBhWNqD6vn91zlwOPl.png',
  'branches': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-Pww85QkRX55df7GW10JYVn7b7ejDGd.jpeg',
  'chairs': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-v1ScrsshSwLjJwqqh5k2dIC00u2woA.jpg',
  'forest': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-gbMk6jhu1yVKlbxTbWH9cnhZRAhiYx.jpg',
  'horror': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-GkS1bV88jaR9UYwtT6SZkLE2ciX5Cl.jpeg',
  'city': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-LMMBqJgiRbgyfTcb09R73grtjoamzt.jpg'
}

type State = {
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

type Action =
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

const initialState: State = {
  image: null,
  processedImage: null,
  error: null,
  loading: false,
  blendLevel: 100,
  darknessLevel: 0,
  noirLevel: 20,
  grayscaleLevel: 100,
  simplicityLevel: 0,
  overlayType: 'none',
  overlayIntensity: 50,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_IMAGE':
      return { ...state, image: action.payload, error: null }
    case 'SET_PROCESSED_IMAGE':
      return { ...state, processedImage: action.payload, loading: false }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_BLEND_LEVEL':
      return { ...state, blendLevel: action.payload }
    case 'SET_DARKNESS_LEVEL':
      return { ...state, darknessLevel: action.payload }
    case 'SET_NOIR_LEVEL':
      return { ...state, noirLevel: action.payload }
    case 'SET_GRAYSCALE_LEVEL':
      return { ...state, grayscaleLevel: action.payload }
    case 'SET_SIMPLICITY_LEVEL':
      return { ...state, simplicityLevel: action.payload }
    case 'SET_OVERLAY_TYPE':
      return { ...state, overlayType: action.payload }
    case 'SET_OVERLAY_INTENSITY':
      return { ...state, overlayIntensity: action.payload }
    case 'RESET_IMAGE':
      return { ...state, image: null, processedImage: null, error: null }
    default:
      return state
  }
}

export default function Tlenogram() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const debouncedBlendLevel = useDebounce(state.blendLevel, DEBOUNCE_DELAY)
  const debouncedDarknessLevel = useDebounce(state.darknessLevel, DEBOUNCE_DELAY)
  const debouncedNoirLevel = useDebounce(state.noirLevel, DEBOUNCE_DELAY)
  const debouncedGrayscaleLevel = useDebounce(state.grayscaleLevel, DEBOUNCE_DELAY)
  const debouncedSimplicityLevel = useDebounce(state.simplicityLevel, DEBOUNCE_DELAY)
  const debouncedOverlayType = useDebounce(state.overlayType, DEBOUNCE_DELAY)
  const debouncedOverlayIntensity = useDebounce(state.overlayIntensity, DEBOUNCE_DELAY)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      dispatch({ type: 'SET_ERROR', payload: 'file too large. max 10mb' })
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      dispatch({ type: 'SET_ERROR', payload: 'only jpg, png, webp allowed' })
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      imageRef.current = null
      dispatch({ type: 'SET_IMAGE', payload: e.target?.result as string })
      event.target.value = ''
    }

    reader.onerror = () => {
      dispatch({ type: 'SET_ERROR', payload: 'error reading file' })
      reader.abort()
    }

    reader.onabort = () => {
      dispatch({ type: 'SET_ERROR', payload: 'file reading was aborted' })
    }

    reader.readAsDataURL(file)

    return () => {
      reader.abort()
    }
  }

  const applyOverlay = useCallback(async (canvas: HTMLCanvasElement) => {
    const overlayUrl = overlays[debouncedOverlayType]
    if (!overlayUrl) return canvas

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return canvas

    const overlayImg = new Image()
    overlayImg.crossOrigin = 'anonymous'

    return new Promise<HTMLCanvasElement>((resolve) => {
      overlayImg.onload = () => {
        const overlayCanvas = overlayCanvasRef.current
        if (!overlayCanvas) {
          resolve(canvas)
          return
        }

        overlayCanvas.width = canvas.width
        overlayCanvas.height = canvas.height
        const octx = overlayCanvas.getContext('2d', { willReadFrequently: true })
        if (!octx) {
          resolve(canvas)
          return
        }

        const scale = Math.max(
          canvas.width / overlayImg.width,
          canvas.height / overlayImg.height
        )
        const scaledWidth = overlayImg.width * scale
        const scaledHeight = overlayImg.height * scale
        const x = (canvas.width - scaledWidth) / 2
        const y = (canvas.height - scaledHeight) / 2

        octx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
        octx.drawImage(overlayImg, x, y, scaledWidth, scaledHeight)
        
        ctx.globalAlpha = debouncedOverlayIntensity / 100
        ctx.globalCompositeOperation = 'multiply'
        ctx.drawImage(overlayCanvas, 0, 0)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'

        resolve(canvas)
      }

      overlayImg.onerror = () => resolve(canvas)
      overlayImg.src = overlayUrl
    })
  }, [debouncedOverlayType, debouncedOverlayIntensity, overlayCanvasRef])

  const processImage = useCallback(async () => {
    if (!imageRef.current || !canvasRef.current) return
    dispatch({ type: 'SET_LOADING', payload: true })

    const img = imageRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const blendFactor = debouncedBlendLevel / 100

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i]
      let g = data[i + 1]
      let b = data[i + 2]

      const gray = (r * 0.299 + g * 0.587 + b * 0.114)
      const grayscaleFactor = (debouncedGrayscaleLevel / 100) * blendFactor
      r = r * (1 - grayscaleFactor) + gray * grayscaleFactor
      g = g * (1 - grayscaleFactor) + gray * grayscaleFactor
      b = b * (1 - grayscaleFactor) + gray * grayscaleFactor

      const noirFactor = (debouncedNoirLevel / 100) * blendFactor
      r = r + (255 - r) * noirFactor
      g = g + (255 - g) * noirFactor
      b = b + (255 - b) * noirFactor

      const simplicityFactor = (debouncedSimplicityLevel / 100) * blendFactor
      r = r < 128 ? r * (1 - simplicityFactor) : r + (255 - r) * simplicityFactor
      g = g < 128 ? g * (1 - simplicityFactor) : g + (255 - g) * simplicityFactor
      b = b < 128 ? b * (1 - simplicityFactor) : b + (255 - b) * simplicityFactor

      const darknessFactor = (debouncedDarknessLevel / 100) * blendFactor
      r *= (1 - darknessFactor)
      g *= (1 - darknessFactor)
      b *= (1 - darknessFactor)

      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
    }

    ctx.putImageData(imageData, 0, 0)

    if (debouncedOverlayType !== 'none') {
      await applyOverlay(canvas)
    }
    
    dispatch({ type: 'SET_PROCESSED_IMAGE', payload: canvas.toDataURL('image/png') })
  }, [
    debouncedBlendLevel,
    debouncedDarknessLevel,
    debouncedNoirLevel,
    debouncedGrayscaleLevel,
    debouncedSimplicityLevel,
    debouncedOverlayType,
    applyOverlay,
    canvasRef,
    imageRef
  ])

  useEffect(() => {
    let mounted = true
    let currentImage: HTMLImageElement | null = null

    if (state.image && !imageRef.current) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      currentImage = img
      
      img.onload = () => {
        if (!mounted) return
        imageRef.current = img
        processImage()
      }

      img.onerror = () => {
        if (!mounted) return
        dispatch({ type: 'SET_ERROR', payload: 'error loading image' })
        dispatch({ type: 'RESET_IMAGE' })
      }

      img.src = state.image
    } 
    else if (imageRef.current) {
      processImage()
    }

    return () => {
      mounted = false
      if (currentImage) {
        currentImage.onload = null
        currentImage.onerror = null
        currentImage = null
      }
    }
  }, [state.image, processImage])

  const downloadImage = () => {
    if (!state.processedImage) return
    const link = document.createElement('a')
    link.href = state.processedImage
    link.download = 'tlenogram_image.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto p-4 sm:p-6 bg-black text-white">
        <h1 className="text-2xl font-semibold mb-6 text-center">tlenogram</h1>
        
        <div className="mb-6">
          <Input
            id="image-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            onClick={() => document.getElementById('image-upload')?.click()}
            className="w-full bg-gray-800 text-white hover:bg-gray-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            choose file
          </Button>
        </div>

        {state.error && <p className="text-red-400 text-sm mb-4">{state.error}</p>}

        {state.image && (
          <div className="mb-6">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <img 
                src={state.processedImage || state.image || ''} 
                alt="processed image" 
                className="object-cover w-full h-full"
              />
              {state.loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
            {state.processedImage && (
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={downloadImage}
                  className="bg-gray-800 text-white hover:bg-gray-700"
                  size="sm"
                  disabled={state.loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  download
                </Button>
              </div>
            )}
          </div>
        )}

        {state.image && (
          <>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">grayscale - {state.grayscaleLevel}%</p>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[state.grayscaleLevel]}
                    onValueChange={(value) => dispatch({ type: 'SET_GRAYSCALE_LEVEL', payload: value[0] })}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">darkness - {state.darknessLevel}%</p>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[state.darknessLevel]}
                    onValueChange={(value) => dispatch({ type: 'SET_DARKNESS_LEVEL', payload: value[0] })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">noir - {state.noirLevel}%</p>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[state.noirLevel]}
                    onValueChange={(value) => dispatch({ type: 'SET_NOIR_LEVEL', payload: value[0] })}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">simplicity - {state.simplicityLevel}%</p>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[state.simplicityLevel]}
                    onValueChange={(value) => dispatch({ type: 'SET_SIMPLICITY_LEVEL', payload: value[0] })}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">filter intensity - {state.blendLevel}%</p>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[state.blendLevel]}
                  onValueChange={(value) => dispatch({ type: 'SET_BLEND_LEVEL', payload: value[0] })}
                />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium mb-2">overlay</p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => dispatch({ type: 'SET_OVERLAY_TYPE', payload: 'none' })}
                  className={`aspect-square rounded overflow-hidden border-2 ${
                    state.overlayType === 'none' ? 'border-white' : 'border-transparent'
                  }`}
                >
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-white">
                    none
                  </div>
                </button>
                {Object.entries(overlays).map(([key, url]) => {
                  if (key === 'none') return null
                  return (
                    <button
                      key={key}
                      onClick={() => dispatch({ type: 'SET_OVERLAY_TYPE', payload: key as OverlayType })}
                      className={`aspect-square rounded overflow-hidden border-2 ${
                        state.overlayType === key ? 'border-white' : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={url || undefined} 
                        alt={key}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {state.overlayType !== 'none' && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">
                  overlay intensity - {state.overlayIntensity}%
                </p>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[state.overlayIntensity]}
                  onValueChange={(value) => dispatch({ type: 'SET_OVERLAY_INTENSITY', payload: value[0] })}
                />
              </div>
            )}
          </>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <canvas ref={overlayCanvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  )
}
