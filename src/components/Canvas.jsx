import React from 'react'

const Canvas = ({
  canvasRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onWheel,
  settings
}) => {
  return (
    <div className="bg-neutral-800 rounded-lg shadow-lg flex flex-col items-center justify-center overflow-auto border border-neutral-700 w-full h-full">
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onWheel={onWheel}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onContextMenu={(e) => e.preventDefault()}
          className="bg-white shadow-xl border border-purple-700/30 w-full h-full object-contain"
          style={{
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            backgroundColor: settings.backgroundColor
          }}
        />
      </div>
    </div>
  )
}

export default Canvas 