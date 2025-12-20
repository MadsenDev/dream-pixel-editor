import { useState, useCallback, useMemo } from 'react';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import { hexToRgba, rgbaToHex } from '../utils/color';

const DEFAULT_COLORS = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff8000', '#8000ff', '#0080ff', '#ff0080', '#80ff00', '#00ff80',
  '#000000', '#404040', '#808080', '#c0c0c0', '#ffffff'
];

const ColorPicker = ({ onColorSelect, leftColor, rightColor, layers, frames }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColor, setNewColor] = useState('#ff0000');

  // Convert rgba colors to hex for the color input
  const leftColorHex = useMemo(() => {
    if (!leftColor) return '#ff0000';
    // Check if it's already hex
    if (leftColor.startsWith('#')) return leftColor;
    // Convert rgba to hex
    return rgbaToHex(leftColor);
  }, [leftColor]);

  const rightColorHex = useMemo(() => {
    if (!rightColor) return '#0000ff';
    // Check if it's already hex
    if (rightColor.startsWith('#')) return rightColor;
    // Convert rgba to hex
    return rgbaToHex(rightColor);
  }, [rightColor]);

  const handleColorChange = useCallback((e, isRightClick = false) => {
    const color = e.target.value;
    const rgbaColor = hexToRgba(color);
    onColorSelect(rgbaColor, isRightClick ? 'right' : 'left');
  }, [onColorSelect]);

  // Get unique colors from all frames and all visible layers (project-wide)
  const activeColors = useMemo(() => {
    const colors = new Set();
    
    // If frames are provided, use them (project-wide colors)
    if (frames && frames.length > 0) {
      frames.forEach(frame => {
        frame.layers.forEach(layer => {
          if (!layer.visible) return;
          layer.pixels.forEach(row => {
            row.forEach(color => {
              if (color) colors.add(color);
            });
          });
        });
      });
    } 
    // Fallback to layers if frames not provided (backward compatibility)
    else if (layers && layers.length > 0) {
      layers.forEach(layer => {
        if (!layer.visible) return;
        layer.pixels.forEach(row => {
          row.forEach(color => {
            if (color) colors.add(color);
          });
        });
      });
    }
    
    return Array.from(colors);
  }, [frames, layers]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-neutral-700">
        <h2 className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Colors</h2>
      </div>

      {/* Content */}
      <div className="p-3 flex-1">
        {/* Color Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs text-neutral-400 mb-1">Primary</label>
              <div className="relative">
                <input
                  type="color"
                  value={leftColorHex}
                  onChange={(e) => handleColorChange(e, false)}
                  className="w-full h-8 rounded cursor-pointer bg-neutral-800 border border-neutral-700"
                />
                <input
                  type="text"
                  value={leftColor}
                  readOnly
                  className="mt-1 w-full text-xs px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-300"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-neutral-400 mb-1">Secondary</label>
              <div className="relative">
                <input
                  type="color"
                  value={rightColorHex}
                  onChange={(e) => handleColorChange(e, true)}
                  className="w-full h-8 rounded cursor-pointer bg-neutral-800 border border-neutral-700"
                />
                <input
                  type="text"
                  value={rightColor}
                  readOnly
                  className="mt-1 w-full text-xs px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-300"
                />
              </div>
            </div>
          </div>

          {/* Active Colors */}
          <div>
            <h3 className="text-xs font-medium text-neutral-400 mb-2">Colors in Use</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {activeColors.map((color, index) => {
                // Convert rgba to hex for the color input
                const colorHex = color.startsWith('#') ? color : rgbaToHex(color);
                return (
                  <div
                    key={index}
                    className="group relative aspect-square rounded cursor-pointer overflow-hidden border border-neutral-700 hover:border-purple-500 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      // Left click sets primary color
                      e.preventDefault();
                      handleColorChange({ target: { value: colorHex } }, false);
                    }}
                    onContextMenu={(e) => {
                      // Right click sets secondary color
                      e.preventDefault();
                      handleColorChange({ target: { value: colorHex } }, true);
                    }}
                  >
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="p-1 text-white">
                        <FaPlus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker; 