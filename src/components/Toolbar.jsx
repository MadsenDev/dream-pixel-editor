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
      { id: TOOLS.PAN, icon: FaHandPaper, label: 'Pan', shortcut: 'H' }
    ]
  }
]

const Toolbar = ({ currentTool, onToolSelect }) => {
  return (
    <nav className="flex flex-col gap-4 py-4 px-2 bg-neutral-900 rounded-xl shadow-2xl border border-neutral-800 items-center w-16 min-h-0" aria-label="Toolbar">
      {TOOL_GROUPS.map(group => (
        <div key={group.name} className="flex flex-col gap-2 items-center">
          {group.tools.map(({ id, icon: Icon, label, shortcut }) => {
            const isActive = currentTool === id
            return (
              <button
                key={id}
                className={`group relative flex items-center justify-center w-10 h-10 rounded-lg transition-all focus:outline-none ${
                  isActive ? 'bg-neutral-800 text-cyan-400' : 'bg-neutral-900 text-gray-400 hover:bg-neutral-800 hover:text-cyan-300'
                }`}
                onClick={() => onToolSelect(id)}
                aria-label={`${label} (${shortcut})`}
                aria-pressed={isActive}
                tabIndex={0}
              >
                <Icon className="w-6 h-6" />
                {/* Glowing dot indicator for active tool */}
                {isActive && (
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-cyan-400/50 shadow-md animate-pulse" />
                )}
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 text-xs text-white bg-neutral-800 shadow-xl rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 whitespace-nowrap z-10 border border-neutral-700">
                  <span className="font-bold">{label}</span>
                  <span className="ml-2 text-cyan-300 font-mono">[{shortcut}]</span>
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export default Toolbar 