import { Dispatch } from 'react'
import { Action, State } from './types'
import { Slider } from "@/components/ui/slider"

type FiltersSectionProps = {
  state: State
  dispatch: Dispatch<Action>
}

function FilterSlider({ label, value, onChange }: { 
  label: string
  value: number
  onChange: (value: number) => void 
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-2">{label} - {value}%</p>
      <Slider
        min={0}
        max={100}
        step={1}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
      />
    </div>
  )
}

export function Filters({ state, dispatch }: FiltersSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FilterSlider
          label="grayscale"
          value={state.grayscaleLevel}
          onChange={(value) => dispatch({ type: 'SET_GRAYSCALE_LEVEL', payload: value })}
        />
        <FilterSlider
          label="darkness"
          value={state.darknessLevel}
          onChange={(value) => dispatch({ type: 'SET_DARKNESS_LEVEL', payload: value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FilterSlider
          label="noir"
          value={state.noirLevel}
          onChange={(value) => dispatch({ type: 'SET_NOIR_LEVEL', payload: value })}
        />
        <FilterSlider
          label="simplicity"
          value={state.simplicityLevel}
          onChange={(value) => dispatch({ type: 'SET_SIMPLICITY_LEVEL', payload: value })}
        />
      </div>
      <FilterSlider
        label="filter intensity"
        value={state.blendLevel}
        onChange={(value) => dispatch({ type: 'SET_BLEND_LEVEL', payload: value })}
      />
    </div>
  )
} 