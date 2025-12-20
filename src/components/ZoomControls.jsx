import { FaSearchPlus, FaSearchMinus, FaExpand, FaCompress, FaHome } from 'react-icons/fa'

const ZoomControls = ({ 
  zoom, 
  onZoomIn, 
  onZoomOut, 
  onZoomReset, 
  onZoomToFit, 
  onZoomTo100 
}) => {
  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800 border-t border-neutral-700">
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          title="Zoom Out (Ctrl+-)"
        >
          <FaSearchMinus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          title="Zoom In (Ctrl+=)"
        >
          <FaSearchPlus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomReset}
          className="p-1.5 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          title="Reset Zoom (Ctrl+0)"
        >
          <FaHome className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomToFit}
          className="p-1.5 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          title="Zoom to Fit (Ctrl+9)"
        >
          <FaExpand className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomTo100}
          className="p-1.5 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          title="Zoom to 100% (Ctrl+1)"
        >
          <FaCompress className="w-4 h-4" />
        </button>
      </div>
      <div className="text-xs text-neutral-400 min-w-[3rem] text-right">
        {zoomPercent}%
      </div>
    </div>
  )
}

export default ZoomControls

