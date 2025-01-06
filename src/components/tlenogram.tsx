'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Loader2, Upload, Download } from "lucide-react"

export default function Tlenogram() {
  const [image, setImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [blendLevel, setBlendLevel] = useState(100)
  const [darknessLevel, setDarknessLevel] = useState(0)
  const [noirLevel, setNoirLevel] = useState(20)
  const [grayscaleLevel, setGrayscaleLevel] = useState(100)
  const [simplicityLevel, setSimplicityLevel] = useState(0)
  const [overlayType, setOverlayType] = useState<string>('none')
  const [overlayIntensity, setOverlayIntensity] = useState(50)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)

  const overlays: Record<string, string | null> = {
    'none': null,
    'cracked': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-4BUwosPWLHIJuBhWNqD6vn91zlwOPl.png',
    'branches': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-Pww85QkRX55df7GW10JYVn7b7ejDGd.jpeg',
    'chairs': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-v1ScrsshSwLjJwqqh5k2dIC00u2woA.jpg',
    'forest': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-gbMk6jhu1yVKlbxTbWH9cnhZRAhiYx.jpg',
    'horror': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-GkS1bV88jaR9UYwtT6SZkLE2ciX5Cl.jpeg',
    'city': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-LMMBqJgiRbgyfTcb09R73grtjoamzt.jpg'
  }

  useEffect(() => {
    if (image) {
      processImage()
    }
  }, [image, blendLevel, darknessLevel, noirLevel, grayscaleLevel, simplicityLevel, overlayType, overlayIntensity])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('file too large. max 10mb')
        return
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('only jpg, png, webp allowed')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const applyOverlay = async (canvas: HTMLCanvasElement) => {
    const overlayUrl = overlays[overlayType as keyof typeof overlays]
    if (!overlayUrl) return canvas

    const ctx = canvas.getContext('2d')
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
        const octx = overlayCanvas.getContext('2d')
        if (!octx) {
          resolve(canvas)
          return
        }

        // Scale and position overlay to cover the entire image
        const scale = Math.max(
          canvas.width / overlayImg.width,
          canvas.height / overlayImg.height
        )
        const scaledWidth = overlayImg.width * scale
        const scaledHeight = overlayImg.height * scale
        const x = (canvas.width - scaledWidth) / 2
        const y = (canvas.height - scaledHeight) / 2

        octx.drawImage(overlayImg, x, y, scaledWidth, scaledHeight)
        
        // Apply overlay with specified intensity
        ctx.globalAlpha = overlayIntensity / 100
        ctx.globalCompositeOperation = 'multiply'
        ctx.drawImage(overlayCanvas, 0, 0)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'

        resolve(canvas)
      }
      overlayImg.src = overlayUrl
    })
  }

  const processImage = async () => {
    if (!image) return
    setLoading(true)

    const img = new Image()
    img.onload = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      const blendFactor = blendLevel / 100

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i]
        let g = data[i + 1]
        let b = data[i + 2]

        // Apply grayscale
        const gray = (r * 0.299 + g * 0.587 + b * 0.114)
        const grayscaleFactor = (grayscaleLevel / 100) * blendFactor
        r = r * (1 - grayscaleFactor) + gray * grayscaleFactor
        g = g * (1 - grayscaleFactor) + gray * grayscaleFactor
        b = b * (1 - grayscaleFactor) + gray * grayscaleFactor

        // Apply noir (lift black point)
        const noirFactor = (noirLevel / 100) * blendFactor
        r = r + (255 - r) * noirFactor
        g = g + (255 - g) * noirFactor
        b = b + (255 - b) * noirFactor

        // Apply simplicity (increase contrast)
        const simplicityFactor = (simplicityLevel / 100) * blendFactor
        r = r < 128 ? r * (1 - simplicityFactor) : r + (255 - r) * simplicityFactor
        g = g < 128 ? g * (1 - simplicityFactor) : g + (255 - g) * simplicityFactor
        b = b < 128 ? b * (1 - simplicityFactor) : b + (255 - b) * simplicityFactor

        // Apply darkness
        const darknessFactor = (darknessLevel / 100) * blendFactor
        r *= (1 - darknessFactor)
        g *= (1 - darknessFactor)
        b *= (1 - darknessFactor)

        data[i] = r
        data[i + 1] = g
        data[i + 2] = b
      }

      ctx.putImageData(imageData, 0, 0)

      // Apply overlay if selected
      if (overlayType !== 'none') {
        await applyOverlay(canvas)
      }

      setProcessedImage(canvas.toDataURL('image/png'))
      setLoading(false)
    }
    img.src = image
  }

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a')
      link.href = processedImage
      link.download = 'tlenogram_image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
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

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {image && (
          <div className="mb-6">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <img 
                src={processedImage || image || ''} 
                alt="processed image" 
                className="object-cover w-full h-full"
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
            {processedImage && (
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={downloadImage}
                  className="bg-gray-800 text-white hover:bg-gray-700"
                  size="sm"
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  download
                </Button>
              </div>
            )}
          </div>
        )}

        {image && (
          <>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">
                    grayscale - {grayscaleLevel}%
                  </p>
                  <Slider
                    id="grayscale-level"
                    min={0}
                    max={100}
                    step={1}
                    value={[grayscaleLevel]}
                    onValueChange={(value) => setGrayscaleLevel(value[0])}
                    className="w-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">
                    darkness - {darknessLevel}%
                  </p>
                  <Slider
                    id="darkness-level"
                    min={0}
                    max={100}
                    step={1}
                    value={[darknessLevel]}
                    onValueChange={(value) => setDarknessLevel(value[0])}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">
                    noir - {noirLevel}%
                  </p>
                  <Slider
                    id="noir-level"
                    min={0}
                    max={100}
                    step={1}
                    value={[noirLevel]}
                    onValueChange={(value) => setNoirLevel(value[0])}
                    className="w-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">
                    simplicity - {simplicityLevel}%
                  </p>
                  <Slider
                    id="simplicity-level"
                    min={0}
                    max={100}
                    step={1}
                    value={[simplicityLevel]}
                    onValueChange={(value) => setSimplicityLevel(value[0])}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">
                  filter intensity - {blendLevel}%
                </p>
                <Slider
                  id="blend-level"
                  min={0}
                  max={100}
                  step={1}
                  value={[blendLevel]}
                  onValueChange={(value) => setBlendLevel(value[0])}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium mb-2">overlay</p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setOverlayType('none')}
                  className={`aspect-square rounded overflow-hidden border-2 ${
                    overlayType === 'none' ? 'border-white' : 'border-transparent'
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
                      onClick={() => setOverlayType(key)}
                      className={`aspect-square rounded overflow-hidden border-2 ${
                        overlayType === key ? 'border-white' : 'border-transparent'
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

            {overlayType !== 'none' && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">
                  overlay intensity - {overlayIntensity}%
                </p>
                <Slider
                  id="overlay-intensity"
                  min={0}
                  max={100}
                  step={1}
                  value={[overlayIntensity]}
                  onValueChange={(value) => setOverlayIntensity(value[0])}
                  className="w-full"
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