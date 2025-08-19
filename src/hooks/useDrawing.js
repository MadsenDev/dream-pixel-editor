import { useState, useRef, useCallback } from 'react'
import { TOOLS, PIXEL_SIZE } from '../constants'

export const useDrawing = (spriteSize, settings, layers, setLayers, activeLayer) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const [lineStart, setLineStart] = useState(null)
  const [linePreview, setLinePreview] = useState(null)
  const [rectStart, setRectStart] = useState(null)
  const [rectPreview, setRectPreview] = useState(null)
  const [circleStart, setCircleStart] = useState(null)
  const [circlePreview, setCirclePreview] = useState(null)
  const canvasRef = useRef(null)
  const lastPencilPixel = useRef(null)

  // Drawing actions: update only the active layer's pixels
  const paintPixel = useCallback((x, y, color) => {
    setLayers(prev => {
      const updated = prev.map((layer, idx) => {
      if (idx !== activeLayer) return layer
      const updatedPixels = layer.pixels.map(row => [...row])
      updatedPixels[y][x] = color
      return { ...layer, pixels: updatedPixels }
      })
      return updated
    })
  }, [activeLayer, setLayers])

  // Interpolated pencil draw
  const drawPencilLine = useCallback((x0, y0, x1, y1, color) => {
    setLayers(prev => {
      const updated = prev.map((layer, idx) => {
        if (idx !== activeLayer) return layer
        const updatedPixels = layer.pixels.map(row => [...row])
        // Bresenham's line algorithm
        let dx = Math.abs(x1 - x0)
        let dy = Math.abs(y1 - y0)
        let sx = x0 < x1 ? 1 : -1
        let sy = y0 < y1 ? 1 : -1
        let err = dx - dy
        let x = x0
        let y = y0
        while (true) {
          if (x >= 0 && x < updatedPixels[0].length && y >= 0 && y < updatedPixels.length) {
            updatedPixels[y][x] = color
          }
          if (x === x1 && y === y1) break
          const e2 = 2 * err
          if (e2 > -dy) { err -= dy; x += sx }
          if (e2 < dx) { err += dx; y += sy }
        }
        return { ...layer, pixels: updatedPixels }
      })
      return updated
    })
  }, [activeLayer, setLayers])

  const floodFill = useCallback((x, y, targetColor, replacementColor) => {
    setLayers(prev => {
      const updated = prev.map((layer, idx) => {
      if (idx !== activeLayer) return layer
      const pixels = layer.pixels.map(row => [...row])
      const width = pixels[0].length
      const height = pixels.length
      const queue = [{ x, y }]
      const visited = new Set()
      while (queue.length > 0) {
        const { x, y } = queue.shift()
        const key = `${x},${y}`
        if (visited.has(key)) continue
        visited.add(key)
        if (x < 0 || x >= width || y < 0 || y >= height) continue
        if (pixels[y][x] !== targetColor) continue
        pixels[y][x] = replacementColor
        queue.push({ x: x + 1, y })
        queue.push({ x: x - 1, y })
        queue.push({ x, y: y + 1 })
        queue.push({ x, y: y - 1 })
      }
      return { ...layer, pixels }
      })
      return updated
    })
  }, [activeLayer, setLayers])

  const drawLine = useCallback((start, end, color, toolOptions) => {
    setLayers(prev => {
      const updated = prev.map((layer, idx) => {
      if (idx !== activeLayer) return layer
      const updatedPixels = layer.pixels.map(row => [...row])
      let s = { ...start }, e = { ...end }
      if (toolOptions.perfectShapes) {
        const dx = Math.abs(e.x - s.x)
        const dy = Math.abs(e.y - s.y)
        if (dx > dy) e.y = s.y
        else e.x = s.x
      }
      const dx = Math.abs(e.x - s.x)
      const dy = Math.abs(e.y - s.y)
      const sx = s.x < e.x ? 1 : -1
      const sy = s.y < e.y ? 1 : -1
      let err = dx - dy
      let x = s.x, y = s.y
      while (true) {
        if (x >= 0 && x < updatedPixels[0].length && y >= 0 && y < updatedPixels.length) {
          updatedPixels[y][x] = color
        }
        if (x === e.x && y === e.y) break
        const e2 = 2 * err
        if (e2 > -dy) { err -= dy; x += sx }
        if (e2 < dx) { err += dx; y += sy }
      }
      return { ...layer, pixels: updatedPixels }
      })
      return updated
    })
  }, [activeLayer, setLayers])

  const drawRectangle = useCallback((start, end, color, toolOptions) => {
    setLayers(prev => {
      const updated = prev.map((layer, idx) => {
      if (idx !== activeLayer) return layer
      const updatedPixels = layer.pixels.map(row => [...row])
      let startX = Math.min(start.x, end.x)
      let startY = Math.min(start.y, end.y)
      let width = Math.abs(end.x - start.x) + 1
      let height = Math.abs(end.y - start.y) + 1
      if (toolOptions.perfectShapes) {
        const size = Math.max(width, height)
        width = height = size
        if (end.x < start.x) startX = start.x - size + 1
        if (end.y < start.y) startY = start.y - size + 1
      }
      if (toolOptions.filled) {
        for (let y = startY; y < startY + height; y++) {
          for (let x = startX; x < startX + width; x++) {
            if (x >= 0 && x < updatedPixels[0].length && y >= 0 && y < updatedPixels.length) {
              updatedPixels[y][x] = color
            }
          }
        }
      } else {
        for (let x = startX; x < startX + width; x++) {
          if (x >= 0 && x < updatedPixels[0].length) {
            if (startY >= 0 && startY < updatedPixels.length) updatedPixels[startY][x] = color
            if (startY + height - 1 >= 0 && startY + height - 1 < updatedPixels.length) updatedPixels[startY + height - 1][x] = color
          }
        }
        for (let y = startY; y < startY + height; y++) {
          if (y >= 0 && y < updatedPixels.length) {
            if (startX >= 0 && startX < updatedPixels[0].length) updatedPixels[y][startX] = color
            if (startX + width - 1 >= 0 && startX + width - 1 < updatedPixels[0].length) updatedPixels[y][startX + width - 1] = color
          }
        }
      }
      return { ...layer, pixels: updatedPixels }
      })
      return updated
    })
  }, [activeLayer, setLayers])

  const drawCircle = useCallback((start, end, color, toolOptions) => {
    setLayers(prev => {
      const updated = prev.map((layer, idx) => {
      if (idx !== activeLayer) return layer
      const updatedPixels = layer.pixels.map(row => [...row])
      let centerX = start.x
      let centerY = start.y
      let radiusX = Math.abs(end.x - start.x)
      let radiusY = Math.abs(end.y - start.y)
      if (toolOptions.perfectShapes) {
        const radius = Math.max(radiusX, radiusY)
        radiusX = radiusY = radius
      }
      if (toolOptions.drawFromCenter) {
        radiusX = Math.abs(end.x - start.x)
        radiusY = Math.abs(end.y - start.y)
      } else {
        centerX = Math.floor(start.x + (end.x - start.x) / 2)
        centerY = Math.floor(start.y + (end.y - start.y) / 2)
        radiusX = Math.floor(Math.abs(end.x - start.x) / 2)
        radiusY = Math.floor(Math.abs(end.y - start.y) / 2)
      }
      if (toolOptions.filled) {
        for (let y = -radiusY; y <= radiusY; y++) {
          for (let x = -radiusX; x <= radiusX; x++) {
            const px = centerX + x
            const py = centerY + y
            if (px >= 0 && px < updatedPixels[0].length && py >= 0 && py < updatedPixels.length) {
              const normalizedX = x / radiusX
              const normalizedY = y / radiusY
              const distance = normalizedX * normalizedX + normalizedY * normalizedY
              if (distance <= 1) {
                updatedPixels[py][px] = color
              }
            }
          }
        }
      } else {
        let x = 0, y = radiusY
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
            if (x >= 0 && x < updatedPixels[0].length && y >= 0 && y < updatedPixels.length) {
              updatedPixels[y][x] = color
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
      return { ...layer, pixels: updatedPixels }
      })
      return updated
    })
  }, [activeLayer, setLayers])

  const getPixelCoordinates = useCallback((e, pan, zoom) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate scale and offset (same as in drawing)
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const scaleX = displayWidth / (spriteSize.width * PIXEL_SIZE);
    const scaleY = displayHeight / (spriteSize.height * PIXEL_SIZE);
    const scale = Math.min(scaleX, scaleY) * zoom;
    const offsetX = (displayWidth - spriteSize.width * PIXEL_SIZE * scale) / 2 + pan.x;
    const offsetY = (displayHeight - spriteSize.height * PIXEL_SIZE * scale) / 2 + pan.y;

    // Convert mouse coordinates to pixel coordinates
    const x = Math.floor((mouseX - offsetX) / (PIXEL_SIZE * scale));
    const y = Math.floor((mouseY - offsetY) / (PIXEL_SIZE * scale));

    // Clamp to grid
    return {
      x: Math.max(0, Math.min(spriteSize.width - 1, x)),
      y: Math.max(0, Math.min(spriteSize.height - 1, y))
    };
  }, [spriteSize]);

  const handleMouseDown = useCallback((e, tool, color, toolOptions) => {
    const coords = getPixelCoordinates(e, { x: 0, y: 0 }, 1)
    if (coords.x < 0 || coords.x >= spriteSize.width || coords.y < 0 || coords.y >= spriteSize.height) return

    switch (tool) {
      case TOOLS.PENCIL:
        paintPixel(coords.x, coords.y, color)
        lastPencilPixel.current = { x: coords.x, y: coords.y }
        break
      case TOOLS.LINE:
        setLineStart({ x: coords.x, y: coords.y, color })
        setLinePreview({ x: coords.x, y: coords.y })
        break
      case TOOLS.RECTANGLE:
        setRectStart({ x: coords.x, y: coords.y, color })
        setRectPreview({ x: coords.x, y: coords.y })
        break
      case TOOLS.CIRCLE:
        setCircleStart({ x: coords.x, y: coords.y, color })
        setCirclePreview({ x: coords.x, y: coords.y })
        break
      case TOOLS.FILL:
        floodFill(coords.x, coords.y, layers[activeLayer].pixels[coords.y][coords.x], color)
        break
      default:
        break
    }
  }, [spriteSize, layers, activeLayer, paintPixel, floodFill, getPixelCoordinates])

  const handleMouseMove = useCallback((e, tool, color, toolOptions) => {
    if (!e.buttons) return // Only handle if a mouse button is pressed

    const coords = getPixelCoordinates(e, { x: 0, y: 0 }, 1)
    if (coords.x < 0 || coords.x >= spriteSize.width || coords.y < 0 || coords.y >= spriteSize.height) return

    switch (tool) {
      case TOOLS.PENCIL:
        if (lastPencilPixel.current) {
          drawPencilLine(lastPencilPixel.current.x, lastPencilPixel.current.y, coords.x, coords.y, color)
        }
        lastPencilPixel.current = { x: coords.x, y: coords.y }
        break
      case TOOLS.LINE:
        if (lineStart) {
          setLinePreview({ x: coords.x, y: coords.y })
        }
        break
      case TOOLS.RECTANGLE:
        if (rectStart) {
          setRectPreview({ x: coords.x, y: coords.y })
        }
        break
      case TOOLS.CIRCLE:
        if (circleStart) {
          setCirclePreview({ x: coords.x, y: coords.y })
        }
        break
      default:
        break
    }
  }, [spriteSize, lineStart, rectStart, circleStart, drawPencilLine, getPixelCoordinates])

  const handleMouseUp = useCallback((e, tool, toolOptions) => {
    const coords = getPixelCoordinates(e, { x: 0, y: 0 }, 1)
    if (coords.x < 0 || coords.x >= spriteSize.width || coords.y < 0 || coords.y >= spriteSize.height) return

    switch (tool) {
      case TOOLS.PENCIL:
        lastPencilPixel.current = null
        break
      case TOOLS.LINE:
        if (lineStart) {
          drawLine(lineStart, { x: coords.x, y: coords.y }, lineStart.color, toolOptions)
          setLineStart(null)
          setLinePreview(null)
        }
        break
      case TOOLS.RECTANGLE:
        if (rectStart) {
          drawRectangle(rectStart, { x: coords.x, y: coords.y }, rectStart.color, toolOptions)
          setRectStart(null)
          setRectPreview(null)
        }
        break
      case TOOLS.CIRCLE:
        if (circleStart) {
          drawCircle(circleStart, { x: coords.x, y: coords.y }, circleStart.color, toolOptions)
          setCircleStart(null)
          setCirclePreview(null)
        }
        break
      default:
        break
    }
  }, [spriteSize, lineStart, rectStart, circleStart, drawLine, drawRectangle, drawCircle, getPixelCoordinates])

  return {
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
    drawPencilLine,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  }
} 