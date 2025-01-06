import { Dispatch } from 'react'
import { Action, State, OverlayType } from './types'
import { OverlayButton } from './overlay-button'
import { FilterSlider } from './filter-slider'

const overlays: Record<OverlayType, string | null> = {
  'none': null,
  'cracked': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-4BUwosPWLHIJuBhWNqD6vn91zlwOPl.png',
  'branches': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-Pww85QkRX55df7GW10JYVn7b7ejDGd.jpeg',
  'chairs': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-v1ScrsshSwLjJwqqh5k2dIC00u2woA.jpg',
  'forest': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-gbMk6jhu1yVKlbxTbWH9cnhZRAhiYx.jpg',
  'horror': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-GkS1bV88jaR9UYwtT6SZkLE2ciX5Cl.jpeg',
  'city': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-LMMBqJgiRbgyfTcb09R73grtjoamzt.jpg'
}

type OverlaysSectionProps = {
  state: State
  dispatch: Dispatch<Action>
}

export function OverlaysSection({ state, dispatch }: OverlaysSectionProps) {
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
          <FilterSlider
            label="overlay intensity"
            value={state.overlayIntensity}
            onChange={(value) => dispatch({ type: 'SET_OVERLAY_INTENSITY', payload: value })}
          />
        </div>
      )}
    </>
  )
} 