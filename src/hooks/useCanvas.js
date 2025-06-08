import { useEffect } from 'react'

export const useCanvas = (
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
) => {
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Set canvas internal size to match displayed size
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight
    canvas.width = displayWidth
    canvas.height = displayHeight

    // Calculate scale so the sprite fits the canvas
    const scaleX = displayWidth / (spriteSize.width * settings.defaultPixelSize)
    const scaleY = displayHeight / (spriteSize.height * settings.defaultPixelSize)
    const scale = Math.min(scaleX, scaleY) * zoom

    // Center the sprite in the canvas
    const offsetX = (displayWidth - spriteSize.width * settings.defaultPixelSize * scale) / 2 + pan.x
    const offsetY = (displayHeight - spriteSize.height * settings.defaultPixelSize * scale) / 2 + pan.y

    ctx.save()
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY)

    // Fill background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, spriteSize.width * settings.defaultPixelSize, spriteSize.height * settings.defaultPixelSize)

    // Draw saved pixels
    for (let y = 0; y < pixelData.length; y++) {
      for (let x = 0; x < pixelData[y].length; x++) {
        const color = pixelData[y][x]
        if (color) {
          ctx.fillStyle = color
          ctx.fillRect(x * settings.defaultPixelSize, y * settings.defaultPixelSize, settings.defaultPixelSize, settings.defaultPixelSize)
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
          ctx.fillRect(x * settings.defaultPixelSize, y * settings.defaultPixelSize, settings.defaultPixelSize, settings.defaultPixelSize)
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
              ctx.fillRect(x * settings.defaultPixelSize, y * settings.defaultPixelSize, settings.defaultPixelSize, settings.defaultPixelSize)
            }
          }
        }
      } else {
        // Draw only the outline
        for (let x = startX; x < startX + width; x++) {
          if (x >= 0 && x < spriteSize.width) {
            if (startY >= 0 && startY < spriteSize.height) {
              ctx.fillRect(x * settings.defaultPixelSize, startY * settings.defaultPixelSize, settings.defaultPixelSize, settings.defaultPixelSize)
            }
            if (startY + height - 1 >= 0 && startY + height - 1 < spriteSize.height) {
              ctx.fillRect(x * settings.defaultPixelSize, (startY + height - 1) * settings.defaultPixelSize, settings.defaultPixelSize, settings.defaultPixelSize)
            }
          }
        }
        for (let y = startY; y < startY + height; y++) {
          if (y >= 0 && y < spriteSize.height) {
            if (startX >= 0 && startX < spriteSize.width) {
              ctx.fillRect(startX * settings.defaultPixelSize, y * settings.defaultPixelSize, settings.defaultPixelSize, settings.defaultPixelSize)
            }
            if (startX + width - 1 >= 0 && startX + width - 1 < spriteSize.width) {
              ctx.fillRect((startX + width - 1) * settings.defaultPixelSize, y * settings.defaultPixelSize, settings.defaultPixelSize, settings.defaultPixelSize)
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
                ctx.fillRect(px * settings.defaultPixelSize, py * settings.defaultPixelSize, settings.defaultPixelSize, settings.defaultPixelSize)
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
              ctx.fillRect(x * settings.defaultPixelSize, y * settings.defaultPixelSize, settings.defaultPixelSize, settings.defaultPixelSize)
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
    ctx.lineWidth = 1 / scale
    
    // Draw vertical lines
    for (let x = 0; x <= spriteSize.width; x++) {
      ctx.beginPath()
      ctx.moveTo(x * settings.defaultPixelSize, 0)
      ctx.lineTo(x * settings.defaultPixelSize, spriteSize.height * settings.defaultPixelSize)
      ctx.stroke()
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= spriteSize.height; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * settings.defaultPixelSize)
      ctx.lineTo(spriteSize.width * settings.defaultPixelSize, y * settings.defaultPixelSize)
      ctx.stroke()
    }
    
    ctx.restore()
  }, [spriteSize, pixelData, zoom, pan, lineStart, linePreview, rectStart, rectPreview, circleStart, circlePreview, toolOptions.filled, toolOptions.perfectShapes, toolOptions.drawFromCenter, settings.defaultPixelSize])
} 