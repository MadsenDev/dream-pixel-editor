/**
 * Utility functions for layer manipulation
 */

/**
 * Create a new empty layer
 * @param {number} layerId - ID for the new layer
 * @param {string} layerName - Name for the new layer
 * @param {number} gridWidth - Width of the grid
 * @param {number} gridHeight - Height of the grid
 * @returns {Layer}
 */
export function createEmptyLayer(layerId, layerName, gridWidth, gridHeight) {
  return {
    id: layerId,
    name: layerName,
    visible: true,
    opacity: 1,
    groupId: null,
    pixels: Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null))
  }
}

/**
 * Duplicate a layer
 * @param {Layer} layer - Layer to duplicate
 * @param {number} newId - ID for the duplicated layer
 * @returns {Layer}
 */
export function duplicateLayer(layer, newId) {
  return {
    ...layer,
    id: newId,
    name: `${layer.name} (copy)`,
    pixels: layer.pixels.map(row => [...row])
  }
}

/**
 * Calculate the new active layer index after deleting a layer
 * @param {number} deletedIndex - Index of the layer being deleted
 * @param {number} currentActiveIndex - Current active layer index
 * @param {number} totalLayers - Total number of layers before deletion
 * @returns {number} - New active layer index
 */
export function calculateNewActiveLayerAfterDelete(deletedIndex, currentActiveIndex, totalLayers) {
  if (currentActiveIndex === deletedIndex) {
    return 0 // Move to first layer
  } else if (currentActiveIndex > deletedIndex) {
    return currentActiveIndex - 1 // Shift back
  }
  return currentActiveIndex // No change
}

/**
 * Move a layer within a frame
 * @param {Layer[]} layers - Array of layers
 * @param {number} fromIndex - Index to move from
 * @param {number|string} toIndexOrDirection - Index to move to, or 'up'/'down'
 * @param {number} currentActiveIndex - Current active layer index
 * @returns {Object|null} - { newLayers, newActiveIndex } or null if invalid move
 */
export function moveLayer(layers, fromIndex, toIndexOrDirection, currentActiveIndex) {
  let toIndex = toIndexOrDirection
  
  // Handle direction strings
  if (typeof toIndexOrDirection === 'string') {
    if (toIndexOrDirection === 'up' && fromIndex > 0) {
      toIndex = fromIndex - 1
    } else if (toIndexOrDirection === 'down' && fromIndex < layers.length - 1) {
      toIndex = fromIndex + 1
    } else {
      return null // Invalid move
    }
  }
  
  // Validate indices
  if (fromIndex === toIndex || toIndex < 0 || toIndex >= layers.length) {
    return null
  }
  
  const newLayers = [...layers]
  const [moved] = newLayers.splice(fromIndex, 1)
  newLayers.splice(toIndex, 0, moved)
  
  // Calculate new active index
  let newActiveIndex = currentActiveIndex
  if (currentActiveIndex === fromIndex) {
    newActiveIndex = toIndex
  } else if (fromIndex < currentActiveIndex && toIndex >= currentActiveIndex) {
    newActiveIndex = currentActiveIndex - 1
  } else if (fromIndex > currentActiveIndex && toIndex <= currentActiveIndex) {
    newActiveIndex = currentActiveIndex + 1
  }
  
  return { newLayers, newActiveIndex }
}

/**
 * Merge multiple layers into one
 * @param {Layer[]} layers - Array of all layers
 * @param {number[]} indicesToMerge - Indices of layers to merge
 * @param {number} gridWidth - Width of the grid
 * @param {number} gridHeight - Height of the grid
 * @param {number} newLayerId - ID for the merged layer
 * @returns {Object} - { mergedLayer, remainingLayers }
 */
export function mergeLayers(layers, indicesToMerge, gridWidth, gridHeight, newLayerId) {
  if (indicesToMerge.length < 2) {
    return null
  }
  
  const remainingLayers = layers.filter((_, i) => !indicesToMerge.includes(i))
  const mergedPixels = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null))
  
  // Composite all layers to merge (top layer wins)
  indicesToMerge.forEach(idx => {
    const layer = layers[idx]
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (layer.pixels[y][x]) {
          mergedPixels[y][x] = layer.pixels[y][x]
        }
      }
    }
  })
  
  const mergedLayer = {
    id: newLayerId,
    name: 'Merged Layer',
    visible: true,
    opacity: 1,
    groupId: null,
    pixels: mergedPixels
  }
  
  return { mergedLayer, remainingLayers }
}

