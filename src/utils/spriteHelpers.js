/**
 * Deep clone a layer
 * @param {Layer} layer
 * @returns {Layer}
 */
function cloneLayer(layer) {
  return {
    ...layer,
    pixels: layer.pixels.map(row => [...row])
  }
}

/**
 * Deep clone a frame
 * @param {Frame} frame
 * @returns {Frame}
 */
function cloneFrame(frame) {
  return {
    ...frame,
    layers: frame.layers.map(cloneLayer)
  }
}

/**
 * Deep clone sprite grid layers
 * @param {SpriteGridLayers} sprite
 * @returns {SpriteGridLayers}
 */
export function cloneSprite(sprite) {
  return {
    width: sprite.width,
    height: sprite.height,
    frames: sprite.frames.map(cloneFrame),
    activeFrame: sprite.activeFrame
  }
}

/**
 * Flip a layer's pixels horizontally
 * @param {Layer} layer
 * @param {number} width
 * @returns {Layer}
 */
function flipLayerHorizontally(layer, width) {
  const flippedPixels = layer.pixels.map(row => {
    const newRow = [...row]
    // Swap pixels horizontally
    for (let x = 0; x < Math.floor(width / 2); x++) {
      const swapX = width - 1 - x
      const temp = newRow[x]
      newRow[x] = newRow[swapX]
      newRow[swapX] = temp
    }
    return newRow
  })
  return {
    ...layer,
    pixels: flippedPixels
  }
}

/**
 * Flip sprite horizontally
 * @param {SpriteGridLayers} sprite
 * @returns {SpriteGridLayers}
 */
export function flipSpriteHorizontally(sprite) {
  const flippedFrames = sprite.frames.map(frame => ({
    ...frame,
    layers: frame.layers.map(layer => flipLayerHorizontally(layer, sprite.width))
  }))
  
  return {
    width: sprite.width,
    height: sprite.height,
    frames: flippedFrames,
    activeFrame: sprite.activeFrame
  }
}

/**
 * Convert sprite layers to a 2D grid of palette indices
 * For now, we'll flatten all visible layers (top layer wins)
 * and return a simple grid. Later we can add palette mapping.
 * 
 * @param {SpriteGridLayers} sprite
 * @param {number} frameIndex - which frame to convert (defaults to activeFrame)
 * @returns {number[][]} - 2D array [y][x] of palette indices (or -1 for transparent)
 */
export function spriteToGrid(sprite, frameIndex = null) {
  const frame = frameIndex !== null ? sprite.frames[frameIndex] : sprite.frames[sprite.activeFrame]
  const { width, height } = sprite
  
  // Create a grid initialized to -1 (transparent)
  const grid = Array(height).fill(null).map(() => Array(width).fill(-1))
  
  // Composite all visible layers (top layer wins)
  frame.layers.forEach(layer => {
    if (!layer.visible) return
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = layer.pixels[y][x]
        if (color) {
          // For now, we'll use a simple hash of the color as the index
          // In a real implementation, you'd map to a palette
          // This is a placeholder - we'll improve this later
          const colorStr = color.toString()
          let index = colorStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 256
          if (index < 0) index = -index
          grid[y][x] = index
        }
      }
    }
  })
  
  return grid
}

/**
 * Convert a grid back to sprite layers
 * This creates a single layer with the grid data
 * 
 * @param {number[][]} grid - 2D array [y][x] of palette indices
 * @param {SpriteGridLayers} existingSprite - template for structure
 * @param {string[]} palette - optional palette mapping (index -> color)
 * @returns {SpriteGridLayers}
 */
export function gridToSprite(grid, existingSprite, palette = null) {
  const height = grid.length
  const width = grid[0].length
  
  // Create a default palette if none provided
  // This is a placeholder - in real use, you'd have a proper palette
  const defaultPalette = Array(256).fill(null).map((_, i) => {
    const r = (i * 7) % 256
    const g = (i * 11) % 256
    const b = (i * 13) % 256
    return `rgba(${r}, ${g}, ${b}, 1)`
  })
  
  const colorPalette = palette || defaultPalette
  
  // Convert grid to pixels
  const pixels = grid.map(row => 
    row.map(index => {
      if (index === -1 || index < 0 || index >= colorPalette.length) return null
      return colorPalette[index]
    })
  )
  
  // Create a new frame with a single layer
  const newLayer = {
    id: 1,
    name: 'Layer 1',
    visible: true,
    opacity: 1,
    groupId: null,
    pixels
  }
  
  const newFrame = {
    id: 1,
    name: 'Frame 1',
    layers: [newLayer],
    layerIdCounter: 1,
    nextGroupId: 1,
    activeLayer: 0
  }
  
  return {
    width,
    height,
    frames: [newFrame],
    activeFrame: 0
  }
}

