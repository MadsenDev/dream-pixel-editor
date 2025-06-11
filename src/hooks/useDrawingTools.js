import { useState, useCallback, useRef } from 'react'
import { drawLine, drawRectangle, drawCircle, floodFill } from '../utils/drawing'

export const useDrawingTools = (spriteSize, pixelData, setPixelData) => {
  const [lineStart, setLineStart] = useState(null)
  const [linePreview, setLinePreview] = useState(null)
  const [rectStart, setRectStart] = useState(null)
  const [rectPreview, setRectPreview] = useState(null)
  const [circleStart, setCircleStart] = useState(null)
  const [circlePreview, setCirclePreview] = useState(null)
  const lastPencilPixel = useRef(null)

  // Interpolated pencil draw
  const drawPencilLine = (x0, y0, x1, y1, color) => {
    setPixelData(prev => {
      const updated = prev.map(row => [...row])
      // Bresenham's line algorithm
      let dx = Math.abs(x1 - x0)
      let dy = Math.abs(y1 - y0)
      let sx = x0 < x1 ? 1 : -1
      let sy = y0 < y1 ? 1 : -1
      let err = dx - dy
      let x = x0
      let y = y0
      while (true) {
        if (x >= 0 && x < updated[0].length && y >= 0 && y < updated.length) {
          updated[y][x] = color
        }
        if (x === x1 && y === y1) break
        const e2 = 2 * err
        if (e2 > -dy) { err -= dy; x += sx }
        if (e2 < dx) { err += dx; y += sy }
      }
      return updated
    })
  }

  const handleMouseDown = useCallback((e, tool, color, toolOptions) => {
    const rect = e.target.getBoundingClientRect()
    const pixelSize = rect.width / spriteSize.width
    const x = Math.floor((e.clientX - rect.left) / pixelSize)
    const y = Math.floor((e.clientY - rect.top) / pixelSize)

    if (x < 0 || x >= spriteSize.width || y < 0 || y >= spriteSize.height) return

    switch (tool) {
      case 'PENCIL':
        setPixelData(prev => {
          const updated = prev.map(row => [...row])
          updated[y][x] = color
          return updated
        })
        lastPencilPixel.current = { x, y }
        break
      case 'LINE':
        setLineStart({ x, y, color })
        setLinePreview({ x, y })
        break
      case 'RECTANGLE':
        setRectStart({ x, y, color })
        setRectPreview({ x, y })
        break
      case 'CIRCLE':
        setCircleStart({ x, y, color })
        setCirclePreview({ x, y })
        break
      case 'FILL':
        floodFill(x, y, pixelData[y][x], color, spriteSize, pixelData, setPixelData)
        break
      default:
        break
    }
  }, [spriteSize, pixelData, setPixelData])

  const handleMouseMove = useCallback((e, tool, color, toolOptions) => {
    if (!e.buttons) return // Only handle if a mouse button is pressed

    const rect = e.target.getBoundingClientRect()
    const pixelSize = rect.width / spriteSize.width
    const x = Math.floor((e.clientX - rect.left) / pixelSize)
    const y = Math.floor((e.clientY - rect.top) / pixelSize)

    if (x < 0 || x >= spriteSize.width || y < 0 || y >= spriteSize.height) return

    switch (tool) {
      case 'PENCIL':
        if (lastPencilPixel.current) {
          drawPencilLine(lastPencilPixel.current.x, lastPencilPixel.current.y, x, y, color)
        }
        lastPencilPixel.current = { x, y }
        break
      case 'LINE':
        if (lineStart) {
          setLinePreview({ x, y })
        }
        break
      case 'RECTANGLE':
        if (rectStart) {
          setRectPreview({ x, y })
        }
        break
      case 'CIRCLE':
        if (circleStart) {
          setCirclePreview({ x, y })
        }
        break
      default:
        break
    }
  }, [spriteSize, lineStart, rectStart, circleStart, setPixelData])

  const handleMouseUp = useCallback((e, tool, toolOptions) => {
    const rect = e.target.getBoundingClientRect()
    const pixelSize = rect.width / spriteSize.width
    const x = Math.floor((e.clientX - rect.left) / pixelSize)
    const y = Math.floor((e.clientY - rect.top) / pixelSize)

    if (x < 0 || x >= spriteSize.width || y < 0 || y >= spriteSize.height) return

    switch (tool) {
      case 'PENCIL':
        lastPencilPixel.current = null
        break
      case 'LINE':
        if (lineStart) {
          drawLine(lineStart, { x, y }, lineStart.color, toolOptions, spriteSize, setPixelData)
          setLineStart(null)
          setLinePreview(null)
        }
        break
      case 'RECTANGLE':
        if (rectStart) {
          drawRectangle(rectStart, { x, y }, rectStart.color, toolOptions, spriteSize, setPixelData)
          setRectStart(null)
          setRectPreview(null)
        }
        break
      case 'CIRCLE':
        if (circleStart) {
          drawCircle(circleStart, { x, y }, circleStart.color, toolOptions, spriteSize, setPixelData)
          setCircleStart(null)
          setCirclePreview(null)
        }
        break
      default:
        break
    }
  }, [spriteSize, lineStart, rectStart, circleStart, setPixelData])

  return {
    lineStart,
    linePreview,
    rectStart,
    rectPreview,
    circleStart,
    circlePreview,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  }
} 