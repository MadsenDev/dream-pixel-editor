import { useState, useCallback } from 'react'
import { SPRITE_VARIANTS } from '../types/sprite'
import { flipSpriteHorizontally, cloneSprite, spriteToGrid, gridToSprite } from '../utils/spriteHelpers'
import { updateVariant } from '../utils/spriteState'
import { runFlipFixModel } from '../utils/flipFixModel'
import Canvas from './Canvas'
import { useCanvas } from '../hooks/useCanvas'
import { useDrawing } from '../hooks/useDrawing'
import { TOOLS, VIEW_HELPERS } from '../constants'

/**
 * FlipFixLab component for generating and editing flipped sprite variants
 */
export default function FlipFixLab({
  spriteState,
  setSpriteState,
  activeVariant,
  setActiveVariant,
  spriteSize,
  settings,
  zoom,
  pan,
  setPan,
  leftColor,
  rightColor,
  toolOptions,
  viewHelper
}) {
  const [showOnionSkin, setShowOnionSkin] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Get current variant states
  const originalState = spriteState.original
  const flippedRawState = spriteState.flippedRaw
  const flippedFixedState = spriteState.flippedFixed

  // Get frames for each variant
  const originalFrames = originalState ? originalState.frames : []
  const flippedRawFrames = flippedRawState ? flippedRawState.frames : []
  const flippedFixedFrames = flippedFixedState ? flippedFixedState.frames : []

  const originalActiveFrame = originalState?.activeFrame ?? 0
  const flippedRawActiveFrame = flippedRawState?.activeFrame ?? 0
  const flippedFixedActiveFrame = flippedFixedState?.activeFrame ?? 0

  // Only flippedFixed is editable
  const isEditable = activeVariant === SPRITE_VARIANTS.FLIPPED_FIXED

  // Get current layers based on active variant
  const getCurrentLayers = () => {
    if (activeVariant === SPRITE_VARIANTS.ORIGINAL && originalFrames.length > 0) {
      return originalFrames[originalActiveFrame]?.layers || []
    }
    if (activeVariant === SPRITE_VARIANTS.FLIPPED_RAW && flippedRawFrames.length > 0) {
      return flippedRawFrames[flippedRawActiveFrame]?.layers || []
    }
    if (activeVariant === SPRITE_VARIANTS.FLIPPED_FIXED && flippedFixedFrames.length > 0) {
      return flippedFixedFrames[flippedFixedActiveFrame]?.layers || []
    }
    return []
  }

  const currentLayers = getCurrentLayers()
  const currentFrame = 
    activeVariant === SPRITE_VARIANTS.ORIGINAL ? originalFrames[originalActiveFrame] :
    activeVariant === SPRITE_VARIANTS.FLIPPED_RAW ? flippedRawFrames[flippedRawActiveFrame] :
    flippedFixedFrames[flippedFixedActiveFrame]
  
  const activeLayer = currentFrame?.activeLayer ?? 0

  // Update layers for the active variant
  const updateActiveFrameLayers = useCallback((updater) => {
    if (!isEditable) return // Only allow editing flippedFixed
    
    setSpriteState(prevState => {
      const currentVariantState = prevState[activeVariant]
      if (!currentVariantState) return prevState
      
      const currentFrames = currentVariantState.frames
      const activeFrameIdx = currentVariantState.activeFrame
      const currentFrame = currentFrames[activeFrameIdx]
      
      const nextLayers = typeof updater === 'function' ? updater(currentFrame.layers) : updater
      if (nextLayers === currentFrame.layers) return prevState
      
      const updatedFrames = currentFrames.map((frame, idx) => 
        idx === activeFrameIdx ? { ...frame, layers: nextLayers } : frame
      )
      
      const updatedVariantState = {
        ...currentVariantState,
        frames: updatedFrames
      }
      
      return updateVariant(prevState, activeVariant, updatedVariantState)
    })
  }, [activeVariant, isEditable, setSpriteState])

  // Drawing hook (only active for flippedFixed)
  const {
    canvasRef,
    lineStart,
    linePreview,
    rectStart,
    rectPreview,
    circleStart,
    circlePreview,
    getPixelCoordinates,
    paintPixel,
    floodFill,
    drawLine,
    drawRectangle,
    drawCircle
  } = useDrawing(
    spriteSize,
    settings,
    currentLayers,
    updateActiveFrameLayers,
    activeLayer
  )

  // Canvas rendering
  useCanvas(
    canvasRef,
    spriteSize,
    currentLayers,
    zoom,
    pan,
    lineStart,
    linePreview,
    rectStart,
    rectPreview,
    circleStart,
    circlePreview,
    toolOptions,
    settings,
    viewHelper,
    showOnionSkin,
    // For onion skin, show flippedRaw when editing flippedFixed
    activeVariant === SPRITE_VARIANTS.FLIPPED_FIXED && flippedRawFrames.length > 0
      ? flippedRawFrames[flippedRawActiveFrame]?.layers
      : null,
    null
  )

  // Generate raw flip
  const handleGenerateRawFlip = useCallback(() => {
    if (!originalState) return
    
    const flipped = flipSpriteHorizontally(originalState)
    setSpriteState(prevState => updateVariant(prevState, SPRITE_VARIANTS.FLIPPED_RAW, flipped))
  }, [originalState, setSpriteState])

  // Copy raw to fixed
  const handleCopyRawToFixed = useCallback(() => {
    if (!flippedRawState) return
    
    const cloned = cloneSprite(flippedRawState)
    setSpriteState(prevState => updateVariant(prevState, SPRITE_VARIANTS.FLIPPED_FIXED, cloned))
    setActiveVariant(SPRITE_VARIANTS.FLIPPED_FIXED)
  }, [flippedRawState, setSpriteState, setActiveVariant])

  // Run AI Flip-Fix
  const handleRunAIFlipFix = useCallback(async () => {
    if (!flippedRawState) return
    
    setIsGenerating(true)
    try {
      const inputGrid = spriteToGrid(flippedRawState)
      const outputGrid = await runFlipFixModel(inputGrid)
      const fixedSprite = gridToSprite(outputGrid, flippedRawState)
      setSpriteState(prevState => updateVariant(prevState, SPRITE_VARIANTS.FLIPPED_FIXED, fixedSprite))
      setActiveVariant(SPRITE_VARIANTS.FLIPPED_FIXED)
    } catch (error) {
      console.error('Error running AI Flip-Fix:', error)
      alert('AI Flip-Fix is not yet implemented. Please edit manually.')
    } finally {
      setIsGenerating(false)
    }
  }, [flippedRawState, setSpriteState, setActiveVariant])

  // Save training pair
  const handleSaveTrainingPair = useCallback(() => {
    if (!flippedRawState || !flippedFixedState) {
      alert('Please generate both flippedRaw and flippedFixed variants first.')
      return
    }

    const inputGrid = spriteToGrid(flippedRawState)
    const targetGrid = spriteToGrid(flippedFixedState)

    // Create training pair object
    const trainingPair = {
      id: `pair-${Date.now()}`,
      width: spriteSize.width,
      height: spriteSize.height,
      numClasses: 256, // Placeholder - would be actual palette size
      palette: [], // Placeholder - would be actual palette
      input: inputGrid,
      target: targetGrid
    }

    // In Electron, we can write to disk
    if (window.electron) {
      // TODO: Use Electron's fs module to write to training-data folder
      console.log('Training pair (would save to disk in Electron):', trainingPair)
      alert('Training pair export will be implemented with Electron file system access.')
    } else {
      // In web mode, download as JSON
      const blob = new Blob([JSON.stringify(trainingPair, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `training-pair-${trainingPair.id}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [flippedRawState, flippedFixedState, spriteSize])

  // Mouse handlers (only allow interaction when editing flippedFixed)
  const handleMouseDown = (e) => {
    if (!isEditable) return
    const coords = getPixelCoordinates(e, pan, zoom)
    if (coords.x < 0 || coords.x >= spriteSize.width || coords.y < 0 || coords.y >= spriteSize.height) return
    const color = e.button === 2 ? rightColor : leftColor
    paintPixel(coords.x, coords.y, color)
  }

  const handleMouseMove = (e) => {
    if (!isEditable || !e.buttons) return
    const coords = getPixelCoordinates(e, pan, zoom)
    if (coords.x < 0 || coords.x >= spriteSize.width || coords.y < 0 || coords.y >= spriteSize.height) return
    const color = e.buttons === 2 ? rightColor : leftColor
    paintPixel(coords.x, coords.y, color)
  }

  const handleMouseUp = (e) => {
    // No-op for now, can add more tool support later
  }
  
  const handleMouseLeave = () => {
    // No-op
  }
  
  const handleWheel = (e) => {
    // No-op for now, can add zoom support later
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 border-b border-neutral-700">
        <h2 className="text-xl font-bold mb-4">Flip-Fix Lab</h2>
        
        {/* Variant selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveVariant(SPRITE_VARIANTS.ORIGINAL)}
            className={`px-4 py-2 rounded ${activeVariant === SPRITE_VARIANTS.ORIGINAL ? 'bg-indigo-600' : 'bg-neutral-700'}`}
          >
            Original
          </button>
          <button
            onClick={() => setActiveVariant(SPRITE_VARIANTS.FLIPPED_RAW)}
            className={`px-4 py-2 rounded ${activeVariant === SPRITE_VARIANTS.FLIPPED_RAW ? 'bg-indigo-600' : 'bg-neutral-700'}`}
            disabled={!flippedRawState}
          >
            Flipped (Raw)
          </button>
          <button
            onClick={() => setActiveVariant(SPRITE_VARIANTS.FLIPPED_FIXED)}
            className={`px-4 py-2 rounded ${activeVariant === SPRITE_VARIANTS.FLIPPED_FIXED ? 'bg-indigo-600' : 'bg-neutral-700'}`}
            disabled={!flippedFixedState}
          >
            Flipped (Fixed) {isEditable && '(Editable)'}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleGenerateRawFlip}
            disabled={!originalState || !!flippedRawState}
            className="px-4 py-2 bg-cyan-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Raw Flip
          </button>
          <button
            onClick={handleCopyRawToFixed}
            disabled={!flippedRawState}
            className="px-4 py-2 bg-purple-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Copy Raw → Fixed
          </button>
          <button
            onClick={handleRunAIFlipFix}
            disabled={!flippedRawState || isGenerating}
            className="px-4 py-2 bg-green-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Run AI Flip-Fix'}
          </button>
          <button
            onClick={handleSaveTrainingPair}
            disabled={!flippedRawState || !flippedFixedState}
            className="px-4 py-2 bg-yellow-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Training Pair
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-neutral-700 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={showOnionSkin}
              onChange={(e) => setShowOnionSkin(e.target.checked)}
            />
            <span>Onion Skin</span>
          </label>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 p-4 min-h-0">
        <Canvas
          canvasRef={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          settings={settings}
          viewHelper={viewHelper}
        />
        {!isEditable && (
          <div className="mt-2 text-sm text-neutral-400 text-center">
            This variant is read-only. Switch to "Flipped (Fixed)" to edit.
          </div>
        )}
      </div>
    </div>
  )
}

