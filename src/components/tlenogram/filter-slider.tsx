import { Slider } from "@/components/ui/slider"

type FilterSliderProps = {
  label: string
  value: number
  onChange: (value: number) => void
}

export function FilterSlider({ label, value, onChange }: FilterSliderProps) {
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