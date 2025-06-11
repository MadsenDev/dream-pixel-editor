function snapColor(r, g, b, a, step = 8) {
  const snap = v => Math.min(255, Math.round(v / step) * step);
  const alpha = Math.round(a / 255 * 100) / 100; // Round to 2 decimal places
  return `rgba(${snap(r)}, ${snap(g)}, ${snap(b)}, ${alpha})`;
}

export async function importPngToFrame(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const img = new Image()
        img.onload = () => {
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')
          tempCanvas.width = img.width
          tempCanvas.height = img.height
          tempCtx.drawImage(img, 0, 0)
          const imageData = tempCtx.getImageData(0, 0, img.width, img.height)
          const data = imageData.data
          const newPixelData = Array(img.height).fill(null).map(() => Array(img.width).fill(null))
          for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
              const idx = (y * img.width + x) * 4
              const r = data[idx]
              const g = data[idx + 1]
              const b = data[idx + 2]
              const a = data[idx + 3]
              if (a > 0) {
                newPixelData[y][x] = snapColor(r, g, b, a, 8)
              }
            }
          }
          const frame = {
            id: Date.now(),
            name: 'Imported Frame',
            layers: [
              {
                id: 1,
                name: 'Layer 1',
                visible: true,
                opacity: 1,
                groupId: null,
                pixels: newPixelData
              }
            ],
            layerIdCounter: 1,
            nextGroupId: 1,
            activeLayer: 0
          }
          resolve({ frame, width: img.width, height: img.height })
        }
        img.onerror = reject
        img.src = event.target.result
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function importSpriteSheetToFrames(file, { rows, cols, cellWidth, cellHeight }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const img = new Image()
        img.onload = () => {
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')
          tempCanvas.width = img.width
          tempCanvas.height = img.height
          tempCtx.drawImage(img, 0, 0)
          const frames = []
          let frameId = Date.now()
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x0 = col * cellWidth
              const y0 = row * cellHeight
              const imageData = tempCtx.getImageData(x0, y0, cellWidth, cellHeight)
              const data = imageData.data
              const newPixelData = Array(cellHeight).fill(null).map(() => Array(cellWidth).fill(null))
              for (let y = 0; y < cellHeight; y++) {
                for (let x = 0; x < cellWidth; x++) {
                  const idx = (y * cellWidth + x) * 4
                  const r = data[idx]
                  const g = data[idx + 1]
                  const b = data[idx + 2]
                  const a = data[idx + 3]
                  if (a > 0) {
                    newPixelData[y][x] = snapColor(r, g, b, a, 8)
                  }
                }
              }
              frames.push({
                id: frameId++,
                name: `Frame ${frames.length + 1}`,
                layers: [
                  {
                    id: 1,
                    name: 'Layer 1',
                    visible: true,
                    opacity: 1,
                    groupId: null,
                    pixels: newPixelData
                  }
                ],
                layerIdCounter: 1,
                nextGroupId: 1,
                activeLayer: 0
              })
            }
          }
          resolve({ frames, width: cellWidth, height: cellHeight })
        }
        img.onerror = reject
        img.src = event.target.result
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
} 