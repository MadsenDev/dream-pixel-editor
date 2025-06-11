import { FaPencilAlt, FaHandPaper, FaEraser, FaFillDrip, FaEyeDropper, FaSlash, FaSquare, FaCircle, FaArrowsAlt, FaExpand, FaCompress, FaVectorSquare } from 'react-icons/fa'

const TOOLS = {
  PENCIL: 'pencil',
  PAN: 'pan',
  ERASER: 'eraser',
  FILL: 'fill',
  EYEDROPPER: 'eyedropper',
  LINE: 'line',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  MOVE_LAYER_CONTENT: 'move_layer_content'
}

const TOOL_GROUPS = [
  {
    name: 'Basic',
    tools: [
      { id: TOOLS.PENCIL, icon: FaPencilAlt, label: 'Pencil', shortcut: 'P' },
      { id: TOOLS.ERASER, icon: FaEraser, label: 'Eraser', shortcut: 'E' },
      { id: TOOLS.FILL, icon: FaFillDrip, label: 'Fill', shortcut: 'G' },
      { id: TOOLS.EYEDROPPER, icon: FaEyeDropper, label: 'Picker', shortcut: 'I' }
    ]
  },
  {
    name: 'Shapes',
    tools: [
      { id: TOOLS.LINE, icon: FaSlash, label: 'Line', shortcut: 'L' },
      { id: TOOLS.RECTANGLE, icon: FaSquare, label: 'Rect', shortcut: 'R' },
      { id: TOOLS.CIRCLE, icon: FaCircle, label: 'Circle', shortcut: 'C' }
    ]
  },
  {
    name: 'View',
    tools: [
      { id: TOOLS.PAN, icon: FaHandPaper, label: 'Pan', shortcut: 'H' },
      { id: TOOLS.MOVE_LAYER_CONTENT, icon: FaArrowsAlt, label: 'Move Layer', shortcut: 'M' }
    ]
  }
]

const ToolOptions = ({ currentTool, toolOptions, onToolOptionsChange }) => {
  if (![TOOLS.LINE, TOOLS.RECTANGLE, TOOLS.CIRCLE].includes(currentTool)) {
    return (
      <div className="flex items-center justify-center text-neutral-500 text-sm py-3">
        Select a shape tool to see options
      </div>
    )
  }

  return (
    <div className="border-t border-neutral-700 mt-3 pt-3">
      <div className="text-xs font-medium text-neutral-400 mb-3 px-3">Tool Options</div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-3">
          <span className="text-sm text-neutral-300">Perfect Shapes</span>
          <button
            onClick={() => onToolOptionsChange({ ...toolOptions, perfectShapes: !toolOptions.perfectShapes })}
            className={`p-2 rounded-lg hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
              toolOptions.perfectShapes ? 'bg-purple-900/40 text-white' : ''
            }`}
            title="Perfect Shapes"
          >
            <FaVectorSquare className="w-5 h-5" />
          </button>
        </div>

        {(currentTool === TOOLS.RECTANGLE || currentTool === TOOLS.CIRCLE) && (
          <div className="flex items-center justify-between px-3">
            <span className="text-sm text-neutral-300">Fill Mode</span>
            <button
              onClick={() => onToolOptionsChange({ ...toolOptions, filled: !toolOptions.filled })}
              className={`p-2 rounded-lg hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                toolOptions.filled ? 'bg-purple-900/40 text-white' : ''
              }`}
              title={toolOptions.filled ? "Outline Mode" : "Fill Mode"}
            >
              {toolOptions.filled ? <FaCompress className="w-5 h-5" /> : <FaExpand className="w-5 h-5" />}
            </button>
          </div>
        )}

        {currentTool === TOOLS.CIRCLE && (
          <div className="flex items-center justify-between px-3">
            <span className="text-sm text-neutral-300">Draw from Center</span>
            <button
              onClick={() => onToolOptionsChange({ ...toolOptions, drawFromCenter: !toolOptions.drawFromCenter })}
              className={`p-2 rounded-lg hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                toolOptions.drawFromCenter ? 'bg-purple-900/40 text-white' : ''
              }`}
              title={toolOptions.drawFromCenter ? "Draw from Corner" : "Draw from Center"}
            >
              <FaArrowsAlt className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const ToolDescription = ({ currentTool }) => {
  const getDescription = () => {
    switch (currentTool) {
      case TOOLS.LINE:
        return "Draw straight lines. Hold Shift for perfect horizontal/vertical lines."
      case TOOLS.RECTANGLE:
        return "Draw rectangles. Hold Shift for perfect squares."
      case TOOLS.CIRCLE:
        return "Draw circles. Hold Shift for perfect circles."
      case TOOLS.PENCIL:
        return "Draw pixel by pixel. Click and drag to draw continuously."
      case TOOLS.ERASER:
        return "Erase pixels. Click and drag to erase continuously."
      case TOOLS.FILL:
        return "Fill connected pixels with the same color."
      case TOOLS.EYEDROPPER:
        return "Pick colors from the canvas."
      case TOOLS.PAN:
        return "Pan the canvas view."
      case TOOLS.MOVE_LAYER_CONTENT:
        return "Move the content of the active layer."
      default:
        return "Select a tool to begin drawing."
    }
  }

  return (
    <div className="col-span-2 p-2 text-sm text-neutral-400">
      {getDescription()}
    </div>
  )
}

const Toolbar = ({ currentTool, onToolSelect, toolOptions, onToolOptionsChange }) => {
  return (
    <div className="bg-neutral-800 rounded-lg shadow-lg w-56 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-neutral-700">
        <h2 className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Tools</h2>
      </div>

      {/* Content */}
      <div className="p-3 flex-1">
        {/* Tools Grid */}
        <div className="grid grid-cols-3 gap-2">
          {TOOL_GROUPS.flatMap(group => group.tools).map(tool => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`group relative p-3 rounded-lg hover:bg-neutral-700/80 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors flex items-center justify-center ${
                currentTool === tool.id ? 'bg-purple-900/40 text-white' : ''
              }`}
            >
              <tool.icon className="w-6 h-6" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {tool.label} ({tool.shortcut})
              </div>
            </button>
          ))}
        </div>

        {/* Tool Options */}
        <ToolOptions
          currentTool={currentTool}
          toolOptions={toolOptions}
          onToolOptionsChange={onToolOptionsChange}
        />
      </div>
    </div>
  )
}

export default Toolbar