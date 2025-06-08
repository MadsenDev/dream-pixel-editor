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

  const {
    pixelData,
    setPixelData,
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
    getPixelCoordinates
  } = useDrawing(spriteSize, settings)

  // Update sprite size when grid size changes
  useEffect(() => {
    setSpriteSize({ width: settings.gridWidth, height: settings.gridHeight })
    setPixelData(Array(settings.gridHeight).fill(null).map(() => Array(settings.gridWidth).fill(null)))
  }, [settings.gridWidth, settings.gridHeight])

  // Use useCanvas for all canvas drawing
  useCanvas(
    canvasRef,
    spriteSize,
    pixelData,
    zoom,
    pan,
    lineStart,
    linePreview,
    rectStart,
    rectPreview,
    circleStart,
    circlePreview,
    toolOptions,
    settings
  )

  // Use the custom hook for keyboard shortcuts
  useToolShortcuts(setCurrentTool, KEYBOARD_SHORTCUTS)

  const handleMouseDown = (e) => {
    if (currentTool === TOOLS.PAN) {
      setIsPanning(true)
      setLastPanPosition({ x: e.clientX, y: e.clientY })
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
        const targetColor = pixelData[y][x]
        floodFill(x, y, targetColor, color)
        break
      case TOOLS.EYEDROPPER:
        const sampledColor = pixelData[y][x]
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
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const img = new Image()
        img.onload = () => {
          // Create a temporary canvas to read pixel data
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')
          tempCanvas.width = img.width
          tempCanvas.height = img.height
          
          // Draw the image on the temporary canvas
          tempCtx.drawImage(img, 0, 0)
          
          // Get pixel data
          const imageData = tempCtx.getImageData(0, 0, img.width, img.height)
          const data = imageData.data
          
          // Create new pixel data array
          const newPixelData = Array(img.height).fill(null).map(() => Array(img.width).fill(null))
          
          // Convert RGBA data to hex colors
          for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
              const idx = (y * img.width + x) * 4
              const r = data[idx]
              const g = data[idx + 1]
              const b = data[idx + 2]
              const a = data[idx + 3]
              
              // Only set pixel if it's not transparent
              if (a > 0) {
                const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
                newPixelData[y][x] = hex
              }
            }
          }
          
          // Update both states in a single batch
          setSpriteSize({ width: img.width, height: img.height })
          setPixelData(newPixelData)
          setIsImporting(false)
        }
        
        img.src = event.target.result
      } catch (error) {
        console.error('Error importing image:', error)
        alert('Error importing image. Please make sure it\'s a valid image file.')
        setIsImporting(false)
      }
    }
    
    reader.readAsDataURL(file)
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-900">
      <Header
        isImporting={isImporting}
        onImport={handleFileImport}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-[80px,300px,1fr] gap-4 p-4 overflow-hidden">
        {/* Toolbar */}
        <Toolbar currentTool={currentTool} onToolSelect={setCurrentTool} />

        {/* Color Picker */}
        <ColorPicker 
          onColorSelect={handleColorSelect} 
          pixelData={pixelData}
          currentTool={currentTool}
          toolOptions={toolOptions}
          onToolOptionsChange={setToolOptions}
          leftColor={leftColor}
          rightColor={rightColor}
        />

        {/* Canvas and controls */}
        <Canvas
          canvasRef={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          settings={settings}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  )
}

export default App
