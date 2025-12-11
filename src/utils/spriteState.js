/**
 * Convert frames array to SpriteGridLayers
 * @param {Frame[]} frames
 * @param {number} activeFrame
 * @param {number} width
 * @param {number} height
 * @returns {SpriteGridLayers}
 */
export function framesToSpriteGridLayers(frames, activeFrame, width, height) {
  return {
    width,
    height,
    frames,
    activeFrame
  }
}

/**
 * Get frames from SpriteGridLayers
 * @param {SpriteGridLayers} spriteGridLayers
 * @returns {Frame[]}
 */
export function getFramesFromSpriteGridLayers(spriteGridLayers) {
  return spriteGridLayers.frames
}

/**
 * Initialize SpriteState from current frames
 * @param {Frame[]} frames
 * @param {number} activeFrame
 * @param {number} width
 * @param {number} height
 * @returns {SpriteState}
 */
export function initializeSpriteState(frames, activeFrame, width, height) {
  return {
    original: framesToSpriteGridLayers(frames, activeFrame, width, height),
    flippedRaw: null,
    flippedFixed: null
  }
}

/**
 * Update a specific variant in SpriteState
 * @param {SpriteState} spriteState
 * @param {SpriteVariant} variant
 * @param {SpriteGridLayers} newVariantState
 * @returns {SpriteState}
 */
export function updateVariant(spriteState, variant, newVariantState) {
  return {
    ...spriteState,
    [variant]: newVariantState
  }
}

