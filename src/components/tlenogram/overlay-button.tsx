import Image from 'next/image'

type OverlayButtonProps = {
  type: string
  url: string | null
  isSelected: boolean
  onClick: () => void
}

export function OverlayButton({ type, url, isSelected, onClick }: OverlayButtonProps) {
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