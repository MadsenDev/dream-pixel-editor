import { FaPencilAlt, FaHandPaper, FaEraser, FaFillDrip, FaEyeDropper, FaSlash, FaSquare, FaCircle } from 'react-icons/fa'

const TOOLS = {
  PENCIL: 'pencil',
  PAN: 'pan',
  ERASER: 'eraser',
  FILL: 'fill',
  EYEDROPPER: 'eyedropper',
  LINE: 'line',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle'
}

const TOOL_GROUPS = [
  {
    name: 'Basic',
    tools: [
      { id: TOOLS.PENCIL, icon: FaPencilAlt, label: 'Pencil' },
      { id: TOOLS.ERASER, icon: FaEraser, label: 'Eraser' },
      { id: TOOLS.FILL, icon: FaFillDrip, label: 'Fill Bucket' },
      { id: TOOLS.EYEDROPPER, icon: FaEyeDropper, label: 'Color Picker' }
    ]
  },
  {
    name: 'Shapes',
    tools: [
      { id: TOOLS.LINE, icon: FaSlash, label: 'Line' },
      { id: TOOLS.RECTANGLE, icon: FaSquare, label: 'Rectangle' },
      { id: TOOLS.CIRCLE, icon: FaCircle, label: 'Circle' }
    ]
  },
  {
    name: 'View',
    tools: [
      { id: TOOLS.PAN, icon: FaHandPaper, label: 'Pan' }
    ]
  }
]

const Toolbar = ({ currentTool, onToolSelect }) => {
  return (
    <div className="flex flex-col gap-4 p-2 bg-neutral-800 rounded-lg shadow-lg">
      {TOOL_GROUPS.map(group => (
        <div key={group.name} className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-neutral-400 px-2">{group.name}</h3>
          <div className="flex flex-col gap-2">
            {group.tools.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                className={`p-2 rounded transition-all relative group flex items-center justify-center ${
                  currentTool === id
                    ? 'bg-neutral-700 ring-2 ring-cyan-400 text-cyan-300'
                    : 'bg-neutral-900 hover:bg-neutral-700 text-gray-300'
                }`}
                onClick={() => onToolSelect(id)}
                type="button"
              >
                <Icon className="w-6 h-6" />
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs text-gray-100 bg-neutral-900 shadow-lg rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-neutral-700">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Toolbar 