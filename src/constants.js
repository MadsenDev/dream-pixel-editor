export const TOOLS = {
  PENCIL: 'pencil',
  ERASER: 'eraser',
  FILL: 'fill',
  EYEDROPPER: 'eyedropper',
  PAN: 'pan',
  LINE: 'line',
  RECTANGLE: 'rectangle',
  RECTANGLE_FILLED: 'rectangle_filled',
  CIRCLE: 'circle',
  MOVE_LAYER_CONTENT: 'move_layer_content'
}

export const VIEW_HELPERS = {
  NONE: 'none',
  TOP_DOWN: 'top_down',
  SIDE: 'side',
  ISOMETRIC: 'isometric'
}

export const PIXEL_SIZE = 32

export const DEFAULT_SPRITE_SIZE = {
  width: 32,
  height: 32
}

export const DEFAULT_SETTINGS = {
  gridWidth: 32,
  gridHeight: 32,
  backgroundColor: '#1f2937', // neutral-800
  gridColor: '#0d9488', // cyan-600
  gridOpacity: 30,
  showGrid: true
}

export const DEFAULT_TOOL_OPTIONS = {
  filled: false,
  perfectShapes: false,
  drawFromCenter: false
}

export const DEFAULT_COLORS = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff8000', '#8000ff', '#0080ff', '#ff0080', '#80ff00', '#00ff80',
  '#000000', '#404040', '#808080', '#c0c0c0', '#ffffff'
] 