import { useState, useRef, useEffect, useCallback } from 'react'
import Toolbar from './components/Toolbar'
import ToolOptionsPanel from './components/ToolOptionsPanel'
import ZoomControls from './components/ZoomControls'
import ColorPicker from './components/ColorPicker'
import SettingsModal from './components/SettingsModal'
import Header from './components/Header'
import TitleBar from './components/TitleBar'
import MenuBar from './components/MenuBar'
import LoadingScreen from './components/LoadingScreen'
import { FaCog } from 'react-icons/fa'
import { TOOLS, DEFAULT_SETTINGS, DEFAULT_TOOL_OPTIONS, DEFAULT_VIEW_HELPER_OPTIONS, DEFAULT_COLORS, VIEW_HELPERS, PIXEL_SIZE } from './constants'
import { useDrawing } from './hooks/useDrawing'
import { useCanvas, guideHandlesRef } from './hooks/useCanvas'
import Canvas from './components/Canvas'
import { useToolShortcuts } from './hooks/useToolShortcuts'
import { useHistory } from './hooks/useHistory'
import { useZoom } from './hooks/useZoom'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import LayersPanel from './components/LayersPanel'
import Timeline from './components/Timeline'
import Preview from './components/Preview'
import { importPngToFrame } from './utils/importPng'
import ImportModal from './components/ImportModal'
import ExportModal from './components/ExportModal'
import FlipFixLab from './components/FlipFixLab'
import { SPRITE_VARIANTS } from './types/sprite'
import { initializeSpriteState, framesToSpriteGridLayers, getFramesFromSpriteGridLayers, updateVariant } from './utils/spriteState'
import { createEmptyFrame, duplicateFrame, calculateNewActiveFrameAfterDelete, reorderFrames } from './utils/frameUtils'
import { createEmptyLayer, duplicateLayer, calculateNewActiveLayerAfterDelete, moveLayer, mergeLayers } from './utils/layerUtils'
import { exportSprites } from './utils/exportUtils'

// Keyboard shortcuts mapping
const KEYBOARD_SHORTCUTS = {
  'p': TOOLS.PENCIL,
  'e': TOOLS.ERASER,
  'g': TOOLS.FILL,
  'i': TOOLS.EYEDROPPER,
  'l': TOOLS.LINE,
  'r': TOOLS.RECTANGLE,
  'c': TOOLS.CIRCLE,
  'h': TOOLS.PAN,
  'm': TOOLS.MOVE_LAYER_CONTENT,
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTile, setSelectedTile] = useState(null)
  const [spriteSize, setSpriteSize] = useState({ width: DEFAULT_SETTINGS.gridWidth, height: DEFAULT_SETTINGS.gridHeight })
  const [currentTool, setCurrentTool] = useState(TOOLS.PENCIL)
  const [leftColor, setLeftColor] = useState(DEFAULT_COLORS[0])
  const [rightColor, setRightColor] = useState(DEFAULT_COLORS[1])
  const [toolOptions, setToolOptions] = useState(DEFAULT_TOOL_OPTIONS)
  const [viewHelperOptions, setViewHelperOptions] = useState(() => ({
    ...DEFAULT_VIEW_HELPER_OPTIONS,
    sideViewGuides: { ...DEFAULT_VIEW_HELPER_OPTIONS.sideViewGuides }
  }))
  const [isImporting, setIsImporting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportScale, setExportScale] = useState(1)
  const [showOnionSkin, setShowOnionSkin] = useState(false)
  const [viewHelper, setViewHelper] = useState(VIEW_HELPERS.NONE)

  // Sprite state with variants
  const initialFrames = [
    {
      id: 1,
      name: 'Frame 1',
      layers: [
        {
          id: 1,
          name: 'Layer 1',
          visible: true,
          opacity: 1,
          groupId: null,
          pixels: Array(DEFAULT_SETTINGS.gridHeight).fill(null).map(() => Array(DEFAULT_SETTINGS.gridWidth).fill(null))
        }
      ],
      layerIdCounter: 1,
      nextGroupId: 1,
      activeLayer: 0
    }
  ]
  const [spriteState, setSpriteState] = useState(() => 
    initializeSpriteState(initialFrames, 0, DEFAULT_SETTINGS.gridWidth, DEFAULT_SETTINGS.gridHeight)
  )
  const [activeVariant, setActiveVariant] = useState(SPRITE_VARIANTS.ORIGINAL)
  
  // Mode: 'standard' or 'flipFix'
  const [editMode, setEditMode] = useState('standard')

  // Helper: get current variant's state
  const currentVariantState = spriteState[activeVariant]
  if (!currentVariantState) {
    // This shouldn't happen, but handle gracefully
    console.error(`Variant ${activeVariant} is null`)
  }
  
  // Get frames from current variant (or fallback to original)
  const frames = currentVariantState 
    ? getFramesFromSpriteGridLayers(currentVariantState)
    : getFramesFromSpriteGridLayers(spriteState.original)
  
  // Helper: get activeFrame from current variant
  const activeFrame = currentVariantState?.activeFrame ?? 0
  
  // Helper: set activeFrame for current variant
  const setActiveFrame = useCallback((frameIndex) => {
    setSpriteState(prevState => {
      const currentVariantState = prevState[activeVariant]
      if (!currentVariantState) return prevState
      
      const updatedVariantState = {
        ...currentVariantState,
        activeFrame: frameIndex
      }
      
      return updateVariant(prevState, activeVariant, updatedVariantState)
    })
  }, [activeVariant])
  
  // Helper: get current frame (with safety check)
  const currentFrame = frames[activeFrame] || frames[0] || null
  if (!currentFrame) {
    // Fallback if no frames exist
    return <div className="w-screen h-screen bg-neutral-900 text-white flex items-center justify-center">
      <div>No frames available</div>
    </div>
  }
  const layers = currentFrame.layers
  const activeLayer = currentFrame.activeLayer
  const nextGroupId = currentFrame.nextGroupId
  const layerIdCounter = currentFrame.layerIdCounter

  // Update frames for the active variant
  const handleFramesChange = useCallback((updater, newActiveFrame = null) => {
    setSpriteState(prevState => {
      const currentVariantState = prevState[activeVariant]
      if (!currentVariantState) return prevState
      
      const currentFrames = getFramesFromSpriteGridLayers(currentVariantState)
      const nextFrames = typeof updater === 'function' ? updater(currentFrames) : updater
      
      // Ensure activeFrame is valid
      let updatedActiveFrame = newActiveFrame !== null 
        ? newActiveFrame 
        : currentVariantState.activeFrame
      
      // Clamp activeFrame to valid range
      if (updatedActiveFrame >= nextFrames.length) {
        updatedActiveFrame = Math.max(0, nextFrames.length - 1)
      }
      
      const updatedVariantState = {
        ...currentVariantState,
        frames: nextFrames,
        activeFrame: updatedActiveFrame
      }
      
      return updateVariant(prevState, activeVariant, updatedVariantState)
    })
  }, [activeVariant])

  const updateActiveFrame = useCallback((updater) => {
    handleFramesChange(prevFrames => prevFrames.map((frame, index) => {
      if (index !== activeFrame) return frame
      const updatedFrame = updater(frame)
      return updatedFrame === undefined ? frame : updatedFrame
    }))
  }, [activeFrame, handleFramesChange])

  const updateActiveFrameLayers = useCallback((updater) => {
    updateActiveFrame(frame => {
      const nextLayers = typeof updater === 'function' ? updater(frame.layers) : updater
      if (nextLayers === frame.layers) return frame
      return { ...frame, layers: nextLayers }
    })
  }, [updateActiveFrame])

  const updateLayerAt = useCallback((index, updater) => {
    updateActiveFrame(frame => {
      const nextLayers = frame.layers.map((layer, layerIdx) => {
        if (layerIdx !== index) return layer
        const updatedLayer = updater(layer, frame)
        return updatedLayer === undefined ? layer : updatedLayer
      })
      return { ...frame, layers: nextLayers }
    })
  }, [updateActiveFrame])

  // Zoom and pan hook (must be called before useDrawing to get canvasRef)
  const {
    zoom,
    pan,
    setPan,
    isPanning,
    canvasRef: zoomCanvasRef,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleZoomToFit,
    handleZoomTo100,
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd
  } = useZoom(spriteSize, settings.zoomSpeed)

  // Drawing hook
  const {
    isDrawing,
    setIsDrawing,
    lineStart,
    setLineStart,
    linePreview,
    setLinePreview,
    rectStart,
    setRectStart,
    rectPreview,
    setRectPreview,
    circleStart,
    setCircleStart,
    circlePreview,
    setCirclePreview,
    canvasRef: drawingCanvasRef,
    paintPixel,
    floodFill,
    drawLine,
    drawRectangle,
    drawCircle,
    getPixelCoordinates,
    lastPencilPixel,
    drawPencilLine
  } = useDrawing(
    spriteSize,
    settings,
    frames[activeFrame].layers,
    updateActiveFrameLayers,
    activeLayer
  )
  
  // Use zoom canvas ref (share the same ref)
  const canvasRef = zoomCanvasRef
  // Sync the drawing canvas ref to the zoom canvas ref
  useEffect(() => {
    if (drawingCanvasRef && zoomCanvasRef) {
      drawingCanvasRef.current = zoomCanvasRef.current
    }
  }, [drawingCanvasRef, zoomCanvasRef])

  // Update sprite size when grid size changes
  useEffect(() => {
    setSpriteSize({ width: settings.gridWidth, height: settings.gridHeight })
    // Also update spriteState dimensions
    setSpriteState(prevState => {
      const updated = { ...prevState }
      if (prevState.original) {
        updated.original = {
          ...prevState.original,
          width: settings.gridWidth,
          height: settings.gridHeight
        }
      }
      if (prevState.flippedRaw) {
        updated.flippedRaw = {
          ...prevState.flippedRaw,
          width: settings.gridWidth,
          height: settings.gridHeight
        }
      }
      if (prevState.flippedFixed) {
        updated.flippedFixed = {
          ...prevState.flippedFixed,
          width: settings.gridWidth,
          height: settings.gridHeight
        }
      }
      return updated
    })
  }, [settings.gridWidth, settings.gridHeight])

  // Track drag state for move tool
  const [moveStart, setMoveStart] = useState(null)
  const [moveStartPixelCoords, setMoveStartPixelCoords] = useState(null)
  const [movePreview, setMovePreview] = useState(null)
  
  // Track drag state for guide handles
  const [draggingGuide, setDraggingGuide] = useState(null)
  const [guideDragStartY, setGuideDragStartY] = useState(null)
  
  // History hook
  const {
    saveToHistory,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo
  } = useHistory(frames, handleFramesChange)

  const handleViewHelperToggle = useCallback((helper) => {
    setViewHelper(prev => prev === helper ? VIEW_HELPERS.NONE : helper)
  }, [])

  // For useCanvas, pass showOnionSkin and previous frame's layers (if any)
  const previousLayers = activeFrame > 0 ? frames[activeFrame - 1].layers : null
  const activeLayerPreview = movePreview && (movePreview.dx !== 0 || movePreview.dy !== 0)
    ? { layerIndex: activeLayer, dx: movePreview.dx, dy: movePreview.dy }
    : null

  useCanvas(
    canvasRef,
    spriteSize,
    layers,
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
    previousLayers,
    activeLayerPreview,
    viewHelperOptions
  )

  // Use the custom hook for keyboard shortcuts
  useToolShortcuts(setCurrentTool, KEYBOARD_SHORTCUTS)

  // Move Layer Content: shift all pixels by dx, dy
  const shiftLayerPixels = useCallback((pixels, dx, dy) => {
    const height = pixels.length
    const width = pixels[0].length
    const newPixels = Array(height).fill(null).map(() => Array(width).fill(null))
    
    // Copy pixels to their new positions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sourceX = x - dx
        const sourceY = y - dy
        if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
          newPixels[y][x] = pixels[sourceY][sourceX]
        }
      }
    }

    return newPixels
  }, [])

  const handleMouseDown = (e) => {
    // Check if clicking on a guide handle (only when side view helper is active)
    if (viewHelper === VIEW_HELPERS.SIDE && viewHelperOptions?.showHeightGuides !== false && canvasRef?.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // Calculate current scale and offset to match what's in useCanvas
      const displayWidth = canvas.clientWidth
      const displayHeight = canvas.clientHeight
      const scaleX = displayWidth / (spriteSize.width * PIXEL_SIZE)
      const scaleY = displayHeight / (spriteSize.height * PIXEL_SIZE)
      const currentScale = Math.min(scaleX, scaleY) * zoom
      const currentOffsetX = (displayWidth - spriteSize.width * PIXEL_SIZE * currentScale) / 2 + pan.x
      const currentOffsetY = (displayHeight - spriteSize.height * PIXEL_SIZE * currentScale) / 2 + pan.y
      
      // Check if mouse is over any guide handle
      // Only check handles that are to the right of the sprite (outside the drawing area)
      if (guideHandlesRef.current && guideHandlesRef.current.length > 0) {
        for (const handle of guideHandlesRef.current) {
          if (!handle.handleX || handle.handleX === undefined) continue
          
          // Recalculate screen position with current transform
          // handleX and handleY are in sprite coordinates (pixels), need to convert to screen
          const screenX = handle.handleX * currentScale + currentOffsetX
          const screenY = handle.handleY * currentScale + currentOffsetY
          const screenSize = (handle.handleSize || 12) * currentScale
          
          const dx = mouseX - screenX
          const dy = mouseY - screenY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const threshold = Math.max(screenSize / 2, 12) // Minimum threshold of 12 pixels for easier clicking
          
          // Only consider it a handle click if we're actually clicking to the right of the sprite
          // This prevents blocking drawing when clicking inside the sprite area
          const spriteRightEdge = (spriteSize.width * PIXEL_SIZE) * currentScale + currentOffsetX
          if (mouseX > spriteRightEdge && distance <= threshold) {
            // Start dragging this guide
            setDraggingGuide(handle.key)
            setGuideDragStartY(mouseY)
            e.preventDefault()
            e.stopPropagation()
            return
          }
        }
      }
    }
    
    if (currentTool === TOOLS.PAN) {
      handlePanStart(e)
      return
    }
    if (currentTool === TOOLS.MOVE_LAYER_CONTENT) {
      const pixelCoords = getPixelCoordinates(e, pan, zoom, canvasRef)
      setMoveStart({ x: e.clientX, y: e.clientY })
      setMoveStartPixelCoords(pixelCoords)
      setMovePreview({ dx: 0, dy: 0 })
      // Save state before moving
      saveToHistory(frames)
      return
    }

    const { x, y } = getPixelCoordinates(e, pan, zoom, canvasRef)
    const color = e.button === 2 ? rightColor : leftColor

    switch (currentTool) {
      case TOOLS.PENCIL:
        setIsDrawing(true)
        paintPixel(x, y, color)
        break
      case TOOLS.ERASER:
        setIsDrawing(true)
        paintPixel(x, y, null)
        break
      case TOOLS.FILL:
        const targetColor = layers[activeLayer].pixels[y][x]
        floodFill(x, y, targetColor, color)
        break
      case TOOLS.EYEDROPPER:
        const sampledColor = layers[activeLayer].pixels[y][x]
        if (sampledColor) {
          if (e.button === 2) {
            setRightColor(sampledColor)
          } else {
            setLeftColor(sampledColor)
          }
        }
        break
      case TOOLS.LINE:
        setLineStart({ x, y, color })
        setLinePreview({ x, y, color })
        break
      case TOOLS.RECTANGLE:
        if (toolOptions.drawFromCenter) {
          setRectStart({ x, y, color })
          setRectPreview({ x: x * 2 - x, y: y * 2 - y, color })
        } else {
          setRectStart({ x, y, color })
          setRectPreview({ x, y, color })
        }
        break
      case TOOLS.CIRCLE:
        if (toolOptions.drawFromCenter) {
          setCircleStart({ x, y, color })
          setCirclePreview({ x: x * 2 - x, y: y * 2 - y, color })
        } else {
          setCircleStart({ x, y, color })
          setCirclePreview({ x, y, color })
        }
        break
      default:
        break
    }
  }

  const handleMouseMove = (e) => {
    // Handle guide dragging
    if (draggingGuide !== null) {
      const canvas = canvasRef?.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const mouseY = e.clientY - rect.top
        
        // Calculate scale and offset (same as in useCanvas)
        const displayWidth = canvas.clientWidth
        const displayHeight = canvas.clientHeight
        const scaleX = displayWidth / (spriteSize.width * PIXEL_SIZE)
        const scaleY = displayHeight / (spriteSize.height * PIXEL_SIZE)
        const scale = Math.min(scaleX, scaleY) * zoom
        const offsetY = (displayHeight - spriteSize.height * PIXEL_SIZE * scale) / 2 + pan.y
        
        // Convert mouse Y to sprite Y coordinate
        const spriteY = (mouseY - offsetY) / scale
        const pixelRow = Math.max(0, Math.min(spriteSize.height - 1, Math.floor(spriteY / PIXEL_SIZE)))
        const newPosition = pixelRow / spriteSize.height
        const clampedPosition = pixelRow === spriteSize.height - 1 ? 1.0 : newPosition
        
        // Update guide position
        const newGuides = {
          ...viewHelperOptions.sideViewGuides,
          [draggingGuide]: clampedPosition
        }
        setViewHelperOptions({
          ...viewHelperOptions,
          sideViewGuides: newGuides
        })
      }
      return
    }
    
    // Check if hovering over a guide handle (for cursor change)
    if (viewHelper === VIEW_HELPERS.SIDE && viewHelperOptions?.showHeightGuides !== false && canvasRef?.current && !draggingGuide) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // Calculate current scale and offset to match what's in useCanvas
      const displayWidth = canvas.clientWidth
      const displayHeight = canvas.clientHeight
      const scaleX = displayWidth / (spriteSize.width * PIXEL_SIZE)
      const scaleY = displayHeight / (spriteSize.height * PIXEL_SIZE)
      const currentScale = Math.min(scaleX, scaleY) * zoom
      const currentOffsetX = (displayWidth - spriteSize.width * PIXEL_SIZE * currentScale) / 2 + pan.x
      const currentOffsetY = (displayHeight - spriteSize.height * PIXEL_SIZE * currentScale) / 2 + pan.y
      
      let hoveringHandle = false
      if (guideHandlesRef.current && guideHandlesRef.current.length > 0) {
        for (const handle of guideHandlesRef.current) {
          // Recalculate screen position with current transform
          const screenX = handle.handleX * currentScale + currentOffsetX
          const screenY = handle.handleY * currentScale + currentOffsetY
          const screenSize = (handle.handleSize || 12) * currentScale
          
          const dx = mouseX - screenX
          const dy = mouseY - screenY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const threshold = Math.max(screenSize / 2, 8) // Minimum threshold of 8 pixels
          
          if (distance <= threshold) {
            hoveringHandle = true
            break
          }
        }
      }
      
      if (hoveringHandle) {
        canvas.style.cursor = 'ns-resize'
      } else if (currentTool !== TOOLS.PAN) {
        canvas.style.cursor = 'default'
      }
    }
    
    if (currentTool === TOOLS.PAN && isPanning) {
      handlePanMove(e)
      return
    }
    if (currentTool === TOOLS.MOVE_LAYER_CONTENT && moveStart && moveStartPixelCoords) {
      const currentPixelCoords = getPixelCoordinates(e, pan, zoom, canvasRef)
      const dx = currentPixelCoords.x - moveStartPixelCoords.x
      const dy = currentPixelCoords.y - moveStartPixelCoords.y
      if (!movePreview || movePreview.dx !== dx || movePreview.dy !== dy) {
        setMovePreview({ dx, dy })
      }
      return
    }

    const { x, y } = getPixelCoordinates(e, pan, zoom, canvasRef)
    const color = e.buttons === 2 ? rightColor : leftColor

    switch (currentTool) {
      case TOOLS.PENCIL:
        if (!isDrawing) return
        paintPixel(x, y, color)
        break
      case TOOLS.ERASER:
        if (!isDrawing) return
        paintPixel(x, y, null)
        break
      case TOOLS.LINE:
        if (lineStart) {
          setLinePreview({ x, y, color: lineStart.color })
        }
        break
      case TOOLS.RECTANGLE:
        if (rectStart) {
          if (toolOptions.drawFromCenter) {
            const dx = x - rectStart.x
            const dy = y - rectStart.y
            setRectPreview({
              x: rectStart.x + dx * 2,
              y: rectStart.y + dy * 2,
              color: rectStart.color
            })
          } else {
            setRectPreview({ x, y, color: rectStart.color })
          }
        }
        break
      case TOOLS.CIRCLE:
        if (circleStart) {
          if (toolOptions.drawFromCenter) {
            const dx = x - circleStart.x
            const dy = y - circleStart.y
            setCirclePreview({
              x: circleStart.x + dx * 2,
              y: circleStart.y + dy * 2,
              color: circleStart.color
            })
          } else {
            setCirclePreview({ x, y, color: circleStart.color })
          }
        }
        break
      default:
        break
    }
  }

  const handleMouseUp = (e) => {
    // Stop dragging guide
    if (draggingGuide !== null) {
      setDraggingGuide(null)
      setGuideDragStartY(null)
      return
    }
    
    if (currentTool === TOOLS.LINE && lineStart && linePreview) {
      drawLine(lineStart, linePreview, lineStart.color, toolOptions)
    }
    if (currentTool === TOOLS.RECTANGLE && rectStart && rectPreview) {
      drawRectangle(rectStart, rectPreview, rectStart.color, toolOptions)
    }
    if (currentTool === TOOLS.CIRCLE && circleStart && circlePreview) {
      drawCircle(circleStart, circlePreview, circleStart.color, toolOptions)
    }
    if (currentTool === TOOLS.MOVE_LAYER_CONTENT && moveStart && moveStartPixelCoords) {
      const currentPixelCoords = getPixelCoordinates(e, pan, zoom, canvasRef)
      const dx = currentPixelCoords.x - moveStartPixelCoords.x
      const dy = currentPixelCoords.y - moveStartPixelCoords.y
      if (dx !== 0 || dy !== 0) {
        updateLayerAt(activeLayer, layer => ({
          ...layer,
          pixels: shiftLayerPixels(layer.pixels, dx, dy)
        }))
        // Save state after moving
        setTimeout(() => {
          handleFramesChange(prev => {
            saveToHistory(prev)
            return prev
          })
        }, 0)
      }
      setMoveStart(null)
      setMoveStartPixelCoords(null)
      setMovePreview(null)
      return
    }
    setLineStart(null)
    setLinePreview(null)
    setRectStart(null)
    setRectPreview(null)
    setCircleStart(null)
    setCirclePreview(null)
    setIsDrawing(false)
    handlePanEnd()
  }

  const handleMouseLeave = () => {
    setIsDrawing(false)
    handlePanEnd()
    setMoveStart(null)
    setMoveStartPixelCoords(null)
    setMovePreview(null)
    setDraggingGuide(null)
    setGuideDragStartY(null)
  }

  const handleColorSelect = (color, button) => {
    if (button === 'left') {
      setLeftColor(color)
    } else {
      setRightColor(color)
    }
  }

  const handleFileImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsImporting(true)
    try {
      const { frame, width, height } = await importPngToFrame(file)
      setSpriteSize({ width, height })
      handleFramesChange(prev => {
        const next = [...prev, frame]
        setActiveFrame(next.length - 1)
        return next
      })
      setIsImporting(false)
    } catch (error) {
      console.error('Error importing image:', error)
      alert('Error importing image. Please make sure it\'s a valid image file.')
      setIsImporting(false)
    }
  }

  // Handler: Add Layer
  const handleAddLayer = () => {
    updateActiveFrame(frame => {
      const nextId = frame.layerIdCounter + 1
      const newLayer = createEmptyLayer(nextId, `Layer ${frame.layers.length + 1}`, settings.gridWidth, settings.gridHeight)
      return {
        ...frame,
        layers: [...frame.layers, newLayer],
        layerIdCounter: nextId,
        activeLayer: frame.layers.length
      }
    })
  }

  // Handler: Delete Layer
  const handleDeleteLayer = (idx) => {
    updateActiveFrame(frame => {
      if (frame.layers.length === 1) return frame
      const newLayers = frame.layers.filter((_, i) => i !== idx)
      const newActive = calculateNewActiveLayerAfterDelete(idx, frame.activeLayer, frame.layers.length)
      return {
        ...frame,
        layers: newLayers,
        activeLayer: newActive
      }
    })
  }

  // Handler: Select Layer
  const handleSelectLayer = (idx) => {
    updateActiveFrame(frame => ({ ...frame, activeLayer: idx }))
  }

  // Handler: Toggle Visibility
  const handleToggleVisibility = (idx) => {
    updateLayerAt(idx, layer => ({ ...layer, visible: !layer.visible }))
  }

  // Handler: Move Layer (now accepts fromIdx, toIdx)
  const handleMoveLayer = (fromIdx, toIdxOrDirection) => {
    updateActiveFrame(frame => {
      const result = moveLayer(frame.layers, fromIdx, toIdxOrDirection, frame.activeLayer)
      if (!result) return frame
      return { ...frame, layers: result.newLayers, activeLayer: result.newActiveIndex }
    })
  }

  // Handler: Duplicate Layer
  const handleDuplicateLayer = (idx) => {
    updateActiveFrame(frame => {
      const nextId = frame.layerIdCounter + 1
      const newLayer = duplicateLayer(frame.layers[idx], nextId)
      return {
        ...frame,
        layers: [...frame.layers, newLayer],
        layerIdCounter: nextId,
        activeLayer: frame.layers.length
      }
    })
  }

  // Handler: Rename Layer
  const handleRenameLayer = (idx, newName) => {
    updateLayerAt(idx, layer => ({ ...layer, name: newName }))
  }

  // Handler: Set Layer Opacity
  const handleSetLayerOpacity = (idx, opacity) => {
    updateLayerAt(idx, layer => ({ ...layer, opacity }))
  }

  // Handler: Create Group
  const handleCreateGroup = () => {
    updateActiveFrame(frame => {
      const groupId = frame.nextGroupId
      return {
        ...frame,
        nextGroupId: groupId + 1,
        layers: frame.layers.map((layer, i) => i === frame.activeLayer ? { ...layer, groupId } : layer)
      }
    })
  }

  // Handler: Add to Group
  const handleAddToGroup = (idx, groupId) => {
    updateLayerAt(idx, layer => ({ ...layer, groupId }))
  }

  // Handler: Remove from Group
  const handleRemoveFromGroup = (idx) => {
    updateLayerAt(idx, layer => ({ ...layer, groupId: null }))
  }

  // Handler: Merge Layers
  const handleMergeLayers = (indices) => {
    updateActiveFrame(frame => {
      const result = mergeLayers(
        frame.layers,
        indices,
        settings.gridWidth,
        settings.gridHeight,
        frame.layerIdCounter + 1
      )
      if (!result) return frame
      return {
        ...frame,
        layers: [...result.remainingLayers, result.mergedLayer],
        layerIdCounter: frame.layerIdCounter + 1,
        activeLayer: result.remainingLayers.length
      }
    })
  }

  // Arrow key movement for move tool
  useEffect(() => {
    if (currentTool !== TOOLS.MOVE_LAYER_CONTENT) return
    const handleArrow = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      let dx = 0, dy = 0
      if (e.key === 'ArrowLeft') dx = -1
      if (e.key === 'ArrowRight') dx = 1
      if (e.key === 'ArrowUp') dy = -1
      if (e.key === 'ArrowDown') dy = 1
      if (dx !== 0 || dy !== 0) {
        e.preventDefault()
        saveToHistory(frames)
        updateLayerAt(activeLayer, layer => ({
          ...layer,
          pixels: shiftLayerPixels(layer.pixels, dx, dy)
        }))
        setTimeout(() => {
          handleFramesChange(prev => {
            saveToHistory(prev)
            return prev
          })
        }, 0)
      }
    }
    window.addEventListener('keydown', handleArrow)
    return () => window.removeEventListener('keydown', handleArrow)
  }, [currentTool, activeLayer, shiftLayerPixels, updateLayerAt, frames, saveToHistory, handleFramesChange])
  
  // Keyboard shortcuts for undo/redo and zoom
  useKeyboardShortcuts({
    handleUndo,
    handleRedo,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleZoomToFit,
    handleZoomTo100
  })

  // Export logic
  const handleExport = () => {
    setShowExportModal(true)
  }

  const doExport = ({ mode, scale, framesPerRow, exportAllFrames }) => {
    exportSprites({
      mode,
      scale,
      framesPerRow,
      exportAllFrames,
      frames,
      activeFrame,
      width: spriteSize.width,
      height: spriteSize.height
    })
    setShowExportModal(false)
  }

  // Frame handlers
  const handleAddFrame = () => {
    handleFramesChange(prev => {
      const newFrame = createEmptyFrame(prev.length + 1, `Frame ${prev.length + 1}`, settings.gridWidth, settings.gridHeight)
      const next = [...prev, newFrame]
      setActiveFrame(next.length - 1)
      return next
    })
  }
  const handleDeleteFrame = (idx) => {
    if (frames.length === 1) return
    
    // Calculate new active frame index before deletion
    const newActive = Math.max(0, Math.min(
      calculateNewActiveFrameAfterDelete(idx, activeFrame, frames.length),
      frames.length - 2
    ))
    
    // Delete the frame and update activeFrame in one operation
    handleFramesChange(prev => {
      return prev.filter((_, i) => i !== idx)
    }, newActive)
  }
  const handleDuplicateFrame = (idx) => {
    handleFramesChange(prev => {
      const duplicated = duplicateFrame(prev[idx], prev.length + 1)
      const next = [...prev, duplicated]
      setActiveFrame(next.length - 1)
      return next
    })
  }
  const handleSelectFrame = (idx) => setActiveFrame(idx)
  const handleToggleOnionSkin = () => setShowOnionSkin(v => !v)
  
  // Handler: Reorder frames
  const handleReorderFrames = useCallback((fromIndex, toIndex) => {
    handleFramesChange(prev => {
      const { newFrames, newActiveIndex } = reorderFrames(prev, fromIndex, toIndex, activeFrame)
      setActiveFrame(newActiveIndex)
      return newFrames
    })
  }, [activeFrame, handleFramesChange])
  // Render a simple thumbnail (just a colored box for now)
  const renderFrameThumbnail = (frame) => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-700 rounded">
      <span className="text-xs text-cyan-200">{frame.name}</span>
    </div>
  )

  // Handler for ImportModal (single image)
  const handleImportFrame = ({ frame, width, height }) => {
    setSpriteSize({ width, height })
    handleFramesChange(() => [
      {
        ...frame,
        id: 1,
        name: 'Frame 1',
        layers: frame.layers,
        layerIdCounter: frame.layerIdCounter || 1,
        nextGroupId: frame.nextGroupId || 1,
        activeLayer: 0
      }
    ])
    setActiveFrame(0)
  }

  // Handler for ImportModal (sprite sheet)
  const handleImportFrames = ({ frames, width, height }) => {
    setSpriteSize({ width, height })
    handleFramesChange(() => frames.map((frame, i) => ({
      ...frame,
      id: i + 1,
      name: `Frame ${i + 1}`,
      activeLayer: 0
    })))
    setActiveFrame(0)
  }

  const handleToolOptionsChange = (newOptions) => {
    setToolOptions(newOptions)
  }

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  // Show loading screen while app is initializing
  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return (
    <div className="w-screen h-screen bg-neutral-900 text-white overflow-hidden flex flex-col">
      <TitleBar />
      <MenuBar
        onImport={() => setIsImporting(true)}
        onExport={() => setShowExportModal(true)}
        onSettings={() => setShowSettings(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        editMode={editMode}
        onEditModeChange={setEditMode}
      />
      <div className="flex-shrink-0">
        <Header
          onImport={() => setIsImporting(true)}
          onExport={() => setShowExportModal(true)}
          onSettings={() => setShowSettings(true)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          editMode={editMode}
          onEditModeChange={setEditMode}
        />
      </div>
      {/* Tool Options Section - Only show in standard mode */}
      {editMode === 'standard' && (
        <div className="flex-shrink-0 border-b border-neutral-700 bg-neutral-800">
          <ToolOptionsPanel
            currentTool={currentTool}
            toolOptions={toolOptions}
            onToolOptionsChange={handleToolOptionsChange}
            viewHelper={viewHelper}
            viewHelperOptions={viewHelperOptions}
            onViewHelperOptionsChange={setViewHelperOptions}
          />
        </div>
      )}
      
      {editMode === 'flipFix' ? (
        <div className="flex-1 min-h-0">
          <FlipFixLab
            spriteState={spriteState}
            setSpriteState={setSpriteState}
            activeVariant={activeVariant}
            setActiveVariant={setActiveVariant}
            spriteSize={spriteSize}
            settings={settings}
            zoom={zoom}
            pan={pan}
            setPan={setPan}
            leftColor={leftColor}
            rightColor={rightColor}
            onColorSelect={handleColorSelect}
            toolOptions={toolOptions}
            viewHelper={viewHelper}
          />
        </div>
      ) : (
      <div className="flex-1 min-h-0 flex">
        <div className="flex-shrink-0 flex flex-col mt-4 ml-4 mb-4 bg-neutral-800 border-t border-neutral-700 rounded-lg">
          <Toolbar
            currentTool={currentTool}
            onToolSelect={setCurrentTool}
            toolOptions={toolOptions}
            onToolOptionsChange={handleToolOptionsChange}
            viewHelper={viewHelper}
            onViewHelperChange={handleViewHelperToggle}
          />
          <div className="w-56">
            <ColorPicker
              onColorSelect={handleColorSelect}
              leftColor={leftColor}
              rightColor={rightColor}
              frames={frames}
            />
          </div>
          <ZoomControls
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onZoomToFit={handleZoomToFit}
            onZoomTo100={handleZoomTo100}
          />
        </div>
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col min-h-0">
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
          </div>
          {/* Timeline */}
          <div className="flex-shrink-0 mb-4 mr-4 ml-4 min-w-0">
            <Timeline
              frames={frames}
              activeFrame={activeFrame}
              onSelectFrame={handleSelectFrame}
              onAddFrame={handleAddFrame}
              onDeleteFrame={handleDeleteFrame}
              onDuplicateFrame={handleDuplicateFrame}
              onReorderFrames={handleReorderFrames}
              showOnionSkin={showOnionSkin}
              onToggleOnionSkin={handleToggleOnionSkin}
              spriteSize={spriteSize}
              settings={settings}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-64 mt-4 mr-4 mb-4 rounded-lg bg-neutral-800 border-l border-neutral-700 flex flex-col min-h-0 flex-shrink-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            <LayersPanel
              layers={frames[activeFrame].layers}
              activeLayer={activeLayer}
              onLayerChange={handleMoveLayer}
              onLayerAdd={handleAddLayer}
              onDeleteLayer={handleDeleteLayer}
              onDuplicateLayer={handleDuplicateLayer}
              onLayerMove={handleMoveLayer}
              onSelectLayer={handleSelectLayer}
              onToggleVisibility={handleToggleVisibility}
              onRenameLayer={handleRenameLayer}
              onSetOpacity={handleSetLayerOpacity}
              onCreateGroup={handleCreateGroup}
              onAddToGroup={handleAddToGroup}
              onRemoveFromGroup={handleRemoveFromGroup}
              onMergeLayers={handleMergeLayers}
            />
          </div>
          <div className="p-4 border-t border-neutral-700">
            <Preview
              frames={frames}
              spriteSize={spriteSize}
              settings={settings}
            />
          </div>
        </div>
      </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={doExport}
        frames={frames}
      />

      <ImportModal
        isOpen={isImporting}
        onClose={() => setIsImporting(false)}
        onImportFrame={handleImportFrame}
        onImportFrames={handleImportFrames}
      />
    </div>
  )
}

export default App
