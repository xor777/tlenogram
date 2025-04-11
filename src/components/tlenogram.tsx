'use client'

import { useReducer, useRef, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, Download } from "lucide-react"
import Image from 'next/image'
import useDebounce from '@/hooks/useDebounce'
import { Filters } from './tlenogram/filters'
import { Overlays } from './tlenogram/overlays'
import { State, Action, StandardOverlayType } from './tlenogram/types'
import {
  overlays,
  INITIAL_BLEND_LEVEL,
  INITIAL_DARKNESS_LEVEL,
  INITIAL_NOIR_LEVEL,
  INITIAL_GRAYSCALE_LEVEL,
  INITIAL_SIMPLICITY_LEVEL,
  INITIAL_OVERLAY_TYPE,
  INITIAL_OVERLAY_INTENSITY,
  INITIAL_OVERLAY_ZOOM_SLIDER,
  INITIAL_OVERLAY_ROTATION_SLIDER,
  INITIAL_OVERLAY_OFFSET_X_SLIDER,
  INITIAL_OVERLAY_OFFSET_Y_SLIDER,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_TYPES_STRING,
  ERROR_FILE_TOO_LARGE,
  ERROR_INVALID_FILE_TYPE,
  ERROR_READING_FILE,
  ERROR_ABORTED_READING,
  ERROR_LOADING_IMAGE,
  ERROR_GET_INPUT_CONTEXT,
  ERROR_GET_OVERLAY_CONTEXT,
  ERROR_OVERLAY_CANVAS_REF,
  ERROR_APPLYING_OVERLAY,
  ERROR_READING_OVERLAY
} from './tlenogram/constants'
import {
  loadAndProcessOverlay,
  calculateOverlayParameters,
  applyOverlayTransformations,
  drawTiledOverlayImage
} from '@/lib/canvasUtils'

const DEBOUNCE_DELAY = 100

const initialState: State = {
  image: null,
  processedImage: null,
  error: null,
  loading: false,
  blendLevel: INITIAL_BLEND_LEVEL,
  darknessLevel: INITIAL_DARKNESS_LEVEL,
  noirLevel: INITIAL_NOIR_LEVEL,
  grayscaleLevel: INITIAL_GRAYSCALE_LEVEL,
  simplicityLevel: INITIAL_SIMPLICITY_LEVEL,
  overlayType: INITIAL_OVERLAY_TYPE,
  overlayIntensity: INITIAL_OVERLAY_INTENSITY,
  overlayZoom: INITIAL_OVERLAY_ZOOM_SLIDER,
  overlayRotation: INITIAL_OVERLAY_ROTATION_SLIDER,
  overlayOffsetX: INITIAL_OVERLAY_OFFSET_X_SLIDER,
  overlayOffsetY: INITIAL_OVERLAY_OFFSET_Y_SLIDER,
  customOverlayUrl: null
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_IMAGE':
      return { ...state, image: action.payload, processedImage: null, error: null }
    case 'SET_PROCESSED_IMAGE':
      return { ...state, processedImage: action.payload, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_GRAYSCALE_LEVEL':
      return { ...state, grayscaleLevel: action.payload }
    case 'SET_DARKNESS_LEVEL':
      return { ...state, darknessLevel: action.payload }
    case 'SET_NOIR_LEVEL':
      return { ...state, noirLevel: action.payload }
    case 'SET_SIMPLICITY_LEVEL':
      return { ...state, simplicityLevel: action.payload }
    case 'SET_BLEND_LEVEL':
      return { ...state, blendLevel: action.payload }
    case 'SET_OVERLAY_TYPE':
      return { ...state, overlayType: action.payload }
    case 'SET_OVERLAY_INTENSITY':
      return { ...state, overlayIntensity: action.payload }
    case 'SET_OVERLAY_ZOOM':
      return { ...state, overlayZoom: action.payload }
    case 'SET_OVERLAY_ROTATION':
      return { ...state, overlayRotation: action.payload }
    case 'SET_OVERLAY_OFFSET_X':
      return { ...state, overlayOffsetX: action.payload }
    case 'SET_OVERLAY_OFFSET_Y':
      return { ...state, overlayOffsetY: action.payload }
    case 'SET_CUSTOM_OVERLAY_URL':
      return { ...state, customOverlayUrl: action.payload }
    case 'RESET_IMAGE':
      return initialState
    default:
      return state
  }
}

export default function Tlenogram() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const debouncedBlendLevel = useDebounce(state.blendLevel, DEBOUNCE_DELAY)
  const debouncedDarknessLevel = useDebounce(state.darknessLevel, DEBOUNCE_DELAY)
  const debouncedNoirLevel = useDebounce(state.noirLevel, DEBOUNCE_DELAY)
  const debouncedGrayscaleLevel = useDebounce(state.grayscaleLevel, DEBOUNCE_DELAY)
  const debouncedSimplicityLevel = useDebounce(state.simplicityLevel, DEBOUNCE_DELAY)
  const debouncedOverlayType = useDebounce(state.overlayType, DEBOUNCE_DELAY)
  const debouncedOverlayIntensity = useDebounce(state.overlayIntensity, DEBOUNCE_DELAY)
  const debouncedCustomOverlayUrl = useDebounce(state.customOverlayUrl, DEBOUNCE_DELAY)
  const debouncedOverlayZoom = useDebounce(state.overlayZoom, DEBOUNCE_DELAY)
  const debouncedOverlayRotation = useDebounce(state.overlayRotation, DEBOUNCE_DELAY)
  const debouncedOverlayOffsetX = useDebounce(state.overlayOffsetX, DEBOUNCE_DELAY)
  const debouncedOverlayOffsetY = useDebounce(state.overlayOffsetY, DEBOUNCE_DELAY)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE_BYTES) {
      dispatch({ type: 'SET_ERROR', payload: ERROR_FILE_TOO_LARGE })
      return
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      dispatch({ type: 'SET_ERROR', payload: ERROR_INVALID_FILE_TYPE })
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      imageRef.current = null
      dispatch({ type: 'SET_IMAGE', payload: e.target?.result as string })
      event.target.value = ''
      // Clean up listeners
      reader.onload = null;
      reader.onerror = null;
    }

    reader.onerror = () => {
      dispatch({ type: 'SET_ERROR', payload: ERROR_READING_FILE })
      // Clean up listeners
      reader.onload = null;
      reader.onerror = null;
      reader.abort() // Abort might still be relevant on error
    }

    reader.onabort = () => {
      dispatch({ type: 'SET_ERROR', payload: ERROR_ABORTED_READING })
      // Clean up listeners if abort happens before load/error
      reader.onload = null;
      reader.onerror = null;
    }

    reader.readAsDataURL(file)
  }

  const applyOverlay = useCallback(async (inputCanvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
    let overlayUrl: string | null = null;
    if (debouncedOverlayType === 'custom') {
      overlayUrl = debouncedCustomOverlayUrl;
    } else if (debouncedOverlayType !== 'none') {
      // Only access overlays if the type is a standard one
      overlayUrl = overlays[debouncedOverlayType as StandardOverlayType];
    }
    
    if (!overlayUrl) return inputCanvas;

    try {
      const inputCtx = inputCanvas.getContext('2d', { willReadFrequently: true });
      if (!inputCtx) {
          throw new Error(ERROR_GET_INPUT_CONTEXT);
      }

      const overlayCanvas = overlayCanvasRef.current;
      if (!overlayCanvas) {
          throw new Error(ERROR_OVERLAY_CANVAS_REF);
      }

      overlayCanvas.width = inputCanvas.width;
      overlayCanvas.height = inputCanvas.height;
      const overlayCtx = overlayCanvas.getContext('2d', { willReadFrequently: true });
      if (!overlayCtx) {
          throw new Error(ERROR_GET_OVERLAY_CONTEXT);
      }

      // 1. Load and process the overlay image (grayscale if custom)
      const processedOverlayCanvas = await loadAndProcessOverlay(overlayUrl, debouncedOverlayType === 'custom');

      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      // 2. Calculate transformation parameters using debounced values
      const params = calculateOverlayParameters(
          debouncedOverlayZoom,
          debouncedOverlayRotation,
          debouncedOverlayOffsetX,
          debouncedOverlayOffsetY,
          inputCanvas.width,
          inputCanvas.height,
          processedOverlayCanvas.width,
          processedOverlayCanvas.height
      );

      // 3. Apply transformations (rotation, clipping) to the overlay canvas context
      applyOverlayTransformations(overlayCtx, overlayCanvas.width, overlayCanvas.height, params.rotationRadians);

      // 4. Draw the tiled overlay onto the transformed overlay canvas
      drawTiledOverlayImage(overlayCtx, processedOverlayCanvas, params, overlayCanvas.width, overlayCanvas.height);

      // Restore context state (removes clipping and transformations)
      overlayCtx.restore();

      // 5. Composite the overlay onto the input canvas using debounced intensity
      inputCtx.globalAlpha = debouncedOverlayIntensity / 100;
      inputCtx.globalCompositeOperation = 'multiply';
      inputCtx.drawImage(overlayCanvas, 0, 0);
      inputCtx.globalAlpha = 1.0;
      inputCtx.globalCompositeOperation = 'source-over';

      return inputCanvas; // Return the modified input canvas

    } catch (error: unknown) {
        console.error("Error applying overlay:", error);
        let errorMessage = 'Unknown error applying overlay';
        if (error instanceof Error) {
          errorMessage = `${ERROR_APPLYING_OVERLAY}: ${error.message}`;
        } else if (typeof error === 'string') {
          errorMessage = `${ERROR_APPLYING_OVERLAY}: ${error}`;
        }
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return inputCanvas; // Return original canvas on failure
    }
  }, [
    debouncedOverlayType,
    debouncedOverlayIntensity,
    debouncedCustomOverlayUrl,
    debouncedOverlayZoom,
    debouncedOverlayRotation,
    debouncedOverlayOffsetX,
    debouncedOverlayOffsetY,
    overlayCanvasRef,
    dispatch
  ]);

  const processImage = useCallback(async () => {
    if (!imageRef.current || !canvasRef.current) return
    dispatch({ type: 'SET_LOADING', payload: true })

    const img = imageRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    canvas.width = img.naturalWidth // Use naturalWidth/Height for original size
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const blendFactor = debouncedBlendLevel / 100

    // Apply filters
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

      data[i] = Math.max(0, Math.min(255, r))
      data[i + 1] = Math.max(0, Math.min(255, g))
      data[i + 2] = Math.max(0, Math.min(255, b))
    }
    ctx.putImageData(imageData, 0, 0)

    let canvasToProcess = canvas

    // Apply overlay if needed
    if (debouncedOverlayType !== 'none') {
      canvasToProcess = await applyOverlay(canvas) // Await and update canvas
    }

    const dataUrl = canvasToProcess.toDataURL('image/png')
    dispatch({ type: 'SET_PROCESSED_IMAGE', payload: dataUrl })
  }, [
    debouncedGrayscaleLevel,
    debouncedDarknessLevel,
    debouncedNoirLevel,
    debouncedSimplicityLevel,
    debouncedBlendLevel,
    applyOverlay,
    debouncedOverlayType,
    dispatch
  ])

  useEffect(() => {
    let mounted = true
    let currentImage: HTMLImageElement | null = null

    if (state.image && !imageRef.current) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      currentImage = img
      
      img.onload = () => {
        if (!mounted) return
        imageRef.current = img
        processImage()
      }

      img.onerror = () => {
        if (!mounted) return
        dispatch({ type: 'SET_ERROR', payload: ERROR_LOADING_IMAGE })
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

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleCustomOverlayUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      if (url) {
        dispatch({ type: 'SET_CUSTOM_OVERLAY_URL', payload: url })
        dispatch({ type: 'SET_OVERLAY_TYPE', payload: 'custom' })
      }
      // Clean up listeners
      reader.onload = null;
      reader.onerror = null;
    }
    reader.onerror = () => {
      dispatch({ type: 'SET_ERROR', payload: ERROR_READING_OVERLAY })
      // Clean up listeners
      reader.onload = null;
      reader.onerror = null;
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto p-4 sm:p-6 bg-black text-white">
        <h1 className="text-2xl font-semibold mb-6 text-center">tlenogram</h1>
        
        <div className="mb-6">
          <Input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES_STRING}
            onChange={handleImageUpload}
            className="hidden"
            aria-label="upload image"
          />
          <Button
            onClick={handleFileButtonClick}
            className="w-full"
            aria-controls={fileInputRef.current?.id}
            aria-expanded="false"
          >
            <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>choose file</span>
          </Button>
        </div>

        {state.error && <p className="text-red-400 text-sm mb-4">{state.error}</p>}

        {state.image && (
          <div className="mb-6">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <Image 
                src={state.processedImage || state.image || ''} 
                alt="processed image" 
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
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
                  size="sm"
                  disabled={state.loading}
                >
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>download</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {state.image && (
          <>
            <Filters state={state} dispatch={dispatch} />
            <Overlays 
              state={state} 
              dispatch={dispatch} 
              onCustomOverlayUpload={handleCustomOverlayUpload} 
            />
          </>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <canvas ref={overlayCanvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  )
}
