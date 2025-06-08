import { useState, useRef, useEffect } from 'react'
import Toolbar from './components/Toolbar'
import ColorPicker from './components/ColorPicker'
import SettingsModal from './components/SettingsModal'
import { FaCog } from 'react-icons/fa'
import { TOOLS, DEFAULT_SETTINGS, DEFAULT_TOOL_OPTIONS, DEFAULT_COLORS } from './constants'

function App() {
  const [selectedTile, setSelectedTile] = useState(null)
  const [spriteSize, setSpriteSize] = useState({ width: DEFAULT_SETTINGS.gridWidth, height: DEFAULT_SETTINGS.gridHeight })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 })
  const [currentTool, setCurrentTool] = useState(TOOLS.PENCIL)
  const [pixelData, setPixelData] = useState(
    Array(DEFAULT_SETTINGS.gridHeight).fill(null).map(() => Array(DEFAULT_SETTINGS.gridWidth).fill(null))
  )
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const PIXEL_SIZE = 32 // Display size of each pixel
  const [leftColor, setLeftColor] = useState(DEFAULT_COLORS[0])
  const [rightColor, setRightColor] = useState(DEFAULT_COLORS[1])
  const [lineStart, setLineStart] = useState(null)
  const [linePreview, setLinePreview] = useState(null)
  const [rectStart, setRectStart] = useState(null)
  const [rectPreview, setRectPreview] = useState(null)
  const [circleStart, setCircleStart] = useState(null)
  const [circlePreview, setCirclePreview] = useState(null)
  const [toolOptions, setToolOptions] = useState(DEFAULT_TOOL_OPTIONS)
  const [isImporting, setIsImporting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  // Update sprite size when grid size changes
  useEffect(() => {
    setSpriteSize({ width: settings.gridWidth, height: settings.gridHeight })
    setPixelData(Array(settings.gridHeight).fill(null).map(() => Array(settings.gridWidth).fill(null)))
  }, [settings.gridWidth, settings.gridHeight])

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = spriteSize.width * PIXEL_SIZE
    canvas.height = spriteSize.height * PIXEL_SIZE
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Apply zoom and pan transform
    ctx.save()
    ctx.setTransform(zoom, 0, 0, zoom, pan.x, pan.y)
    
    // Fill background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw saved pixels
    for (let y = 0; y < pixelData.length; y++) {
      for (let x = 0; x < pixelData[y].length; x++) {
        const color = pixelData[y][x]
        if (color) {
          ctx.fillStyle = color
          ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
        }
      }
    }
    
    // Draw line preview if active
    if (lineStart && linePreview) {
      // Use Bresenham's algorithm for preview
      const points = []
      let start = { ...lineStart }
      let end = { ...linePreview }

      // Apply perfect line constraint if enabled
      if (toolOptions.perfectShapes) {
        const dx = Math.abs(end.x - start.x)
        const dy = Math.abs(end.y - start.y)
        if (dx > dy) {
          end = { ...end, y: start.y } // Horizontal line
        } else {
          end = { ...end, x: start.x } // Vertical line
        }
      }

      const dx = Math.abs(end.x - start.x)
      const dy = Math.abs(end.y - start.y)
      const sx = start.x < end.x ? 1 : -1
      const sy = start.y < end.y ? 1 : -1
      let err = dx - dy

      let x = start.x
      let y = start.y

      while (true) {
        points.push({ x, y })
        if (x === end.x && y === end.y) break
        const e2 = 2 * err
        if (e2 > -dy) {
          err -= dy
          x += sx
        }
        if (e2 < dx) {
          err += dx
          y += sy
        }
      }

      // Draw preview pixels
      ctx.fillStyle = lineStart.color
      points.forEach(({ x, y }) => {
        if (x >= 0 && x < spriteSize.width && y >= 0 && y < spriteSize.height) {
          ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
        }
      })
    }

    // Draw rectangle preview if active
    if (rectStart && rectPreview) {
      let startX = Math.min(rectStart.x, rectPreview.x)
      let startY = Math.min(rectStart.y, rectPreview.y)
      let width = Math.abs(rectPreview.x - rectStart.x) + 1
      let height = Math.abs(rectPreview.y - rectStart.y) + 1

      // Make perfect square if perfectShapes is enabled
      if (toolOptions.perfectShapes) {
        const size = Math.max(width, height)
        width = height = size
        if (rectPreview.x < rectStart.x) startX = rectStart.x - size + 1
        if (rectPreview.y < rectStart.y) startY = rectStart.y - size + 1
      }

      ctx.fillStyle = rectStart.color

      if (toolOptions.filled) {
        // Fill the entire rectangle
        for (let y = startY; y < startY + height; y++) {
          for (let x = startX; x < startX + width; x++) {
            if (x >= 0 && x < spriteSize.width && y >= 0 && y < spriteSize.height) {
              ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
            }
          }
        }
      } else {
        // Draw only the outline
        for (let x = startX; x < startX + width; x++) {
          if (x >= 0 && x < spriteSize.width) {
            if (startY >= 0 && startY < spriteSize.height) {
              ctx.fillRect(x * PIXEL_SIZE, startY * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
            }
            if (startY + height - 1 >= 0 && startY + height - 1 < spriteSize.height) {
              ctx.fillRect(x * PIXEL_SIZE, (startY + height - 1) * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
            }
          }
        }
        for (let y = startY; y < startY + height; y++) {
          if (y >= 0 && y < spriteSize.height) {
            if (startX >= 0 && startX < spriteSize.width) {
              ctx.fillRect(startX * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
            }
            if (startX + width - 1 >= 0 && startX + width - 1 < spriteSize.width) {
              ctx.fillRect((startX + width - 1) * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
            }
          }
        }
      }
    }
    
    // Draw circle preview if active
    if (circleStart && circlePreview) {
      // Calculate center and radius
      let centerX = circleStart.x
      let centerY = circleStart.y
      let radiusX = Math.abs(circlePreview.x - circleStart.x)
      let radiusY = Math.abs(circlePreview.y - circleStart.y)

      // Make perfect circle if perfectShapes is enabled
      if (toolOptions.perfectShapes) {
        const radius = Math.max(radiusX, radiusY)
        radiusX = radiusY = radius
      }

      // If drawing from center, adjust the radius
      if (toolOptions.drawFromCenter) {
        radiusX = Math.abs(circlePreview.x - circleStart.x)
        radiusY = Math.abs(circlePreview.y - circleStart.y)
      } else {
        centerX = Math.floor(circleStart.x + (circlePreview.x - circleStart.x) / 2)
        centerY = Math.floor(circleStart.y + (circlePreview.y - circleStart.y) / 2)
        radiusX = Math.floor(Math.abs(circlePreview.x - circleStart.x) / 2)
        radiusY = Math.floor(Math.abs(circlePreview.y - circleStart.y) / 2)
      }

      ctx.fillStyle = circleStart.color

      if (toolOptions.filled) {
        // Fill the circle using a more precise algorithm
        for (let y = -radiusY; y <= radiusY; y++) {
          for (let x = -radiusX; x <= radiusX; x++) {
            const px = centerX + x
            const py = centerY + y
            if (px >= 0 && px < spriteSize.width && py >= 0 && py < spriteSize.height) {
              // Use a more precise distance calculation
              const normalizedX = x / radiusX
              const normalizedY = y / radiusY
              const distance = normalizedX * normalizedX + normalizedY * normalizedY
              if (distance <= 1) {
                ctx.fillRect(px * PIXEL_SIZE, py * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
              }
            }
          }
        }
      } else {
        // Draw the outline using Bresenham's circle algorithm
        let x = 0
        let y = radiusY
        let d = 1 - radiusY
        let dE = 3
        let dSE = -2 * radiusY + 5

        const plotPoints = (x, y) => {
          const points = [
            { x: centerX + x, y: centerY + y },
            { x: centerX - x, y: centerY + y },
            { x: centerX + x, y: centerY - y },
            { x: centerX - x, y: centerY - y },
            { x: centerX + y, y: centerY + x },
            { x: centerX - y, y: centerY + x },
            { x: centerX + y, y: centerY - x },
            { x: centerX - y, y: centerY - x }
          ]
          points.forEach(({ x, y }) => {
            if (x >= 0 && x < spriteSize.width && y >= 0 && y < spriteSize.height) {
              ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
            }
          })
        }

        plotPoints(x, y)

        while (y > x) {
          if (d < 0) {
            d += dE
            dE += 2
            dSE += 2
          } else {
            d += dSE
            dE += 2
            dSE += 4
            y--
          }
          x++
          plotPoints(x, y)
        }
      }
    }
    
    // Draw grid
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1 / zoom
    
    // Draw vertical lines
    for (let x = 0; x <= spriteSize.width; x++) {
      ctx.beginPath()
      ctx.moveTo(x * PIXEL_SIZE, 0)
      ctx.lineTo(x * PIXEL_SIZE, canvas.height)
      ctx.stroke()
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= spriteSize.height; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * PIXEL_SIZE)
      ctx.lineTo(canvas.width, y * PIXEL_SIZE)
      ctx.stroke()
    }
    
    ctx.restore()
  }, [spriteSize, pixelData, zoom, pan, lineStart, linePreview, rectStart, rectPreview, circleStart, circlePreview, toolOptions.filled, toolOptions.perfectShapes, toolOptions.drawFromCenter])

  const getPixelCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Get the mouse position relative to the canvas
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Convert to canvas coordinates, accounting for pan and zoom
    const canvasX = (mouseX - pan.x) / zoom
    const canvasY = (mouseY - pan.y) / zoom
    
    // Convert to pixel coordinates
    let pixelX = Math.floor(canvasX / PIXEL_SIZE)
    let pixelY = Math.floor(canvasY / PIXEL_SIZE)
    
    // Ensure we're within bounds
    return {
      x: Math.max(0, Math.min(spriteSize.width - 1, pixelX)),
      y: Math.max(0, Math.min(spriteSize.height - 1, pixelY))
    }
  }

  const paintPixel = (x, y, color) => {
    if (x < 0 || x >= spriteSize.width || y < 0 || y >= spriteSize.height) return

    setPixelData(prev => {
      const updated = prev.map(row => [...row])
      updated[y][x] = color
      return updated
    })
  }

  const floodFill = (startX, startY, targetColor, replacementColor) => {
    if (startX < 0 || startX >= spriteSize.width || startY < 0 || startY >= spriteSize.height) return
    if (pixelData[startY][startX] !== targetColor) return

    const queue = [{ x: startX, y: startY }]
    const visited = new Set()

    while (queue.length > 0) {
      const { x, y } = queue.shift()
      const key = `${x},${y}`

      if (visited.has(key)) continue
      visited.add(key)

      if (x < 0 || x >= spriteSize.width || y < 0 || y >= spriteSize.height) continue
      if (pixelData[y][x] !== targetColor) continue

      setPixelData(prev => {
        const updated = prev.map(row => [...row])
        updated[y][x] = replacementColor
        return updated
      })

      queue.push({ x: x + 1, y })
      queue.push({ x: x - 1, y })
      queue.push({ x, y: y + 1 })
      queue.push({ x, y: y - 1 })
    }
  }

  const drawLine = (start, end, color) => {
    // If perfect shapes is enabled, make the line perfectly horizontal or vertical
    if (toolOptions.perfectShapes) {
      const dx = Math.abs(end.x - start.x)
      const dy = Math.abs(end.y - start.y)
      if (dx > dy) {
        end = { ...end, y: start.y } // Horizontal line
      } else {
        end = { ...end, x: start.x } // Vertical line
      }
    }

    const points = []
    const dx = Math.abs(end.x - start.x)
    const dy = Math.abs(end.y - start.y)
    const sx = start.x < end.x ? 1 : -1
    const sy = start.y < end.y ? 1 : -1
    let err = dx - dy

    let x = start.x
    let y = start.y

    while (true) {
      points.push({ x, y })
      if (x === end.x && y === end.y) break
      const e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        x += sx
      }
      if (e2 < dx) {
        err += dx
        y += sy
      }
    }

    setPixelData(prev => {
      const updated = prev.map(row => [...row])
      points.forEach(({ x, y }) => {
        if (x >= 0 && x < spriteSize.width && y >= 0 && y < spriteSize.height) {
          updated[y][x] = color
        }
      })
      return updated
    })
  }

  const drawRectangle = (start, end, color) => {
    let startX = Math.min(start.x, end.x)
    let startY = Math.min(start.y, end.y)
    let width = Math.abs(end.x - start.x) + 1
    let height = Math.abs(end.y - start.y) + 1

    // Make perfect square if perfectShapes is enabled
    if (toolOptions.perfectShapes) {
      const size = Math.max(width, height)
      width = height = size
      if (end.x < start.x) startX = start.x - size + 1
      if (end.y < start.y) startY = start.y - size + 1
    }

    setPixelData(prev => {
      const updated = prev.map(row => [...row])
      
      if (toolOptions.filled) {
        // Fill the entire rectangle
        for (let y = startY; y < startY + height; y++) {
          for (let x = startX; x < startX + width; x++) {
            if (x >= 0 && x < spriteSize.width && y >= 0 && y < spriteSize.height) {
              updated[y][x] = color
            }
          }
        }
      } else {
        // Draw only the outline
        for (let x = startX; x < startX + width; x++) {
          if (x >= 0 && x < spriteSize.width) {
            if (startY >= 0 && startY < spriteSize.height) updated[startY][x] = color
            if (startY + height - 1 >= 0 && startY + height - 1 < spriteSize.height) updated[startY + height - 1][x] = color
          }
        }
        for (let y = startY; y < startY + height; y++) {
          if (y >= 0 && y < spriteSize.height) {
            if (startX >= 0 && startX < spriteSize.width) updated[y][startX] = color
            if (startX + width - 1 >= 0 && startX + width - 1 < spriteSize.width) updated[y][startX + width - 1] = color
          }
        }
      }
      return updated
    })
  }

  const drawCircle = (start, end, color) => {
    // Calculate center and radius
    let centerX = start.x
    let centerY = start.y
    let radiusX = Math.abs(end.x - start.x)
    let radiusY = Math.abs(end.y - start.y)

    // Make perfect circle if perfectShapes is enabled
    if (toolOptions.perfectShapes) {
      const radius = Math.max(radiusX, radiusY)
      radiusX = radiusY = radius
    }

    // If drawing from center, adjust the radius
    if (toolOptions.drawFromCenter) {
      radiusX = Math.abs(end.x - start.x)
      radiusY = Math.abs(end.y - start.y)
    } else {
      centerX = Math.floor(start.x + (end.x - start.x) / 2)
      centerY = Math.floor(start.y + (end.y - start.y) / 2)
      radiusX = Math.floor(Math.abs(end.x - start.x) / 2)
      radiusY = Math.floor(Math.abs(end.y - start.y) / 2)
    }

    setPixelData(prev => {
      const updated = prev.map(row => [...row])
      
      if (toolOptions.filled) {
        // Fill the circle using a more precise algorithm
        for (let y = -radiusY; y <= radiusY; y++) {
          for (let x = -radiusX; x <= radiusX; x++) {
            const px = centerX + x
            const py = centerY + y
            if (px >= 0 && px < spriteSize.width && py >= 0 && py < spriteSize.height) {
              // Use a more precise distance calculation
              const normalizedX = x / radiusX
              const normalizedY = y / radiusY
              const distance = normalizedX * normalizedX + normalizedY * normalizedY
              if (distance <= 1) {
                updated[py][px] = color
              }
            }
          }
        }
      } else {
        // Draw the outline using Bresenham's circle algorithm
        let x = 0
        let y = radiusY
        let d = 1 - radiusY
        let dE = 3
        let dSE = -2 * radiusY + 5

        const plotPoints = (x, y) => {
          const points = [
            { x: centerX + x, y: centerY + y },
            { x: centerX - x, y: centerY + y },
            { x: centerX + x, y: centerY - y },
            { x: centerX - x, y: centerY - y },
            { x: centerX + y, y: centerY + x },
            { x: centerX - y, y: centerY + x },
            { x: centerX + y, y: centerY - x },
            { x: centerX - y, y: centerY - x }
          ]
          points.forEach(({ x, y }) => {
            if (x >= 0 && x < spriteSize.width && y >= 0 && y < spriteSize.height) {
              updated[y][x] = color
            }
          })
        }

        plotPoints(x, y)

        while (y > x) {
          if (d < 0) {
            d += dE
            dE += 2
            dSE += 2
          } else {
            d += dSE
            dE += 2
            dSE += 4
            y--
          }
          x++
          plotPoints(x, y)
        }
      }
      return updated
    })
  }

  const handleMouseDown = (e) => {
    if (currentTool === TOOLS.PAN) {
      setIsPanning(true)
      setLastPanPosition({ x: e.clientX, y: e.clientY })
      return
    }

    const { x, y } = getPixelCoordinates(e)
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

    const { x, y } = getPixelCoordinates(e)
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
      drawLine(lineStart, linePreview, lineStart.color)
    }
    if (currentTool === TOOLS.RECTANGLE && rectStart && rectPreview) {
      drawRectangle(rectStart, rectPreview, rectStart.color)
    }
    if (currentTool === TOOLS.CIRCLE && circleStart && circlePreview) {
      drawCircle(circleStart, circlePreview, circleStart.color)
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
      {/* Header */}
      <div className="bg-neutral-800 shadow-sm p-4 border-b border-neutral-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Pixel Art Editor</h1>
            <p className="text-neutral-400">Create and edit pixel art sprites</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600 transition-colors flex items-center gap-2"
            >
              <FaCog className="w-4 h-4" />
              Settings
            </button>
            <label className={`px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-colors cursor-pointer ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isImporting ? 'Importing...' : 'Import PNG'}
              <input
                type="file"
                accept=".png"
                onChange={handleFileImport}
                className="hidden"
                disabled={isImporting}
              />
            </label>
          </div>
        </div>
      </div>

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
        />

        {/* Canvas and controls */}
        <div className="bg-neutral-800 rounded-lg shadow-lg p-4 flex flex-col items-center justify-center overflow-auto border border-neutral-700">
          <div 
            className="relative"
            onWheel={handleWheel}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onContextMenu={(e) => e.preventDefault()}
              className="bg-white shadow-xl border border-neutral-700"
              style={{
                width: `${spriteSize.width * settings.defaultPixelSize}px`,
                height: `${spriteSize.height * settings.defaultPixelSize}px`,
                imageRendering: 'pixelated',
                backgroundColor: settings.backgroundColor
              }}
            />
          </div>
        </div>
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
