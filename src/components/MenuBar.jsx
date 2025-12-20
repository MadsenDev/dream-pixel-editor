import { useState } from 'react'
import { FaFile, FaEdit, FaLayerGroup, FaEye, FaTools, FaQuestionCircle } from 'react-icons/fa'

const MenuBar = ({ 
  onImport, 
  onExport, 
  onSettings,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  editMode,
  onEditModeChange
}) => {
  const [activeMenu, setActiveMenu] = useState(null)

  const menuItems = [
    {
      label: 'File',
      icon: FaFile,
      items: [
        { label: 'Import PNG...', shortcut: 'Ctrl+I', action: onImport },
        { label: 'Export...', shortcut: 'Ctrl+E', action: onExport },
        { type: 'separator' },
        { label: 'Settings...', shortcut: 'Ctrl+,', action: onSettings },
        { type: 'separator' },
        { label: 'Exit', shortcut: 'Alt+F4', action: () => window.electron?.closeWindow?.() },
      ]
    },
    {
      label: 'Edit',
      icon: FaEdit,
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: onUndo, disabled: !canUndo },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: onRedo, disabled: !canRedo },
      ]
    },
    {
      label: 'View',
      icon: FaEye,
      items: [
        { 
          label: 'Standard Editor', 
          action: () => onEditModeChange('standard'),
          checked: editMode === 'standard'
        },
        { 
          label: 'Flip-Fix Lab', 
          action: () => onEditModeChange('flipFix'),
          checked: editMode === 'flipFix'
        },
      ]
    },
    {
      label: 'Help',
      icon: FaQuestionCircle,
      items: [
        { label: 'About Dream Pixel Editor', action: () => {} },
      ]
    },
  ]

  const handleMenuClick = (menuLabel) => {
    setActiveMenu(activeMenu === menuLabel ? null : menuLabel)
  }

  const handleItemClick = (item) => {
    if (item.action && !item.disabled) {
      item.action()
      setActiveMenu(null)
    }
  }

  const handleClickOutside = () => {
    setActiveMenu(null)
  }

  return (
    <>
      <div className="h-6 bg-neutral-800 border-b border-neutral-700 flex items-center px-2 text-xs select-none">
        {menuItems.map((menu) => {
          const Icon = menu.icon
          return (
            <div key={menu.label} className="relative">
              <button
                onClick={() => handleMenuClick(menu.label)}
                className={`px-3 py-1 rounded hover:bg-neutral-700 flex items-center gap-1 ${
                  activeMenu === menu.label ? 'bg-neutral-700' : ''
                }`}
              >
                <Icon className="w-3 h-3 text-neutral-400" />
                <span className="text-neutral-300">{menu.label}</span>
              </button>
              
              {activeMenu === menu.label && (
                <div className="absolute top-full left-0 mt-1 bg-neutral-800 border border-neutral-700 rounded shadow-lg z-50 min-w-[200px]">
                  {menu.items.map((item, index) => {
                    if (item.type === 'separator') {
                      return <div key={index} className="h-px bg-neutral-700 my-1" />
                    }
                    return (
                      <button
                        key={index}
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        className={`w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700 flex items-center justify-between ${
                          item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                        } ${item.checked ? 'bg-neutral-700' : ''}`}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-neutral-500 ml-4">{item.shortcut}</span>
                        )}
                        {item.checked && (
                          <span className="ml-2">✓</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {activeMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleClickOutside}
          style={{ top: '56px' }} // TitleBar (32px) + MenuBar (24px)
        />
      )}
    </>
  )
}

export default MenuBar

