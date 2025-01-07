import { Dispatch } from 'react'
import { Action, State, OverlayType } from './types'
import { overlays } from './constants'
import Image from 'next/image'
import { Slider } from "@/components/ui/slider"

type OverlaysSectionProps = {
  state: State
  dispatch: Dispatch<Action>
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
        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-white">
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

export function Overlays({ state, dispatch }: OverlaysSectionProps) {
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
            if (key === 'none') return null
            return (
              <OverlayButton
                key={key}
                type={key}
                url={url}
                isSelected={state.overlayType === key}
                onClick={() => dispatch({ type: 'SET_OVERLAY_TYPE', payload: key as OverlayType })}
              />
            )
          })}
        </div>
      </div>

      {state.overlayType !== 'none' && (
        <div className="mt-6">
          <div>
            <p className="text-sm font-medium mb-2">overlay intensity - {state.overlayIntensity}%</p>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[state.overlayIntensity]}
              onValueChange={(values) => dispatch({ type: 'SET_OVERLAY_INTENSITY', payload: values[0] })}
            />
          </div>
        </div>
      )}
    </>
  )
} 