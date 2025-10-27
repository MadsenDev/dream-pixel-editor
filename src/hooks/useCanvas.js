import { useEffect, useRef, useMemo } from 'react'
import { PIXEL_SIZE, VIEW_HELPERS } from '../constants'

export const useCanvas = (
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
  viewHelper = VIEW_HELPERS.NONE,
  showOnionSkin = false,
  previousLayers = null,
  movePreview = null
) => {
  const frameRef = useRef(null)
  const prevLayersRef = useRef(layers)
  const prevPanRef = useRef(pan)
  const prevZoomRef = useRef(zoom)
  const prevSettingsRef = useRef(settings)

  // Memoize the shouldRedraw check
  const shouldRedraw = useMemo(() => {
    return (
      !prevLayersRef.current ||
      layers !== prevLayersRef.current ||
      pan.x !== prevPanRef.current.x ||
      pan.y !== prevPanRef.current.y ||
      zoom !== prevZoomRef.current ||
      settings !== prevSettingsRef.current ||
      lineStart !== null ||
      linePreview !== null ||
      rectStart !== null ||
      rectPreview !== null ||
      circleStart !== null ||
      circlePreview !== null ||
      movePreview !== null ||
      viewHelper !== VIEW_HELPERS.NONE
    )
  }, [layers, pan, zoom, settings, lineStart, linePreview, rectStart, rectPreview, circleStart, circlePreview, movePreview, viewHelper])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    // Cancel any pending animation frame
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }

    // Force initial draw or redraw if needed
    const draw = () => {
      // Set canvas internal size to match displayed size
      const displayWidth = canvas.clientWidth
      const displayHeight = canvas.clientHeight
      canvas.width = displayWidth
      canvas.height = displayHeight

      // Calculate scale so the sprite fits the canvas
      const scaleX = displayWidth / (spriteSize.width * PIXEL_SIZE)
      const scaleY = displayHeight / (spriteSize.height * PIXEL_SIZE)
      const scale = Math.min(scaleX, scaleY) * zoom

      // Center the sprite in the canvas
      const offsetX = (displayWidth - spriteSize.width * PIXEL_SIZE * scale) / 2 + pan.x
      const offsetY = (displayHeight - spriteSize.height * PIXEL_SIZE * scale) / 2 + pan.y

      ctx.save()
      ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY)

      // Fill background
      ctx.fillStyle = settings.backgroundColor || '#ffffff'
      ctx.fillRect(0, 0, spriteSize.width * PIXEL_SIZE, spriteSize.height * PIXEL_SIZE)

      // Draw grid if enabled
      if (settings.showGrid !== false) {
        const opacity = settings.gridOpacity || 0.3
        const gridColor = settings.gridColor || '#0d9488' // cyan-600
        ctx.strokeStyle = gridColor.replace(')', `, ${opacity})`).replace('rgb', 'rgba')
        ctx.lineWidth = 1 / scale // Scale line width to maintain pixel-perfect grid
        
        // Draw vertical lines
        for (let x = 0; x <= spriteSize.width; x++) {
          ctx.beginPath()
          ctx.moveTo(x * PIXEL_SIZE, 0)
          ctx.lineTo(x * PIXEL_SIZE, spriteSize.height * PIXEL_SIZE)
          ctx.stroke()
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= spriteSize.height; y++) {
          ctx.beginPath()
          ctx.moveTo(0, y * PIXEL_SIZE)
          ctx.lineTo(spriteSize.width * PIXEL_SIZE, y * PIXEL_SIZE)
          ctx.stroke()
        }
      }

      const drawViewHelper = () => {
        if (!viewHelper || viewHelper === VIEW_HELPERS.NONE) return

        const helperStroke = settings.viewHelperColor || 'rgba(147, 197, 253, 0.55)'
        const helperFill = settings.viewHelperAccentColor || 'rgba(59, 130, 246, 0.2)'
        const fullWidth = spriteSize.width * PIXEL_SIZE
        const fullHeight = spriteSize.height * PIXEL_SIZE
        const midX = fullWidth / 2
        const midY = fullHeight / 2
        const axisLength = Math.min(fullWidth, fullHeight) * 0.65

        ctx.save()
        ctx.lineWidth = 1 / scale
        ctx.strokeStyle = helperStroke
        ctx.setLineDash([PIXEL_SIZE / 1.5, PIXEL_SIZE / 1.5])

        switch (viewHelper) {
          case VIEW_HELPERS.TOP_DOWN: {
            ctx.beginPath()
            ctx.moveTo(midX, 0)
            ctx.lineTo(midX, fullHeight)
            ctx.moveTo(0, midY)
            ctx.lineTo(fullWidth, midY)
            ctx.stroke()

            ctx.setLineDash([])
            ctx.fillStyle = helperFill
            const tileSize = PIXEL_SIZE * 3
            ctx.fillRect(midX - tileSize / 2, midY - tileSize / 2, tileSize, tileSize)
            break
          }
          case VIEW_HELPERS.SIDE: {
            ctx.beginPath()
            const groundY = fullHeight - PIXEL_SIZE * 2
            ctx.moveTo(0, groundY)
            ctx.lineTo(fullWidth, groundY)
            ctx.moveTo(midX, 0)
            ctx.lineTo(midX, fullHeight)
            ctx.stroke()

            ctx.setLineDash([])
            ctx.fillStyle = helperFill
            const frontHeight = fullHeight * 0.5
            const frontWidth = fullWidth * 0.2
            ctx.fillRect(midX - frontWidth / 2, groundY - frontHeight, frontWidth, frontHeight)
            break
          }
          case VIEW_HELPERS.ISOMETRIC: {
            ctx.setLineDash([])
            const verticalLength = axisLength
            const diagLength = axisLength
            const angle = Math.PI / 6 // 30 degrees

            ctx.beginPath()
            ctx.moveTo(midX, midY)
            ctx.lineTo(midX, midY - verticalLength)
            ctx.moveTo(midX, midY)
            ctx.lineTo(midX + Math.cos(angle) * diagLength, midY + Math.sin(angle) * diagLength)
            ctx.moveTo(midX, midY)
            ctx.lineTo(midX - Math.cos(angle) * diagLength, midY + Math.sin(angle) * diagLength)
            ctx.stroke()

            ctx.fillStyle = helperFill
            ctx.beginPath()
            const diamondWidth = axisLength
            const diamondHeight = axisLength * 0.6
            ctx.moveTo(midX, midY - diamondHeight)
            ctx.lineTo(midX + diamondWidth / 2, midY)
            ctx.lineTo(midX, midY + diamondHeight)
            ctx.lineTo(midX - diamondWidth / 2, midY)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            break
          }
          default:
            break
        }

        ctx.restore()
      }

      drawViewHelper()

      // Onion skin: draw previous frame's layers with low opacity
      if (showOnionSkin && previousLayers) {
        previousLayers.forEach(layer => {
          if (!layer.visible) return
          const pixelData = layer.pixels
          ctx.globalAlpha = 0.3 * layer.opacity
          for (let y = 0; y < pixelData.length; y++) {
            for (let x = 0; x < pixelData[y].length; x++) {
              const color = pixelData[y][x]
              if (color) {
                ctx.fillStyle = color
                ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
              }
            }
          }
          ctx.globalAlpha = 1
        })
      }

      // Draw current layers
      layers.forEach((layer, layerIndex) => {
        if (!layer.visible) return
        const pixelData = layer.pixels
        ctx.globalAlpha = layer.opacity
        const offsetX = movePreview && movePreview.layerIndex === layerIndex ? movePreview.dx : 0
        const offsetY = movePreview && movePreview.layerIndex === layerIndex ? movePreview.dy : 0
        const height = pixelData.length
        const width = pixelData[0].length
        for (let y = 0; y < pixelData.length; y++) {
          for (let x = 0; x < pixelData[y].length; x++) {
            const color = pixelData[y][x]
            if (color) {
              const targetX = x + offsetX
              const targetY = y + offsetY
              if (targetX >= 0 && targetX < width && targetY >= 0 && targetY < height) {
                ctx.fillStyle = color
                ctx.fillRect(targetX * PIXEL_SIZE, targetY * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
              }
            }
          }
        }
        ctx.globalAlpha = 1
      })

      // Draw previews
      if (lineStart && linePreview) {
        ctx.fillStyle = lineStart.color
        let startX = lineStart.x
        let startY = lineStart.y
        let endX = linePreview.x
        let endY = linePreview.y

        if (toolOptions?.perfectShapes) {
          const dx = Math.abs(endX - startX)
          const dy = Math.abs(endY - startY)
          if (dx > dy) endY = startY
          else endX = startX
        }

        // Bresenham's line algorithm for preview
        let dx = Math.abs(endX - startX)
        let dy = Math.abs(endY - startY)
        let sx = startX < endX ? 1 : -1
        let sy = startY < endY ? 1 : -1
        let err = dx - dy
        let x = startX
        let y = startY

        while (true) {
          if (x >= 0 && x < spriteSize.width && y >= 0 && y < spriteSize.height) {
            ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
          }
          if (x === endX && y === endY) break
          const e2 = 2 * err
          if (e2 > -dy) { err -= dy; x += sx }
          if (e2 < dx) { err += dx; y += sy }
        }
      }

      if (rectStart && rectPreview) {
        ctx.fillStyle = rectStart.color
        let startX = Math.min(rectStart.x, rectPreview.x)
        let startY = Math.min(rectStart.y, rectPreview.y)
        let width = Math.abs(rectPreview.x - rectStart.x) + 1
        let height = Math.abs(rectPreview.y - rectStart.y) + 1

        if (toolOptions?.perfectShapes) {
          const size = Math.max(width, height)
          width = height = size
          if (rectPreview.x < rectStart.x) startX = rectStart.x - size + 1
          if (rectPreview.y < rectStart.y) startY = rectStart.y - size + 1
        }

        if (toolOptions?.filled) {
          for (let y = startY; y < startY + height; y++) {
            for (let x = startX; x < startX + width; x++) {
              if (x >= 0 && x < spriteSize.width && y >= 0 && y < spriteSize.height) {
                ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
              }
            }
          }
        } else {
          // Draw outline pixel by pixel
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

      if (circleStart && circlePreview) {
        ctx.fillStyle = circleStart.color
        let centerX = circleStart.x
        let centerY = circleStart.y
        let radiusX = Math.abs(circlePreview.x - circleStart.x)
        let radiusY = Math.abs(circlePreview.y - circleStart.y)

        if (toolOptions?.perfectShapes) {
          const radius = Math.max(radiusX, radiusY)
          radiusX = radiusY = radius
        }

        if (toolOptions?.drawFromCenter) {
          radiusX = Math.abs(circlePreview.x - circleStart.x)
          radiusY = Math.abs(circlePreview.y - circleStart.y)
        } else {
          centerX = Math.floor(circleStart.x + (circlePreview.x - circleStart.x) / 2)
          centerY = Math.floor(circleStart.y + (circlePreview.y - circleStart.y) / 2)
          radiusX = Math.floor(Math.abs(circlePreview.x - circleStart.x) / 2)
          radiusY = Math.floor(Math.abs(circlePreview.y - circleStart.y) / 2)
        }

        if (toolOptions?.filled) {
          for (let y = -radiusY; y <= radiusY; y++) {
            for (let x = -radiusX; x <= radiusX; x++) {
              const px = centerX + x
              const py = centerY + y
              if (px >= 0 && px < spriteSize.width && py >= 0 && py < spriteSize.height) {
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
          // Draw outline pixel by pixel using Bresenham's circle algorithm
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

      ctx.restore()

      // Update refs after drawing
      prevLayersRef.current = layers
      prevPanRef.current = pan
      prevZoomRef.current = zoom
      prevSettingsRef.current = settings
    }

    // Force initial draw
    draw()

    // Schedule subsequent draws based on shouldRedraw
    if (shouldRedraw) {
      frameRef.current = requestAnimationFrame(draw)
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [canvasRef, spriteSize, layers, zoom, pan, lineStart, linePreview, rectStart, rectPreview, circleStart, circlePreview, toolOptions, settings, viewHelper, showOnionSkin, previousLayers, movePreview, shouldRedraw])
}