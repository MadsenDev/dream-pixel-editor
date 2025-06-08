import { useState, useRef } from 'react'
import { TOOLS } from '../constants'

export const useDrawing = (spriteSize, settings) => {
  const [pixelData, setPixelData] = useState(
    Array(settings.gridHeight).fill(null).map(() => Array(settings.gridWidth).fill(null))
  )
  const [isDrawing, setIsDrawing] = useState(false)
  const [lineStart, setLineStart] = useState(null)
  const [linePreview, setLinePreview] = useState(null)
  const [rectStart, setRectStart] = useState(null)
  const [rectPreview, setRectPreview] = useState(null)
  const [circleStart, setCircleStart] = useState(null)
  const [circlePreview, setCirclePreview] = useState(null)
  const canvasRef = useRef(null)

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

  const drawLine = (start, end, color, toolOptions) => {
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

  const drawRectangle = (start, end, color, toolOptions) => {
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

  const drawCircle = (start, end, color, toolOptions) => {
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

  const getPixelCoordinates = (e, pan, zoom) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate scale and offset (same as in drawing)
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const scaleX = displayWidth / (spriteSize.width * settings.defaultPixelSize);
    const scaleY = displayHeight / (spriteSize.height * settings.defaultPixelSize);
    const scale = Math.min(scaleX, scaleY) * zoom;
    const offsetX = (displayWidth - spriteSize.width * settings.defaultPixelSize * scale) / 2 + pan.x;
    const offsetY = (displayHeight - spriteSize.height * settings.defaultPixelSize * scale) / 2 + pan.y;

    // Undo the transform
    const x = Math.floor((mouseX - offsetX) / (settings.defaultPixelSize * scale));
    const y = Math.floor((mouseY - offsetY) / (settings.defaultPixelSize * scale));

    // Clamp to grid
    return {
      x: Math.max(0, Math.min(spriteSize.width - 1, x)),
      y: Math.max(0, Math.min(spriteSize.height - 1, y)),
    };
  };

  return {
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
  }
} 