import { useEffect, useRef, useMemo } from 'react'
import { PIXEL_SIZE, VIEW_HELPERS } from '../constants'

// Global ref to store guide handles for hit testing
export const guideHandlesRef = { current: [] }

/**
 * Draw view helper overlay based on the active helper type
 */
function drawViewHelperOverlay(ctx, spriteSize, scale, offsetX, offsetY, viewHelper, settings, viewHelperOptions = {}) {
  if (!viewHelper || viewHelper === VIEW_HELPERS.NONE) return

  const { width, height } = spriteSize
  const fullWidth = width * PIXEL_SIZE
  const fullHeight = height * PIXEL_SIZE
  const opacity = viewHelperOptions.overlayOpacity ?? 0.4

  ctx.save()
  // Note: We're already in transformed coordinates (scale applied via setTransform)
  // So we use sprite coordinates (0 to fullWidth/fullHeight) and line width is in sprite space
  ctx.lineWidth = 1

  switch (viewHelper) {
    case VIEW_HELPERS.TOP_DOWN: {
      // Major grid every N tiles
      const majorGridEvery = viewHelperOptions.majorGridEvery ?? 4
      ctx.strokeStyle = `rgba(80, 200, 255, ${opacity})`
      
      // Draw major vertical grid lines (in sprite coordinates)
      for (let x = 0; x <= width; x += majorGridEvery) {
        const px = x * PIXEL_SIZE
        ctx.beginPath()
        ctx.moveTo(px, 0)
        ctx.lineTo(px, fullHeight)
        ctx.stroke()
      }
      
      // Draw major horizontal grid lines (in sprite coordinates)
      for (let y = 0; y <= height; y += majorGridEvery) {
        const py = y * PIXEL_SIZE
        ctx.beginPath()
        ctx.moveTo(0, py)
        ctx.lineTo(fullWidth, py)
        ctx.stroke()
      }

      // Center marker
      if (viewHelperOptions.showCenterMarker !== false) {
        const cx = fullWidth / 2
        const cy = fullHeight / 2
        ctx.fillStyle = `rgba(80, 200, 255, ${opacity + 0.3})`
        ctx.fillRect(cx - 2, cy - 2, 4, 4)
        
        // Center crosshair
        ctx.strokeStyle = `rgba(80, 200, 255, ${opacity + 0.2})`
        const crosshairSize = Math.min(fullWidth, fullHeight) * 0.3
        ctx.beginPath()
        ctx.moveTo(cx - crosshairSize / 2, cy)
        ctx.lineTo(cx + crosshairSize / 2, cy)
        ctx.moveTo(cx, cy - crosshairSize / 2)
        ctx.lineTo(cx, cy + crosshairSize / 2)
        ctx.stroke()
      }

      // Compass/North arrow
      if (viewHelperOptions.showCompass !== false) {
        const compassSize = 20
        const compassX = fullWidth - compassSize * 2
        const compassY = compassSize * 2
        
        ctx.fillStyle = `rgba(80, 200, 255, ${opacity + 0.3})`
        ctx.strokeStyle = `rgba(80, 200, 255, ${opacity + 0.5})`
        
        // Draw N arrow pointing up
        ctx.beginPath()
        ctx.moveTo(compassX, compassY - compassSize)
        ctx.lineTo(compassX - compassSize * 0.5, compassY)
        ctx.lineTo(compassX + compassSize * 0.5, compassY)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        
        // Draw "N" text
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = `rgba(80, 200, 255, ${opacity + 0.5})`
        ctx.fillText('N', compassX, compassY + compassSize * 0.7)
      }
      break
    }

    case VIEW_HELPERS.SIDE: {
      // Ground line at bottom row
      if (viewHelperOptions.showGroundLine !== false) {
        const groundY = fullHeight - PIXEL_SIZE
        ctx.strokeStyle = `rgba(255, 210, 80, ${opacity + 0.1})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, groundY)
        ctx.lineTo(fullWidth, groundY)
        ctx.stroke()
      }

      // Height guides
      if (viewHelperOptions?.showHeightGuides !== false) {
        ctx.strokeStyle = `rgba(255, 210, 80, ${opacity * 0.5})`
        ctx.lineWidth = 1
        // Use custom guide positions from options, or defaults
        const guidePositions = viewHelperOptions?.sideViewGuides || {
          head: 0.1,
          shoulder: 0.25,
          hip: 0.5,
          knee: 0.75,
          feet: 1.0
        }
        
        const guides = [
          { y: guidePositions.head, label: 'Head' },
          { y: guidePositions.shoulder, label: 'Shoulder' },
          { y: guidePositions.hip, label: 'Hip' },
          { y: guidePositions.knee, label: 'Knee' },
          { y: guidePositions.feet, label: 'Feet' }
        ]
        
        // Store guide positions for hit testing
        const guideHandles = []
        
        guides.forEach(({ y, label }, index) => {
          // Clamp y to valid range and convert percentage to pixel row
          const clampedY = Math.max(0, Math.min(1, y))
          const pixelY = clampedY === 1.0 ? (height - 1) : Math.floor(clampedY * height)
          const guideY = pixelY * PIXEL_SIZE
          
          ctx.beginPath()
          ctx.moveTo(0, guideY)
          ctx.lineTo(fullWidth, guideY)
          ctx.stroke()
          
          // Draw draggable handle to the right of the sprite
          const handleX = fullWidth + 10 // 10px to the right of sprite
          const handleY = guideY
          const handleSize = 12
          
          // Draw handle
          ctx.fillStyle = `rgba(255, 210, 80, ${opacity + 0.3})`
          ctx.strokeStyle = `rgba(255, 210, 80, ${opacity + 0.7})`
          ctx.lineWidth = 2
          ctx.fillRect(handleX - handleSize / 2, handleY - handleSize / 2, handleSize, handleSize)
          ctx.strokeRect(handleX - handleSize / 2, handleY - handleSize / 2, handleSize, handleSize)
          
          // Draw label on handle
          ctx.font = '9px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = `rgba(0, 0, 0, 0.8)`
          ctx.fillText(label[0].toUpperCase(), handleX, handleY)
          
          // Store handle info for hit testing (in sprite coordinates)
          guideHandles.push({
            label,
            key: ['head', 'shoulder', 'hip', 'knee', 'feet'][index],
            handleX, // In sprite coordinates
            handleY, // In sprite coordinates
            handleSize,
            pixelY,
            guideY
          })
        })
        
        // Store handles for hit testing (convert to screen coordinates)
        // Note: handleX and handleY are in sprite coordinates (0 to fullWidth/fullHeight)
        // After the transform (scale, offsetX, offsetY), they become screen coordinates
        guideHandlesRef.current = guideHandles.map(handle => ({
          ...handle,
          screenX: handle.handleX * scale + offsetX,
          screenY: handle.handleY * scale + offsetY,
          screenSize: handle.handleSize * scale
        }))
      }

      // Hitbox rectangle
      if (viewHelperOptions.showHitbox !== false) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`
        ctx.lineWidth = 1
        const boxWidth = Math.floor(width * 0.6) * PIXEL_SIZE
        const boxHeight = Math.floor(height * 0.9) * PIXEL_SIZE
        const boxX = (fullWidth - boxWidth) / 2
        const boxY = fullHeight - boxHeight
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)
      }
      break
    }

    case VIEW_HELPERS.ISOMETRIC: {
      const isoTileW = (viewHelperOptions.isoTileWidth ?? 16) * PIXEL_SIZE
      const isoTileH = (viewHelperOptions.isoTileHeight ?? 8) * PIXEL_SIZE
      
      ctx.strokeStyle = `rgba(120, 200, 255, ${opacity})`
      ctx.lineWidth = 1

      // Calculate how many tiles to draw
      const cols = Math.ceil(width / 2)
      const rows = Math.ceil(height / 2)
      
      // Draw diamond grid (in sprite coordinates)
      for (let y = -rows; y <= rows; y++) {
        for (let x = -cols; x <= cols; x++) {
          // Isometric projection: 2:1 ratio
          const centerX = fullWidth / 2 + (x - y) * (isoTileW / 2)
          const centerY = fullHeight / 2 + (x + y) * (isoTileH / 2)
          
          // Only draw if within visible bounds
          if (centerX < -isoTileW || centerX > fullWidth + isoTileW) continue
          if (centerY < -isoTileH || centerY > fullHeight + isoTileH) continue
          
          // Diamond corners
          const top = { x: centerX, y: centerY - isoTileH / 2 }
          const right = { x: centerX + isoTileW / 2, y: centerY }
          const bottom = { x: centerX, y: centerY + isoTileH / 2 }
          const left = { x: centerX - isoTileW / 2, y: centerY }
          
          ctx.beginPath()
          ctx.moveTo(top.x, top.y)
          ctx.lineTo(right.x, right.y)
          ctx.lineTo(bottom.x, bottom.y)
          ctx.lineTo(left.x, left.y)
          ctx.closePath()
          ctx.stroke()
        }
      }

      // Highlight center tile
      const centerX = fullWidth / 2
      const centerY = fullHeight / 2
      ctx.fillStyle = `rgba(120, 200, 255, ${opacity * 0.2})`
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - isoTileH / 2)
      ctx.lineTo(centerX + isoTileW / 2, centerY)
      ctx.lineTo(centerX, centerY + isoTileH / 2)
      ctx.lineTo(centerX - isoTileW / 2, centerY)
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
  movePreview = null,
  viewHelperOptions = {}
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
      viewHelper !== VIEW_HELPERS.NONE ||
      (viewHelperOptions && JSON.stringify(viewHelperOptions) !== JSON.stringify(prevSettingsRef.current?.viewHelperOptions))
    )
  }, [layers, pan, zoom, settings, lineStart, linePreview, rectStart, rectPreview, circleStart, circlePreview, movePreview, viewHelper, viewHelperOptions])

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

      // Draw view helper overlay (after grid, before sprite)
      if (viewHelper !== VIEW_HELPERS.NONE) {
        drawViewHelperOverlay(ctx, spriteSize, scale, offsetX, offsetY, viewHelper, settings, viewHelperOptions)
      }

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
      prevSettingsRef.current = { ...settings, viewHelperOptions }
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
  }, [canvasRef, spriteSize, layers, zoom, pan, lineStart, linePreview, rectStart, rectPreview, circleStart, circlePreview, toolOptions, settings, viewHelper, showOnionSkin, previousLayers, movePreview, viewHelperOptions, shouldRedraw])
}