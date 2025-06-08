import { useState, useCallback } from 'react'
import { drawLine, drawRectangle, drawCircle, floodFill } from '../utils/drawing'

export const useDrawingTools = (spriteSize, pixelData, setPixelData) => {
  const [lineStart, setLineStart] = useState(null)
  const [linePreview, setLinePreview] = useState(null)
  const [rectStart, setRectStart] = useState(null)
  const [rectPreview, setRectPreview] = useState(null)
  const [circleStart, setCircleStart] = useState(null)
  const [circlePreview, setCirclePreview] = useState(null)

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

  const handleMouseMove = useCallback((e, tool, toolOptions) => {
    if (!e.buttons) return // Only handle if a mouse button is pressed

    const rect = e.target.getBoundingClientRect()
    const pixelSize = rect.width / spriteSize.width
    const x = Math.floor((e.clientX - rect.left) / pixelSize)
    const y = Math.floor((e.clientY - rect.top) / pixelSize)

    if (x < 0 || x >= spriteSize.width || y < 0 || y >= spriteSize.height) return

    switch (tool) {
      case 'PENCIL':
        setPixelData(prev => {
          const updated = prev.map(row => [...row])
          updated[y][x] = lineStart?.color || prev[y][x]
          return updated
        })
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