import { FilterSlider } from './filter-slider'
import { Dispatch } from 'react'
import { Action, State } from './types'

type FiltersSectionProps = {
  state: State
  dispatch: Dispatch<Action>
}

export function FiltersSection({ state, dispatch }: FiltersSectionProps) {
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