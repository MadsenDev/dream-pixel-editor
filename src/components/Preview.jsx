import React, { useRef, useEffect, useState } from 'react'
import { PIXEL_SIZE } from '../constants'
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaExchangeAlt, FaUndo } from 'react-icons/fa'

const Preview = ({ frames, spriteSize, settings, initialFps = 6 }) => {
  const canvasRef = useRef(null)
  const [playing, setPlaying] = useState(true)
  const [fps, setFps] = useState(initialFps)
  const [frameIdx, setFrameIdx] = useState(0)
  const [playStart, setPlayStart] = useState(1)
  const [playEnd, setPlayEnd] = useState(frames.length)
  const [pingPong, setPingPong] = useState(false)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const [scale, setScale] = useState(100)

  // Animation loop
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setFrameIdx(idx => {
        if (pingPong) {
          // Ping-pong logic
          if (direction === 1) {
            if (idx + 1 > playEnd - 1) {
              setDirection(-1)
              return playEnd - 2 >= playStart - 1 ? playEnd - 2 : playEnd - 1
            }
            return idx + 1
          } else {
            if (idx - 1 < playStart - 1) {
              setDirection(1)
              return playStart
            }
            return idx - 1
          }
        } else {
          // Normal loop
          if (idx + 1 > playEnd - 1) return playStart - 1
          return idx + 1
        }
      })
    }, 1000 / fps)
    return () => clearInterval(interval)
  }, [playing, fps, playStart, playEnd, pingPong, direction])

  // Clamp frameIdx if frames are deleted
  useEffect(() => {
    if (frameIdx >= frames.length) setFrameIdx(frames.length - 1)
    if (playEnd > frames.length) setPlayEnd(frames.length)
  }, [frames.length])

  // Reset direction when play range or mode changes
  useEffect(() => {
    setDirection(1)
  }, [playStart, playEnd, pingPong])

  // Draw current frame
  useEffect(() => {
    const frame = frames[frameIdx] || frames[0]
    if (!frame) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = spriteSize.width * PIXEL_SIZE * scale / 100
    const height = spriteSize.height * PIXEL_SIZE * scale / 100
    canvas.width = width
    canvas.height = height
    ctx.clearRect(0, 0, width, height)
    frame.layers.forEach(layer => {
      if (!layer.visible) return
      ctx.globalAlpha = layer.opacity
      for (let y = 0; y < layer.pixels.length; y++) {
        for (let x = 0; x < layer.pixels[y].length; x++) {
          const color = layer.pixels[y][x]
          if (color) {
            ctx.fillStyle = color
            ctx.fillRect(x * PIXEL_SIZE * scale / 100, y * PIXEL_SIZE * scale / 100, PIXEL_SIZE * scale / 100, PIXEL_SIZE * scale / 100)
          }
        }
      }
      ctx.globalAlpha = 1
    })
  }, [frameIdx, frames, spriteSize, scale])

  // Calculate preview dimensions based on aspect ratio
  const previewHeight = 180
  const aspectRatio = spriteSize.width / spriteSize.height || 1
  const previewWidth = Math.round(previewHeight * aspectRatio)

  if (!frames.length) return null

  // Clamp play range
  const minPlayEnd = Math.max(playStart, 1)
  const maxPlayEnd = frames.length
  const minPlayStart = 1
  const maxPlayStart = Math.min(playEnd, frames.length)

  const togglePlayback = () => setPlaying(p => !p)
  const resetPlayback = () => {
    setPlaying(true)
    setFrameIdx(0)
    setPlayStart(1)
    setPlayEnd(frames.length)
  }

  const goToPreviousFrame = () => {
    setFrameIdx(idx => {
      if (idx <= playStart - 1) return playEnd - 1
      return idx - 1
    })
  }

  const goToNextFrame = () => {
    setFrameIdx(idx => {
      if (idx >= playEnd - 1) return playStart - 1
      return idx + 1
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-purple-300">Preview</h2>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded bg-neutral-700 hover:bg-purple-600 text-purple-300 hover:text-white transition-colors"
            onClick={goToPreviousFrame}
            title="Previous Frame"
          >
            <FaStepBackward className="w-3.5 h-3.5" />
          </button>
          <button
            className={`p-1.5 rounded transition-colors ${
              playing ? 'bg-purple-600 text-white' : 'bg-neutral-700 text-purple-300 hover:bg-purple-600 hover:text-white'
            }`}
            onClick={togglePlayback}
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? <FaPause className="w-3.5 h-3.5" /> : <FaPlay className="w-3.5 h-3.5" />}
          </button>
          <button
            className="p-1.5 rounded bg-neutral-700 hover:bg-purple-600 text-purple-300 hover:text-white transition-colors"
            onClick={goToNextFrame}
            title="Next Frame"
          >
            <FaStepForward className="w-3.5 h-3.5" />
          </button>
        <button
            className="p-1.5 rounded bg-neutral-700 hover:bg-purple-600 text-purple-300 hover:text-white transition-colors"
            onClick={resetPlayback}
            title="Reset"
        >
            <FaUndo className="w-3.5 h-3.5" />
        </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative aspect-square rounded-lg overflow-hidden border border-purple-700/30 bg-neutral-800">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{
            imageRendering: 'pixelated',
            backgroundColor: settings.backgroundColor
          }}
        />
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="30"
            value={fps}
            onChange={e => setFps(Number(e.target.value))}
            className="flex-1 accent-purple-500 bg-neutral-700 h-1 rounded-full"
          />
          <span className="text-xs text-purple-300 w-8 text-right">{fps} FPS</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="100"
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
            className="flex-1 accent-purple-500 bg-neutral-700 h-1 rounded-full"
          />
          <span className="text-xs text-purple-300 w-8 text-right">{scale}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-300">From:</span>
          <input
            type="number"
            min={minPlayStart}
            max={maxPlayStart}
            value={playStart}
            onChange={e => setPlayStart(Number(e.target.value))}
            className="w-12 px-1 py-0.5 bg-neutral-700 border border-neutral-600 rounded text-xs text-purple-300"
      />
          <span className="text-xs text-purple-300">To:</span>
          <input
            type="number"
            min={minPlayEnd}
            max={maxPlayEnd}
            value={playEnd}
            onChange={e => setPlayEnd(Number(e.target.value))}
            className="w-12 px-1 py-0.5 bg-neutral-700 border border-neutral-600 rounded text-xs text-purple-300"
          />
          <button
            className={`p-1.5 rounded transition-colors ${
              pingPong ? 'bg-purple-600 text-white' : 'bg-neutral-700 text-purple-300 hover:bg-purple-600 hover:text-white'
            }`}
            onClick={() => setPingPong(p => !p)}
            title={pingPong ? "Normal Loop" : "Ping Pong"}
          >
            <FaExchangeAlt className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Preview 