const worker = self as unknown as Worker

worker.onmessage = function(e) {
  const { 
    imageData, 
    blendLevel, 
    darknessLevel, 
    noirLevel, 
    grayscaleLevel, 
    simplicityLevel
  } = e.data

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

  worker.postMessage(imageData)
}

export default {} as typeof Worker & { new (): Worker } 