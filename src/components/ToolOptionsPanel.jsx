import { FaVectorSquare, FaExpand, FaCompress, FaArrowsAlt, FaMagnet, FaEye } from 'react-icons/fa'
import { TOOLS, VIEW_HELPERS } from '../constants'

const ToolOptionsPanel = ({ 
  currentTool, 
  toolOptions, 
  onToolOptionsChange,
  viewHelper,
  viewHelperOptions,
  onViewHelperOptionsChange
}) => {
  const isShapeTool = [TOOLS.LINE, TOOLS.RECTANGLE, TOOLS.CIRCLE].includes(currentTool)
  const isRectOrCircle = currentTool === TOOLS.RECTANGLE || currentTool === TOOLS.CIRCLE
  const isCircle = currentTool === TOOLS.CIRCLE
  const hasViewHelper = viewHelper && viewHelper !== VIEW_HELPERS.NONE

  return (
    <div className="p-3 flex items-center gap-4">
      <span className="text-sm font-medium text-neutral-400">Tool Options</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToolOptionsChange({ ...toolOptions, perfectShapes: !toolOptions.perfectShapes })}
          disabled={!isShapeTool}
          className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            !isShapeTool 
              ? 'opacity-30 cursor-not-allowed text-neutral-500' 
              : `hover:bg-neutral-600 text-neutral-300 hover:text-white ${
                  toolOptions.perfectShapes ? 'bg-purple-900/40 text-white' : ''
                }`
          }`}
          title="Perfect Shapes"
        >
          <FaVectorSquare className="w-5 h-5" />
        </button>

        <button
          onClick={() => onToolOptionsChange({ ...toolOptions, filled: !toolOptions.filled })}
          disabled={!isRectOrCircle}
          className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            !isRectOrCircle 
              ? 'opacity-30 cursor-not-allowed text-neutral-500' 
              : `hover:bg-neutral-600 text-neutral-300 hover:text-white ${
                  toolOptions.filled ? 'bg-purple-900/40 text-white' : ''
                }`
          }`}
          title={toolOptions.filled ? "Outline Mode" : "Fill Mode"}
        >
          {toolOptions.filled ? <FaCompress className="w-5 h-5" /> : <FaExpand className="w-5 h-5" />}
        </button>

        <button
          onClick={() => onToolOptionsChange({ ...toolOptions, drawFromCenter: !toolOptions.drawFromCenter })}
          disabled={!isCircle}
          className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            !isCircle 
              ? 'opacity-30 cursor-not-allowed text-neutral-500' 
              : `hover:bg-neutral-600 text-neutral-300 hover:text-white ${
                  toolOptions.drawFromCenter ? 'bg-purple-900/40 text-white' : ''
                }`
          }`}
          title={toolOptions.drawFromCenter ? "Draw from Corner" : "Draw from Center"}
        >
          <FaArrowsAlt className="w-5 h-5" />
        </button>

        {/* View Helper Options */}
        {hasViewHelper && onViewHelperOptionsChange && (
          <>
            <div className="h-6 w-px bg-neutral-600"></div>
            <button
              onClick={() => onViewHelperOptionsChange({ 
                ...viewHelperOptions, 
                snapToHelper: !viewHelperOptions.snapToHelper 
              })}
              className={`p-2 rounded-lg transition-colors hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                viewHelperOptions.snapToHelper ? 'bg-purple-900/40 text-white' : ''
              }`}
              title="Snap to Helper Grid"
            >
              <FaMagnet className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewHelperOptionsChange({ 
                ...viewHelperOptions, 
                overlayOpacity: viewHelperOptions.overlayOpacity > 0.1 
                  ? Math.max(0.1, viewHelperOptions.overlayOpacity - 0.1)
                  : 0.8
              })}
              className="p-2 rounded-lg transition-colors hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              title={`Overlay Opacity: ${Math.round((viewHelperOptions.overlayOpacity || 0.4) * 100)}%`}
            >
              <FaEye className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ToolOptionsPanel

