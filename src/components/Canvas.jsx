import React from 'react'
import { VIEW_HELPERS } from '../constants'

const HELPER_LABELS = {
  [VIEW_HELPERS.TOP_DOWN]: 'Top-Down Helper',
  [VIEW_HELPERS.SIDE]: 'Side View Helper',
  [VIEW_HELPERS.ISOMETRIC]: 'Isometric Helper'
}

const Canvas = ({
  canvasRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onWheel,
  settings,
  viewHelper = VIEW_HELPERS.NONE
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
        {viewHelper !== VIEW_HELPERS.NONE && (
          <div className="pointer-events-none absolute top-4 left-4 px-3 py-1 rounded-md bg-indigo-600/30 border border-indigo-400/40 text-indigo-100 text-xs uppercase tracking-wide">
            {HELPER_LABELS[viewHelper]}
          </div>
        )}
      </div>
    </div>
  )
}

export default Canvas 