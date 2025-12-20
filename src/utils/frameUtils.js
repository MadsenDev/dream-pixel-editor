/**
 * Utility functions for frame manipulation
 */

/**
 * Create a new empty frame
 * @param {number} frameId - ID for the new frame
 * @param {string} frameName - Name for the new frame
 * @param {number} gridWidth - Width of the grid
 * @param {number} gridHeight - Height of the grid
 * @returns {Frame}
 */
export function createEmptyFrame(frameId, frameName, gridWidth, gridHeight) {
  return {
    id: frameId,
    name: frameName,
    layers: [
      {
        id: 1,
        name: 'Layer 1',
        visible: true,
        opacity: 1,
        groupId: null,
        pixels: Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null))
      }
    ],
    layerIdCounter: 1,
    nextGroupId: 1,
    activeLayer: 0
  }
}

/**
 * Duplicate a frame
 * @param {Frame} frame - Frame to duplicate
 * @param {number} newId - ID for the duplicated frame
 * @returns {Frame}
 */
export function duplicateFrame(frame, newId) {
  return {
    ...frame,
    id: newId,
    name: `${frame.name} (copy)`,
    layers: frame.layers.map(layer => ({
      ...layer,
      pixels: layer.pixels.map(row => [...row])
    })),
    layerIdCounter: frame.layerIdCounter,
    nextGroupId: frame.nextGroupId,
    activeLayer: frame.activeLayer
  }
}

/**
 * Calculate the new active frame index after deleting a frame
 * @param {number} deletedIndex - Index of the frame being deleted
 * @param {number} currentActiveIndex - Current active frame index
 * @param {number} totalFrames - Total number of frames before deletion
 * @returns {number} - New active frame index
 */
export function calculateNewActiveFrameAfterDelete(deletedIndex, currentActiveIndex, totalFrames) {
  if (currentActiveIndex === deletedIndex) {
    // If deleting the active frame, move to previous or first
    return deletedIndex > 0 ? deletedIndex - 1 : 0
  } else if (currentActiveIndex > deletedIndex) {
    // If active frame is after deleted frame, shift it back
    return currentActiveIndex - 1
  }
  // Active frame is before deleted frame, no change needed
  return currentActiveIndex
}

/**
 * Reorder frames in an array
 * @param {Frame[]} frames - Array of frames
 * @param {number} fromIndex - Index to move from
 * @param {number} toIndex - Index to move to
 * @returns {Object} - { newFrames, newActiveIndex }
 */
export function reorderFrames(frames, fromIndex, toIndex, currentActiveIndex) {
  if (fromIndex === toIndex) {
    return { newFrames: frames, newActiveIndex: currentActiveIndex }
  }
  
  const newFrames = [...frames]
  const [moved] = newFrames.splice(fromIndex, 1)
  newFrames.splice(toIndex, 0, moved)
  
  // Update activeFrame if needed
  let newActiveIndex = currentActiveIndex
  if (currentActiveIndex === fromIndex) {
    newActiveIndex = toIndex
  } else if (fromIndex < currentActiveIndex && toIndex >= currentActiveIndex) {
    newActiveIndex = currentActiveIndex - 1
  } else if (fromIndex > currentActiveIndex && toIndex <= currentActiveIndex) {
    newActiveIndex = currentActiveIndex + 1
  }
  
  return { newFrames, newActiveIndex }
}

