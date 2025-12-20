/**
 * Utility functions for exporting sprites
 */

/**
 * Parse RGBA color string to components
 * @param {string} color - RGBA color string like "rgba(255, 0, 0, 1)"
 * @returns {Object|null} - { r, g, b, a } or null if invalid
 */
function parseRgbaColor(color) {
  const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (!rgba) return null
  
  const [_, r, g, b, a] = rgba
  return {
    r: parseInt(r, 10),
    g: parseInt(g, 10),
    b: parseInt(b, 10),
    a: a ? parseFloat(a) : 1
  }
}

/**
 * Draw a single frame to a canvas context
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Frame} frame - Frame to draw
 * @param {number} width - Sprite width
 * @param {number} height - Sprite height
 * @param {number} scale - Scale factor
 * @param {number} offsetX - X offset
 * @param {number} offsetY - Y offset
 */
function drawFrameToContext(ctx, frame, width, height, scale, offsetX = 0, offsetY = 0) {
  // Composite all visible layers in order
  frame.layers.forEach(layer => {
    if (!layer.visible) return
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = layer.pixels[y][x]
        if (color) {
          const rgba = parseRgbaColor(color)
          if (rgba) {
            const alpha = layer.opacity * rgba.a
            ctx.globalAlpha = alpha
            ctx.fillStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha})`
            ctx.fillRect(
              offsetX + x * scale,
              offsetY + y * scale,
              scale,
              scale
            )
            ctx.globalAlpha = 1
          }
        }
      }
    }
  })
}

/**
 * Export a single frame as PNG
 * @param {Frame} frame - Frame to export
 * @param {number} width - Sprite width
 * @param {number} height - Sprite height
 * @param {number} scale - Scale factor
 * @param {string} filename - Filename for download
 */
export function exportSingleFrame(frame, width, height, scale, filename = 'pixel-art.png') {
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  drawFrameToContext(ctx, frame, width, height, scale)
  
  // Download as PNG
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

/**
 * Export multiple frames as a sprite sheet
 * @param {Frame[]} frames - Frames to export
 * @param {number} width - Sprite width
 * @param {number} height - Sprite height
 * @param {number} scale - Scale factor
 * @param {number} framesPerRow - Number of frames per row
 * @param {string} filename - Filename for download
 */
export function exportSpriteSheet(frames, width, height, scale, framesPerRow, filename = 'sprite-sheet.png') {
  const numFrames = frames.length
  const cols = Math.min(framesPerRow, numFrames)
  const rows = Math.ceil(numFrames / cols)
  const canvas = document.createElement('canvas')
  canvas.width = width * cols * scale
  canvas.height = height * rows * scale
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // Draw each frame
  frames.forEach((frame, idx) => {
    const col = idx % cols
    const row = Math.floor(idx / cols)
    const x = col * width * scale
    const y = row * height * scale
    
    drawFrameToContext(ctx, frame, width, height, scale, x, y)
  })
  
  // Download as PNG
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

/**
 * Main export function
 * @param {Object} options - Export options
 * @param {string} options.mode - 'single' or 'spriteSheet'
 * @param {number} options.scale - Scale factor
 * @param {number} options.framesPerRow - Frames per row (for sprite sheet)
 * @param {boolean} options.exportAllFrames - Export all frames or just active
 * @param {Frame[]} options.frames - All frames
 * @param {number} options.activeFrame - Active frame index
 * @param {number} options.width - Sprite width
 * @param {number} options.height - Sprite height
 */
export function exportSprites(options) {
  const { mode, scale, framesPerRow, exportAllFrames, frames, activeFrame, width, height } = options
  
  const framesToExport = exportAllFrames ? frames : [frames[activeFrame]]
  
  if (mode === 'single') {
    exportSingleFrame(framesToExport[0], width, height, scale)
  } else {
    exportSpriteSheet(framesToExport, width, height, scale, framesPerRow)
  }
}

