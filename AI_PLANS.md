## 0. High-level goal

We have a pixel art editor (originally web, now being moved into Electron) with:

* `Canvas.jsx` – presentational canvas component
* `useCanvas.js` – renderer (draws layers, grid, onion skin, previews, helpers)
* `useDrawing.js` – input → pixel mutations (tools, painting, line/rect/circle, etc.)

We want to evolve it into a **Flip-Fix + AI-ready sprite editor**:

1. The app should understand **three variants** of the same sprite:

   * `original` – typically right-facing, hand-drawn
   * `flippedRaw` – naive horizontal flip of `original`
   * `flippedFixed` – corrected left-facing version (hand-edited or AI-created)

2. Add a **Flip-Fix Lab** UI where we can:

   * Generate the raw flipped version
   * Initialize the fixed version from the raw flip
   * Edit the fixed version
   * Export `flippedRaw → flippedFixed` pairs as JSON for ML training
   * (Later) run an ONNX model to auto-fill `flippedFixed` from `flippedRaw`

3. Keep `useCanvas` as the pure renderer. We **don’t** want AI logic inside it.

You should refactor / extend the app so it supports this cleanly.

---

## 1. Understand current architecture

1. Inspect:

   * `Canvas.jsx`
   * `useCanvas.js`
   * `useDrawing.js`
   * Any state/store files (e.g. React context, Zustand, Redux, etc.)

2. Confirm:

   * How layers are represented (likely an array of `{ pixelData: number[][], color, visible, ... }`).
   * How sprite size is represented (`spriteSize` or similar).
   * How tools and previews are passed into `useCanvas` (lineStart, rectPreview, etc.).
   * Where “global” sprite state lives (top-level component / context).

Don’t change behavior yet; just map out **where the canonical sprite data lives**.

---

## 2. Introduce sprite variants in the data model

We want a single “sprite” to have three variants: `original`, `flippedRaw`, `flippedFixed`.

### 2.1 Types / interfaces (pseudo-TS even if code is JS)

Define these shapes somewhere appropriate (e.g. a `types` file or near the sprite state):

```ts
type SpriteVariant = 'original' | 'flippedRaw' | 'flippedFixed';

type SpriteGridLayers = {
  width: number;
  height: number;
  layers: Layer[]; // whatever Layer type you already have
};

type SpriteState = {
  original: SpriteGridLayers;
  flippedRaw: SpriteGridLayers | null;
  flippedFixed: SpriteGridLayers | null;
};
```

* `original` is always present.
* `flippedRaw` and `flippedFixed` can start as `null` until generated.

### 2.2 App-level state

Wherever the current sprite is stored, change it to store a `SpriteState` instead of just one set of layers.

Also add:

```ts
const [activeVariant, setActiveVariant] = useState<SpriteVariant>('original');
```

This tells the editor which variant we’re currently editing/viewing (especially outside the Flip-Fix lab).

---

## 3. Wiring `useCanvas` to support variants

**Important:** `useCanvas` should NOT be modified to know about variants.
Instead, we pass it the **layers for whichever variant is active**.

Wherever `useCanvas` is currently called, change:

```js
useCanvas(
  canvasRef,
  spriteSize,
  layers,
  zoom,
  pan,
  lineStart,
  linePreview,
  rectStart,
  rectPreview,
  circleStart,
  circlePreview,
  toolOptions,
  settings,
  viewHelper,
  showOnionSkin,
  previousLayers,
  movePreview,
  shouldRedraw
);
```

so that:

* `spriteSize` and `layers` come from `spriteState[activeVariant]`.
* In Flip-Fix mode, `previousLayers` can be switched intelligently (e.g. onion skin from original or raw flip).

Example:

```js
const currentVariantState = spriteState[activeVariant];

useCanvas(
  canvasRef,
  currentVariantState.size,
  currentVariantState.layers,
  zoom,
  pan,
  lineStart,
  linePreview,
  rectStart,
  rectPreview,
  circleStart,
  circlePreview,
  toolOptions,
  settings,
  viewHelper,
  showOnionSkin,
  previousLayersForCurrentVariant,
  movePreview,
  shouldRedraw
);
```

For normal editing mode, `previousLayersForCurrentVariant` can be whatever it was before (or empty).
In Flip-Fix mode, we’ll wire that differently (see below).

---

## 4. Make `useDrawing` variant-aware

`useDrawing` is currently responsible for:

* Converting mouse events into pixel changes.
* Calling primitives like `paintPixel`, `floodFill`, `drawLine`, etc.
* Mutating the sprite’s data via some setter (likely `setLayers` or similar).

We need it to edit **only the currently active variant’s layers**.

### 4.1 Pass variant + sprite state setters

Update `useDrawing` so it receives:

* `activeVariant`
* `spriteState`
* `setSpriteState`

Instead of directly mutating a single `layers` state, it should:

1. Look at `spriteState[activeVariant]`.
2. Apply changes to those layers.
3. Return a new `spriteState` with only that variant updated.

Example (conceptual):

```js
const applyPixelChange = (x, y, colorIndex) => {
  setSpriteState(prev => {
    const next = { ...prev };
    const variant = activeVariant; // or store in ref
    const variantState = next[variant];

    // clone layers or pixelData as needed for immutability
    const layers = cloneLayers(variantState.layers);
    // modify layers[y][x] or similar
    // ...

    next[variant] = { ...variantState, layers };
    return next;
  });
};
```

Important: `original` and `flippedRaw` should be **read-only** in Flip-Fix mode (we’ll enforce that at the UI level and optionally inside `useDrawing`).

---

## 5. Implement flip/fix helpers at data level

Add pure functions that operate on `SpriteGridLayers`:

### 5.1 Horizontal flip

```ts
function flipSpriteHorizontally(sprite: SpriteGridLayers): SpriteGridLayers {
  const { width, height, layers } = sprite;

  // Deep clone layers and mirror pixelData horizontally
  // For each layer, for each y, swap x <-> width - 1 - x
}
```

### 5.2 Clone sprite variant

```ts
function cloneSprite(sprite: SpriteGridLayers): SpriteGridLayers {
  // Deep copy width, height, layers, pixelData, etc.
}
```

These should NOT touch canvas or DOM — just arrays.

---

## 6. Add Flip-Fix Lab UI

Create a new component, e.g. `FlipFixLab.jsx`, that coordinates:

* `spriteState`
* `setSpriteState`
* `activeVariant` and `setActiveVariant`
* For now, base it on your existing `Canvas` component and hooks.

### 6.1 Options: one canvas vs three canvases

**Option A – One canvas + variant selector**

* Show one big canvas (the same as usual).

* Add a select or buttons:

  * “Original”
  * “Flipped (raw)”
  * “Flipped (fixed)”

* `activeVariant` is controlled by these buttons.

* Only `flippedFixed` is editable in Flip-Fix mode.

**Option B – Three canvases side-by-side (nice for training)**

* Render three instances of `Canvas` (or a thin wrapper):

  * Canvas 1: `variant="original"`, read-only
  * Canvas 2: `variant="flippedRaw"`, read-only
  * Canvas 3: `variant="flippedFixed"`, editable

* For each, call `useCanvas` with the respective variant’s `layers`.

* Only wire `useDrawing` events to the `flippedFixed` canvas.

Either is fine; pick the one that fits better with current layout.

### 6.2 Buttons in Flip-Fix Lab

Add these buttons (and implement wiring):

1. **Generate Raw Flip**

   * Uses `flipSpriteHorizontally(spriteState.original)` and writes into `spriteState.flippedRaw`.

2. **Copy Raw → Fixed**

   * Sets `spriteState.flippedFixed = cloneSprite(spriteState.flippedRaw)`.

3. **Save Training Pair**

   * Uses serialization helpers (see next section) to export:

     * Input: `flippedRaw`
     * Target: `flippedFixed`
   * Writes to a JSON file or prints to console depending on environment.
   * Include metadata like `width`, `height`, `palette` if available.

4. **(Later) Run AI Flip-Fix**

   * Placeholder: calls a function `runFlipFixModel(inputGrid)` and puts result into `flippedFixed`.
   * For now just stub this out (do nothing or log).

Also add a simple toggle that switches onion skin:

* Example: when editing `flippedFixed`, set `previousLayers` to `flippedRaw.layers` so you can see what you’re fixing.

---

## 7. Implement sprite ↔ grid serialization helpers

We need to be able to:

* Serialize current sprite into a `height × width` grid of palette indices.
* Reconstruct a sprite from such a grid (later when the AI outputs something).

### 7.1 `spriteToGrid`

Add a helper:

```ts
function spriteToGrid(sprite: SpriteGridLayers): number[][] {
  const { width, height, layers } = sprite;

  // Strategy:
  // - If you have a notion of "flattened sprite", flatten layers into a single buffer of palette indices.
  // - If you currently store literal color values, you may need a palette map.
  // - For now you can start with just topmost visible layer as the grid.
}
```

For v1, a simple approach is fine:

* Assume a single main layer, or
* Use a flattening rule that matches how `useCanvas` draws things (top layer wins).

### 7.2 `gridToSprite`

For future AI integration, also create:

```ts
function gridToSprite(grid: number[][], existingSprite: SpriteGridLayers): SpriteGridLayers {
  // Create a new SpriteGridLayers:
  // - width/height from grid
  // - one layer or update existing layer's pixelData with these indices
}
```

For now you can use this purely for testing / stubbing.

---

## 8. Training pair export format

When “Save Training Pair” is clicked, we want to export something like:

```json
{
  "id": "some-unique-id",
  "width": 16,
  "height": 16,
  "numClasses": 8,
  "palette": ["#00000000", "#1a1a1a", "..."],

  "input": [
    [0,0,1,1,...],
    ...
  ],
  "target": [
    [0,0,1,2,...],
    ...
  ]
}
```

Where:

* `input` is `spriteToGrid(flippedRaw)`.
* `target` is `spriteToGrid(flippedFixed)`.

Implementation details:

* In Electron you can use the `fs` module to write to a `training-data` folder.
* In pure web mode you can:

  * Trigger a JSON download, or
  * `console.log` for now.

Cursor should implement a minimal, working version that **writes to disk in Electron** if possible.

---

## 9. Prepare for ONNX/AI integration (stubs only for now)

We’re not training the model here, but we want the app to be ready.

Add a small abstraction layer, e.g. `flipFixModel.ts`:

```ts
export async function runFlipFixModel(inputGrid: number[][]): Promise<number[][]> {
  // TODO: implement ONNX Runtime call
  // For now: return inputGrid unchanged or throw "not implemented".
  return inputGrid;
}
```

In the Flip-Fix Lab:

* Wire **Run AI Flip-Fix** button to:

  1. Get `inputGrid = spriteToGrid(flippedRaw)`.
  2. Call `runFlipFixModel(inputGrid)`.
  3. Convert result `outputGrid` into `spriteState.flippedFixed` using `gridToSprite`.

For now this will do nothing special, but the wiring will be correct for later.

---

## 10. Keep existing behavior working

While making these changes, ensure:

* Default editing mode still behaves as before:

  * You can draw in the main sprite, zoom, pan, use tools, etc.
* Any new Flip-Fix-specific UI is either:

  * Behind a toggle / mode switch (`Mode: Standard / Flip-Fix Lab`), or
  * In a separate screen/route.

---

## 11. Summary of tasks for Cursor

1. Map out current sprite state and how `Canvas`, `useCanvas`, and `useDrawing` interconnect.
2. Introduce `SpriteState` with `original`, `flippedRaw`, `flippedFixed`.
3. Add `activeVariant` state and make `useCanvas` draw the selected variant’s `layers`.
4. Make `useDrawing` operate on `spriteState[activeVariant]` instead of a single global `layers`.
5. Implement `flipSpriteHorizontally` and `cloneSprite`.
6. Create `FlipFixLab.jsx` (or similar) with:

   * Variant selection (or three canvases)
   * Buttons:

     * Generate raw flip
     * Copy raw → fixed
     * Save training pair
     * Run AI Flip-Fix (stub)
7. Implement `spriteToGrid` (and a basic `gridToSprite`) for serialization.
8. Implement training pair export as JSON (Electron: write to disk; Web: download).
9. Add `runFlipFixModel(inputGrid)` stub for future ONNX integration.
10. Ensure existing editor behavior still works as before when not in Flip-Fix mode.

You can assume the user will handle the actual ML training and ONNX model creation later; just make the editor ready to generate training data and consume a model when it exists.