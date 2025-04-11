import { Dispatch, useRef } from 'react'
import { Action, State, OverlayType, StandardOverlayType } from './types'
import { overlays, SLIDER_MIN, SLIDER_MAX, SLIDER_DEFAULT_CENTER } from './constants'
import Image from 'next/image'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { sliderValueToZoom, zoomToSliderValue, sliderValueToRotation, sliderValueToOffsetPercent } from "@/lib/utils"

type OverlaysSectionProps = {
  state: State
  dispatch: Dispatch<Action>
  onCustomOverlayUpload: (file: File) => void
}

function OverlayButton({ 
  type, 
  url, 
  isSelected, 
  onClick 
}: {
  type: string
  url: string | null
  isSelected: boolean
  onClick: () => void
}) {
  if (type === 'none') {
    return (
      <button
        onClick={onClick}
        className={`aspect-square rounded overflow-hidden border-2 ${
          isSelected ? 'border-white' : 'border-transparent'
        }`}
      >
        <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-xs text-white">
          none
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`aspect-square relative rounded overflow-hidden border-2 ${
        isSelected ? 'border-white' : 'border-transparent'
      }`}
    >
      {url && (
        <Image 
          src={url} 
          alt={type}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 25vw, 10vw"
        />
      )}
    </button>
  )
}

export function Overlays({ state, dispatch, onCustomOverlayUpload }: OverlaysSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onCustomOverlayUpload(file)
      event.target.value = ''
    }
  }

  return (
    <>
      <div className="mt-6">
        <p className="text-sm font-medium mb-2">overlay</p>
        <div className="grid grid-cols-4 gap-2">
          <OverlayButton
            type="none"
            url={null}
            isSelected={state.overlayType === 'none'}
            onClick={() => dispatch({ type: 'SET_OVERLAY_TYPE', payload: 'none' })}
          />
          {Object.entries(overlays).map(([key, url]) => {
            return (
              <OverlayButton
                key={key}
                type={key}
                url={url}
                isSelected={state.overlayType === key}
                onClick={() => dispatch({ type: 'SET_OVERLAY_TYPE', payload: key as StandardOverlayType })}
              />
            )
          })}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="hidden"
            aria-label="upload custom overlay"
          />
          <button
            onClick={handleFileButtonClick}
            className={`aspect-square rounded overflow-hidden border-2 flex items-center justify-center bg-zinc-900 relative ${
              state.overlayType === 'custom' ? 'border-white' : 'border-transparent'
            }`}
            aria-controls={fileInputRef.current?.id}
            aria-expanded="false"
            aria-label="Upload custom overlay"
          >
            {state.customOverlayUrl ? (
              <>
                <Image 
                  src={state.customOverlayUrl} 
                  alt="custom overlay"
                  className="object-cover grayscale"
                  fill
                  sizes="(max-width: 768px) 25vw, 10vw"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Plus className="w-6 h-6 text-white/80" />
                </div>
              </>
            ) : (
              <Plus className="w-6 h-6 text-white" />
            )}
          </button>

        </div>
      </div>

      {(state.overlayType !== 'none') && (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">intensity - {state.overlayIntensity}%</p>
            <Slider
              min={SLIDER_MIN}
              max={SLIDER_MAX}
              step={1}
              value={[state.overlayIntensity]}
              onValueChange={(values) => dispatch({ type: 'SET_OVERLAY_INTENSITY', payload: values[0] })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">zoom - {sliderValueToZoom(state.overlayZoom).toFixed(1)}x</p>
              <Slider
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={1}
                defaultValue={[SLIDER_DEFAULT_CENTER]}
                value={[state.overlayZoom]}
                onValueChange={(values) => dispatch({ type: 'SET_OVERLAY_ZOOM', payload: values[0] })}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">rotation - {Math.round(sliderValueToRotation(state.overlayRotation))}°</p>
              <Slider
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={1}
                defaultValue={[SLIDER_DEFAULT_CENTER]}
                value={[state.overlayRotation]}
                onValueChange={(values) => dispatch({ type: 'SET_OVERLAY_ROTATION', payload: values[0] })}
              />
            </div>
          </div>
          {/* Grid for Offset X and Y */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">X offset - {Math.round(sliderValueToOffsetPercent(state.overlayOffsetX))}%</p>
              <Slider
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={1}
                defaultValue={[SLIDER_DEFAULT_CENTER]}
                value={[state.overlayOffsetX]}
                onValueChange={(values) => dispatch({ type: 'SET_OVERLAY_OFFSET_X', payload: values[0] })}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Y offset - {Math.round(sliderValueToOffsetPercent(state.overlayOffsetY))}%</p>
              <Slider
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={1}
                defaultValue={[SLIDER_DEFAULT_CENTER]}
                value={[state.overlayOffsetY]}
                onValueChange={(values) => dispatch({ type: 'SET_OVERLAY_OFFSET_Y', payload: values[0] })}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
} 