/**
 * Sprite variant types
 * @typedef {'original' | 'flippedRaw' | 'flippedFixed'} SpriteVariant
 */

/**
 * Layer structure
 * @typedef {Object} Layer
 * @property {number} id
 * @property {string} name
 * @property {boolean} visible
 * @property {number} opacity
 * @property {number|null} groupId
 * @property {(string|null)[][]} pixels - 2D array [y][x] of color strings or null
 */

/**
 * Frame structure (for animation)
 * @typedef {Object} Frame
 * @property {number} id
 * @property {string} name
 * @property {Layer[]} layers
 * @property {number} layerIdCounter
 * @property {number} nextGroupId
 * @property {number} activeLayer
 */

/**
 * Sprite grid layers - represents a single variant's state
 * @typedef {Object} SpriteGridLayers
 * @property {number} width
 * @property {number} height
 * @property {Frame[]} frames - frames for this variant
 * @property {number} activeFrame
 */

/**
 * Complete sprite state with all variants
 * @typedef {Object} SpriteState
 * @property {SpriteGridLayers} original - always present
 * @property {SpriteGridLayers|null} flippedRaw - null until generated
 * @property {SpriteGridLayers|null} flippedFixed - null until generated
 */

export const SPRITE_VARIANTS = {
  ORIGINAL: 'original',
  FLIPPED_RAW: 'flippedRaw',
  FLIPPED_FIXED: 'flippedFixed'
}

