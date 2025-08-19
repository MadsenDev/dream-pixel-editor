import { useState, useRef, useEffect } from 'react'
import Toolbar from './components/Toolbar'
import ColorPicker from './components/ColorPicker'
import SettingsModal from './components/SettingsModal'
import Header from './components/Header'
import { FaCog } from 'react-icons/fa'
import { TOOLS, DEFAULT_SETTINGS, DEFAULT_TOOL_OPTIONS, DEFAULT_COLORS } from './constants'
import { useDrawing } from './hooks/useDrawing'
import { useCanvas } from './hooks/useCanvas'
import Canvas from './components/Canvas'
import { useToolShortcuts } from './hooks/useToolShortcuts'
import LayersPanel from './components/LayersPanel'
import Timeline from './components/Timeline'
import Preview from './components/Preview'
import { importPngToFrame } from './utils/importPng'
import ImportModal from './components/ImportModal'
import ExportModal from './components/ExportModal'

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
  const [selectedTile, setSelectedTile] = useState(null)
  const [spriteSize, setSpriteSize] = useState({ width: DEFAULT_SETTINGS.gridWidth, height: DEFAULT_SETTINGS.gridHeight })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 })
  const [currentTool, setCurrentTool] = useState(TOOLS.PENCIL)
  const [leftColor, setLeftColor] = useState(DEFAULT_COLORS[0])
  const [rightColor, setRightColor] = useState(DEFAULT_COLORS[1])
  const [toolOptions, setToolOptions] = useState(DEFAULT_TOOL_OPTIONS)
  const [isImporting, setIsImporting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportScale, setExportScale] = useState(1)
  const [showOnionSkin, setShowOnionSkin] = useState(false)

  // Animation: frames state
  const [frames, setFrames] = useState([
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
  ])
  const [activeFrame, setActiveFrame] = useState(0)

  // Helper: get current frame
  const currentFrame = frames[activeFrame]
  const layers = currentFrame.layers
  const activeLayer = currentFrame.activeLayer
  const nextGroupId = currentFrame.nextGroupId
  const layerIdCounter = currentFrame.layerIdCounter

  // Add back handleFramesChange
  const handleFramesChange = (updater) => {
    const newFrames = typeof updater === 'function' ? updater(frames) : updater
    setFrames(newFrames)
  }

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
    canvasRef,
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
    (updater) => {
      const newFrames = [...frames]
      newFrames[activeFrame] = {
        ...newFrames[activeFrame],
        layers: typeof updater === 'function' ? updater(newFrames[activeFrame].layers) : updater
      }
      handleFramesChange(newFrames)
    },
    activeLayer
  )

  // Update sprite size when grid size changes
  useEffect(() => {
    setSpriteSize({ width: settings.gridWidth, height: settings.gridHeight })
  }, [settings.gridWidth, settings.gridHeight])

  // For useCanvas, pass showOnionSkin and previous frame's layers (if any)
  const previousLayers = activeFrame > 0 ? frames[activeFrame - 1].layers : null

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
    showOnionSkin,
    previousLayers
  )

  // Use the custom hook for keyboard shortcuts
  useToolShortcuts(setCurrentTool, KEYBOARD_SHORTCUTS)

  // Move Layer Content: shift all pixels by dx, dy
  const shiftLayerPixels = (pixels, dx, dy) => {
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
  }

  // Track drag state for move tool
  const [moveStart, setMoveStart] = useState(null)

  const handleMouseDown = (e) => {
    if (currentTool === TOOLS.PAN) {
      setIsPanning(true)
      setLastPanPosition({ x: e.clientX, y: e.clientY })
      return
    }
    if (currentTool === TOOLS.MOVE_LAYER_CONTENT) {
      setMoveStart({ x: e.clientX, y: e.clientY })
      return
    }

    const { x, y } = getPixelCoordinates(e, pan, zoom)
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
    if (currentTool === TOOLS.PAN && isPanning) {
      const dx = e.clientX - lastPanPosition.x
      const dy = e.clientY - lastPanPosition.y
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setLastPanPosition({ x: e.clientX, y: e.clientY })
      return
    }
    if (currentTool === TOOLS.MOVE_LAYER_CONTENT && moveStart) {
      const dx = Math.round((e.clientX - moveStart.x) / (zoom * settings.defaultPixelSize))
      const dy = Math.round((e.clientY - moveStart.y) / (zoom * settings.defaultPixelSize))
      if (dx !== 0 || dy !== 0) {
        const newPixels = shiftLayerPixels(layers[activeLayer].pixels, dx, dy)
        setFrames(prev => prev.map((frame, fidx) => {
          if (fidx !== activeFrame) return frame
          return {
            ...frame,
            layers: frame.layers.map((layer, i) => 
              i === activeLayer ? { ...layer, pixels: newPixels } : layer
            )
          }
        }))
        setMoveStart({ x: e.clientX, y: e.clientY })
      }
      return
    }

    const { x, y } = getPixelCoordinates(e, pan, zoom)
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
    if (currentTool === TOOLS.LINE && lineStart && linePreview) {
      drawLine(lineStart, linePreview, lineStart.color, toolOptions)
    }
    if (currentTool === TOOLS.RECTANGLE && rectStart && rectPreview) {
      drawRectangle(rectStart, rectPreview, rectStart.color, toolOptions)
    }
    if (currentTool === TOOLS.CIRCLE && circleStart && circlePreview) {
      drawCircle(circleStart, circlePreview, circleStart.color, toolOptions)
    }
    if (currentTool === TOOLS.MOVE_LAYER_CONTENT && moveStart) {
      setMoveStart(null)
      return
    }
    setLineStart(null)
    setLinePreview(null)
    setRectStart(null)
    setRectPreview(null)
    setCircleStart(null)
    setCirclePreview(null)
    setIsDrawing(false)
    setIsPanning(false)
  }

  const handleMouseLeave = () => {
    setIsDrawing(false)
    setIsPanning(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(10, prev * delta)))
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
      setFrames(prev => [...prev, frame])
      setActiveFrame(frames.length)
      setIsImporting(false)
    } catch (error) {
      console.error('Error importing image:', error)
      alert('Error importing image. Please make sure it\'s a valid image file.')
      setIsImporting(false)
    }
  }

  // Handler: Add Layer
  const handleAddLayer = () => {
    setFrames(prev => prev.map((frame, fidx) => {
      if (fidx !== activeFrame) return frame
      const newLayer = {
        id: frame.layerIdCounter + 1,
        name: `Layer ${frame.layers.length + 1}`,
        visible: true,
        opacity: 1,
        groupId: null,
        pixels: Array(settings.gridHeight).fill(null).map(() => Array(settings.gridWidth).fill(null))
      }
      return {
        ...frame,
        layers: [...frame.layers, newLayer],
        layerIdCounter: frame.layerIdCounter + 1,
        activeLayer: frame.layers.length
      }
    }))
  }

  // Handler: Delete Layer
  const handleDeleteLayer = (idx) => {
    setFrames(prev => prev.map((frame, fidx) => {
      if (fidx !== activeFrame) return frame
      if (frame.layers.length === 1) return frame
      const newLayers = frame.layers.filter((_, i) => i !== idx)
      let newActive = frame.activeLayer
      if (frame.activeLayer === idx) newActive = 0
      else if (frame.activeLayer > idx) newActive = frame.activeLayer - 1
      return {
        ...frame,
        layers: newLayers,
        activeLayer: newActive
      }
    }))
  }

  // Handler: Select Layer
  const handleSelectLayer = (idx) => {
    setFrames(prev => prev.map((frame, fidx) =>
      fidx === activeFrame ? { ...frame, activeLayer: idx } : frame
    ))
  }

  // Handler: Toggle Visibility
  const handleToggleVisibility = (idx) => {
    setFrames(prev => prev.map((frame, fidx) => {
      if (fidx !== activeFrame) return frame
      return {
        ...frame,
        layers: frame.layers.map((layer, i) => i === idx ? { ...layer, visible: !layer.visible } : layer)
      }
    }))
  }

  // Handler: Move Layer (now accepts fromIdx, toIdx)
  const handleMoveLayer = (fromIdx, toIdxOrDirection) => {
    setFrames(prev => prev.map((frame, fidx) => {
      if (fidx !== activeFrame) return frame
      let layers = [...frame.layers]
      let toIdx = toIdxOrDirection
      // Support old up/down direction for button usage
      if (typeof toIdxOrDirection === 'string') {
        if (toIdxOrDirection === 'up' && fromIdx > 0) toIdx = fromIdx - 1
        else if (toIdxOrDirection === 'down' && fromIdx < layers.length - 1) toIdx = fromIdx + 1
        else return frame
      }
      if (fromIdx === toIdx || toIdx < 0 || toIdx >= layers.length) return frame
      const [moved] = layers.splice(fromIdx, 1)
      layers.splice(toIdx, 0, moved)
      let newActive = frame.activeLayer
      if (frame.activeLayer === fromIdx) newActive = toIdx
      else if (fromIdx < frame.activeLayer && toIdx >= frame.activeLayer) newActive = frame.activeLayer - 1
      else if (fromIdx > frame.activeLayer && toIdx <= frame.activeLayer) newActive = frame.activeLayer + 1
      return { ...frame, layers, activeLayer: newActive }
    }))
  }

  // Handler: Duplicate Layer
  const handleDuplicateLayer = (idx) => {
    setFrames(prev => prev.map((frame, fidx) => {
      if (fidx !== activeFrame) return frame
      const newLayer = {
        ...frame.layers[idx],
        id: frame.layerIdCounter + 1,
        name: `${frame.layers[idx].name} (copy)`,
        pixels: frame.layers[idx].pixels.map(row => [...row])
      }
      return {
        ...frame,
        layers: [...frame.layers, newLayer],
        layerIdCounter: frame.layerIdCounter + 1,
        activeLayer: frame.layers.length
      }
    }))
  }

  // Handler: Rename Layer
  const handleRenameLayer = (idx, newName) => {
    setFrames(prev => prev.map((frame, fidx) => {
      if (fidx !== activeFrame) return frame
      return {
        ...frame,
        layers: frame.layers.map((layer, i) => i === idx ? { ...layer, name: newName } : layer)
      }
    }))
  }

  // Handler: Set Layer Opacity
  const handleSetLayerOpacity = (idx, opacity) => {
    setFrames(prev => prev.map((frame, fidx) => {
      if (fidx !== activeFrame) return frame
      return {
        ...frame,
        layers: frame.layers.map((layer, i) => i === idx ? { ...layer, opacity } : layer)
      }
    }))
  }

  // Handler: Create Group
  const handleCreateGroup = () => {
    setFrames(prev => prev.map((frame, fidx) => {
      if (fidx !== activeFrame) return frame
      const groupId = frame.nextGroupId
      return {
        ...frame,
        nextGroupId: groupId + 1,
        layers: frame.layers.map((layer, i) => i === frame.activeLayer ? { ...layer, groupId } : layer)
      }
    }))
  }

  // Handler: Add to Group
  const handleAddToGroup = (idx, groupId) => {
    setFrames(prev => prev.map((frame, fidx) => {
      if (fidx !== activeFrame) return frame
      return {
        ...frame,
        layers: frame.layers.map((layer, i) => i === idx ? { ...layer, groupId } : layer)
      }
    }))
  }

  // Handler: Remove from Group
  const handleRemoveFromGroup = (idx) => {
    setFrames(prev => prev.map((frame, fidx) => {
      if (fidx !== activeFrame) return frame
      return {
        ...frame,
        layers: frame.layers.map((layer, i) => i === idx ? { ...layer, groupId: null } : layer)
      }
    }))
  }

  // Handler: Merge Layers
  const handleMergeLayers = (indices) => {
    setFrames(prev => prev.map((frame, fidx) => {
      if (fidx !== activeFrame) return frame
      if (indices.length < 2) return frame
      const newLayers = frame.layers.filter((_, i) => !indices.includes(i))
      const mergedPixels = Array(settings.gridHeight).fill(null).map(() => Array(settings.gridWidth).fill(null))
      indices.forEach(idx => {
        const layer = frame.layers[idx]
        for (let y = 0; y < settings.gridHeight; y++) {
          for (let x = 0; x < settings.gridWidth; x++) {
            if (layer.pixels[y][x]) {
              mergedPixels[y][x] = layer.pixels[y][x]
            }
          }
        }
      })
      const mergedLayer = {
        id: frame.layerIdCounter + 1,
        name: 'Merged Layer',
        visible: true,
        opacity: 1,
        groupId: null,
        pixels: mergedPixels
      }
      return {
        ...frame,
        layers: [...newLayers, mergedLayer],
        layerIdCounter: frame.layerIdCounter + 1,
        activeLayer: newLayers.length
      }
    }))
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
        setFrames(prev => prev.map((frame, fidx) => {
          if (fidx !== activeFrame) return frame
          const oldPixels = frame.layers[frame.activeLayer].pixels
          const height = oldPixels.length
          const width = oldPixels[0].length
          const newPixels = Array(height).fill(null).map(() => Array(width).fill(null))
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const newX = x + dx
              const newY = y + dy
              if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                newPixels[newY][newX] = oldPixels[y][x]
              }
            }
          }
          const newLayers = frame.layers.map((layer, idx) =>
            idx === frame.activeLayer ? { ...layer, pixels: newPixels } : layer
          )
          return { ...frame, layers: newLayers }
        }))
      }
    }
    window.addEventListener('keydown', handleArrow)
    return () => window.removeEventListener('keydown', handleArrow)
  }, [currentTool, activeLayer, activeFrame, frames])

  // Export logic
  const handleExport = () => {
    setShowExportModal(true)
  }

  const doExport = ({ mode, scale, framesPerRow, exportAllFrames }) => {
    const width = spriteSize.width
    const height = spriteSize.height
    const framesToExport = exportAllFrames ? frames : [frames[activeFrame]]

    if (mode === 'single') {
      // Export single frame
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Composite all visible layers in order
      framesToExport[0].layers.forEach(layer => {
        if (!layer.visible) return
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const color = layer.pixels[y][x]
            if (color) {
              // Parse rgba color
              const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
              if (rgba) {
                const [_, r, g, b, a] = rgba
                const alpha = layer.opacity * (a ? parseFloat(a) : 1)
                ctx.globalAlpha = alpha
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
                ctx.fillRect(x * scale, y * scale, scale, scale)
                ctx.globalAlpha = 1
              }
            }
          }
        }
      })

      // Download as PNG
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'pixel-art.png'
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    } else {
      // Export sprite sheet
      const numFrames = framesToExport.length
      const cols = Math.min(framesPerRow, numFrames)
      const rows = Math.ceil(numFrames / cols)
      const canvas = document.createElement('canvas')
      canvas.width = width * cols * scale
      canvas.height = height * rows * scale
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw each frame
      framesToExport.forEach((frame, idx) => {
        const col = idx % cols
        const row = Math.floor(idx / cols)
        const x = col * width * scale
        const y = row * height * scale

        // Composite all visible layers in order
        frame.layers.forEach(layer => {
          if (!layer.visible) return
          for (let y2 = 0; y2 < height; y2++) {
            for (let x2 = 0; x2 < width; x2++) {
              const color = layer.pixels[y2][x2]
              if (color) {
                // Parse rgba color
                const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
                if (rgba) {
                  const [_, r, g, b, a] = rgba
                  const alpha = layer.opacity * (a ? parseFloat(a) : 1)
                  ctx.globalAlpha = alpha
                  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
                  ctx.fillRect(x + x2 * scale, y + y2 * scale, scale, scale)
                  ctx.globalAlpha = 1
                }
              }
            }
          }
        })
      })

      // Download as PNG
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'sprite-sheet.png'
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    }

    setShowExportModal(false)
  }

  // Frame handlers
  const handleAddFrame = () => {
    setFrames(prev => [
      ...prev,
      {
        id: prev.length + 1,
        name: `Frame ${prev.length + 1}`,
        layers: [
          {
            id: 1,
            name: 'Layer 1',
            visible: true,
            opacity: 1,
            groupId: null,
            pixels: Array(settings.gridHeight).fill(null).map(() => Array(settings.gridWidth).fill(null))
          }
        ],
        layerIdCounter: 1,
        nextGroupId: 1,
        activeLayer: 0
      }
    ])
    setActiveFrame(frames.length)
  }
  const handleDeleteFrame = (idx) => {
    if (frames.length === 1) return
    setFrames(prev => prev.filter((_, i) => i !== idx))
    setActiveFrame(prev => prev === idx ? 0 : prev > idx ? prev - 1 : prev)
  }
  const handleDuplicateFrame = (idx) => {
    setFrames(prev => [
      ...prev,
      {
        ...prev[idx],
        id: prev.length + 1,
        name: `${prev[idx].name} (copy)`,
        layers: prev[idx].layers.map(layer => ({
          ...layer,
          pixels: layer.pixels.map(row => [...row])
        })),
        layerIdCounter: prev[idx].layerIdCounter,
        nextGroupId: prev[idx].nextGroupId,
        activeLayer: prev[idx].activeLayer
      }
    ])
    setActiveFrame(frames.length)
  }
  const handleSelectFrame = (idx) => setActiveFrame(idx)
  const handleToggleOnionSkin = () => setShowOnionSkin(v => !v)
  // Render a simple thumbnail (just a colored box for now)
  const renderFrameThumbnail = (frame) => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-700 rounded">
      <span className="text-xs text-cyan-200">{frame.name}</span>
    </div>
  )

  // Handler for ImportModal (single image)
  const handleImportFrame = ({ frame, width, height }) => {
    setSpriteSize({ width, height })
    setFrames([
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
    setFrames(frames.map((frame, i) => ({
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

  return (
    <div className="w-screen h-screen bg-neutral-900 text-white overflow-hidden flex flex-col">
      <div className="flex-shrink-0">
        <Header
          onImport={() => setIsImporting(true)}
          onExport={() => setShowExportModal(true)}
          onSettings={() => setShowSettings(true)}
        />
      </div>
      <div className="flex-1 min-h-0 flex">
        <div className="flex-shrink-0 flex flex-col mt-4 ml-4 mb-4 bg-neutral-800 border-t border-neutral-700 rounded-lg">
          <Toolbar
            currentTool={currentTool}
            onToolSelect={setCurrentTool}
            toolOptions={toolOptions}
            onToolOptionsChange={handleToolOptionsChange}
          />
          <div className="w-56">
            <ColorPicker
              onColorSelect={handleColorSelect}
              leftColor={leftColor}
              rightColor={rightColor}
              layers={layers}
            />
          </div>
        </div>
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-4 min-h-0">
            <Canvas
              canvasRef={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              settings={settings}
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
