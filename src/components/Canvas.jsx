import React, { useEffect, useRef, useState } from 'react'
import { drawLine, drawRectangle, drawCircle } from '../utils/drawing'

const Canvas = ({
  pixelData,
  spriteSize,
  activeTool,
  leftColor,
  rightColor,
  toolOptions,
  lineStart,
  linePreview,
  rectStart,
  rectPreview,
  circleStart,
  circlePreview,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp
}) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [pixelSize, setPixelSize] = useState(32)

  // Calculate pixel size based on container size
  useEffect(() => {
    const updatePixelSize = () => {
      if (!containerRef.current) return
      
      const container = containerRef.current
      const containerWidth = container.clientWidth - 32 // Account for padding
      const containerHeight = container.clientHeight - 32
      
      const widthScale = containerWidth / spriteSize.width
      const heightScale = containerHeight / spriteSize.height
      
      // Use the smaller scale to ensure the sprite fits in both dimensions
      const newPixelSize = Math.floor(Math.min(widthScale, heightScale))
      setPixelSize(Math.max(8, newPixelSize)) // Minimum size of 8px
    }

    updatePixelSize()
    window.addEventListener('resize', updatePixelSize)
    return () => window.removeEventListener('resize', updatePixelSize)
  }, [spriteSize])

  const getPixelCoordinates = (e) => {
    const rect = e.target.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / pixelSize)
    const y = Math.floor((e.clientY - rect.top) / pixelSize)
    return { x, y }
  }

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#ccc'
    ctx.lineWidth = 0.5
    for (let x = 0; x <= spriteSize.width; x++) {
      ctx.beginPath()
      ctx.moveTo(x * pixelSize, 0)
      ctx.lineTo(x * pixelSize, spriteSize.height * pixelSize)
      ctx.stroke()
    }
    for (let y = 0; y <= spriteSize.height; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * pixelSize)
      ctx.lineTo(spriteSize.width * pixelSize, y * pixelSize)
      ctx.stroke()
    }

    // Draw pixels
    for (let y = 0; y < spriteSize.height; y++) {
      for (let x = 0; x < spriteSize.width; x++) {
        const color = pixelData[y][x]
        if (color) {
          ctx.fillStyle = color
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
        }
      }
    }

    // Draw previews
    if (lineStart && linePreview) {
      ctx.strokeStyle = lineStart.color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(lineStart.x * pixelSize + pixelSize / 2, lineStart.y * pixelSize + pixelSize / 2)
      ctx.lineTo(linePreview.x * pixelSize + pixelSize / 2, linePreview.y * pixelSize + pixelSize / 2)
      ctx.stroke()
    }

    if (rectStart && rectPreview) {
      const startX = Math.min(rectStart.x, rectPreview.x)
      const startY = Math.min(rectStart.y, rectPreview.y)
      const width = Math.abs(rectPreview.x - rectStart.x) + 1
      const height = Math.abs(rectPreview.y - rectStart.y) + 1

      if (toolOptions.filled) {
        ctx.fillStyle = rectStart.color
        ctx.fillRect(startX * pixelSize, startY * pixelSize, width * pixelSize, height * pixelSize)
      } else {
        ctx.strokeStyle = rectStart.color
        ctx.lineWidth = 1
        ctx.strokeRect(startX * pixelSize, startY * pixelSize, width * pixelSize, height * pixelSize)
      }
    }

    if (circleStart && circlePreview) {
      const centerX = circleStart.x
      const centerY = circleStart.y
      const radiusX = Math.abs(circlePreview.x - circleStart.x)
      const radiusY = Math.abs(circlePreview.y - circleStart.y)

      if (toolOptions.filled) {
        ctx.fillStyle = circleStart.color
        ctx.beginPath()
        ctx.ellipse(
          centerX * pixelSize + pixelSize / 2,
          centerY * pixelSize + pixelSize / 2,
          radiusX * pixelSize,
          radiusY * pixelSize,
          0,
          0,
          Math.PI * 2
        )
        ctx.fill()
      } else {
        ctx.strokeStyle = circleStart.color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(
          centerX * pixelSize + pixelSize / 2,
          centerY * pixelSize + pixelSize / 2,
          radiusX * pixelSize,
          radiusY * pixelSize,
          0,
          0,
          Math.PI * 2
        )
        ctx.stroke()
      }
    }
  }, [
    pixelData,
    spriteSize,
    lineStart,
    linePreview,
    rectStart,
    rectPreview,
    circleStart,
    circlePreview,
    toolOptions,
    pixelSize
  ])

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={spriteSize.width * pixelSize}
        height={spriteSize.height * pixelSize}
        onMouseDown={(e) => {
          const { x, y } = getPixelCoordinates(e)
          handleMouseDown(e, activeTool, e.button === 2 ? rightColor : leftColor, toolOptions)
        }}
        onMouseMove={(e) => {
          if (!e.buttons) return
          handleMouseMove(e, activeTool, toolOptions)
        }}
        onMouseUp={(e) => {
          handleMouseUp(e, activeTool, toolOptions)
        }}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          border: '1px solid #ccc',
          cursor: 'crosshair'
        }}
      />
    </div>
  )
}

export default Canvas 