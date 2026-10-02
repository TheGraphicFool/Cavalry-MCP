# Cavalry UI Reference: Menus, Tools and Windows

This file condenses Cavalry's official User Interface documentation, which the user pasted in two parts. **Part 1** covers the menus, tools, Assets, Projects, Smart Folders and Referencing. **Part 2** (from "Default workspace layout" onward) covers the Attribute Editor, Control Rows, Expressions, Gradient and Graph widgets, Color and Palettes, Control Centre, Dependency Graph, JavaScript Editor and Console, Mesh Explorer, Preferences (including the **MCP Server**), Lottie Export, Dynamic Rendering, Render Tokens, the Scene Window, Time Editor, Graph Editor, Keyframe Layers, Time Markers, Shelf, Tags, Tool Settings, Viewport, Motion Paths, Command Search, Workspaces, the Scripts and Help menus, Color Management and Presets.

Notes marked **→ MCP** are the author's own remarks on what each item means for automating Cavalry. They are not part of the official docs.

---

## File format and files

| Extension | What it is |
|---|---|
| `.cv` | The native Scene format. By default it is **compact JSON**; the format options are in Preferences. It can also be imported as a **Reference**. |
| `.cvc` | A clipboard or partial scene. **Export Selected…** writes the selected layers and their connected layers to it. Importing a `.cvc` adds its contents to the current Composition. |
| `projectDescription.json` | The Project description: relative paths for assets, autosave, palettes, renders and scenes. |
| `path-to-project` | A small text file saved next to each `.cv` that holds the relative path to the project, e.g. `..`. It is **required by Cavalry Player** for scenes that use assets, and it is useful for the **CLI**. |
| `.pal` | A colour palette. Files in `/Assets/Palettes` show up as Library Palettes. |

**→ MCP:** because `.cv` is JSON, a tool can read and diff scenes offline. Check the Preferences save options first, since compact JSON may be minified.

---

## File menu
- **New Scene, Open…, Open Recent** (last 5), **Restore Autosave** (needs the Autosave preference), **Save, Save As…**
- **Increment and Save** saves a new file in the same folder with the counter raised by one and opens it. A "counter" is a delimiter (space, `.`, `_` or `-`) followed by a number: `file-001.cv → file-002.cv`, `myfile.7.cv → myfile.8.cv`, `my file1 5.cv → my file1 6.cv`. With no counter, it opens Save As and suggests `file 2.cv`. It warns before overwriting.
- **Import:** Assets…, Reference… (`.cv`), Scene… (`.cv` or `.cvc`), Google Sheet…, Image Smart Folder…, Audio Smart Folder…
- **Export:** Selected… (`.cvc`), Lottie… (`.json`; on a Starter licence this is a demo mode that exports only the first selected layer, for evaluation), and **Export as Project…**
  - Mode: All Compositions or Selected Compositions.
  - Include Fonts (⚠ check font licences) and Include Palettes.
- **Projects:** Project Settings, Set Project (last 5), Show Project Folder.
- **Render:** Render Manager, **Render Current Frame…** (PNG), **Render Current Frame to SVG…**
- **Reduce Scene** removes unused Compositions and Assets.

## Edit menu
- Undo/Redo, Cut, Copy, **Copy as SVG** (puts the selected shapes on the clipboard as SVG code), Paste, Delete.
- **Group**, **Group and Flatten**, **Un-Group**, **Add to Group**.
- **Connect to Frame Range** creates relative Time Markers at the Composition's start and end and connects them to the clip ends, so the shape stays visible when the frame range changes.
- Show/Hide Selected, Show/Hide Channels.
- **Duplicate** keeps input connections. **Duplicate (Options)…** offers *All Inputs* (also copies the layers connected as inputs) or *Keep Connections*. **Duplicate and Split** splits the clip at the current frame.
- **Arrange:** Bring to Front, Bring Forward, Send Backward, Send to Back (these work within the layer's own level of the Scene Tree).
- **Selection:** Select All, Invert, Clear, Select by Label Color, Select by Type, Select by Tag.
- Show in Attribute Editor, Show in Scene Window, Preferences… (under the Cavalry menu on macOS), and Emoji Symbols (macOS; only vector emoji work).

## View menu
- Rulers, Guides, and Ruler Options (origin at the centre or bottom-left; pixels or percent).
- 2D Grid, Pixel Grid, Composition Boundary, Layer Names on Hover, Viewport Tool Help, and **Layer Tools** (purple in-viewport handles; not available when a shape is the parent of another shape).
- **Viewport Quality** affects the viewport only. Final quality is set by **Render Quality** in the Render Manager. The setting **goes back to High** in each new session or scene.
  - Highest (macOS, MSAA), High, Low (no anti-aliasing or image filtering), Lowest (also no Filters or Shaders).
- Draw Outside Composition Boundary, Draw Debug Information, Snapping.
- **Snapshots:** Show (Option/Alt + number), Save, Remove, Clear All.
- Zoom In/Out, Zoom, Full Screen.

## Composition menu
- **New Composition**, **New Composition from Preset**, **Composition Settings…** (resolution, start/end frame, FPS, motion blur).
- **Pre-Compose** makes a new comp from the selection, with the parent's resolution, frame range and FPS. **Pre-Compose based on Selection Bounds** sizes the new comp to the selection's bounding box and keeps everything in place.
- Close Composition (needs more than one open), Close Other Compositions.
- **Playback range:** Set Composition to Playback Range; Set Playback Range to Selection (or to the Composition if nothing is selected); Set Playback Start/End to Current Frame.
- **Navigation:** Go to Playback Start/End, Go to Composition Start/End, Previous/Next Time Marker, Move Forward/Backward (1 frame), Jump Forward/Backward (by the Nudge Step preference).
- **Solo Selection in Viewport** adds the selection to the Quicklist and filters the viewport. **Clear Viewport Soloing** and **Clear Quicklist** undo that.
- **Enable Time Remapping** (with a comp selected) adds keyframes at 0% and 100% on the first and last frames. Move the last key closer to the first to speed it up.
  - **To loop a pre-comp:** Enable Time Remapping → select the curve → right-click → **Loop After > Looping** → extend the pre-comp's clip.
- **Toggle Background Alpha** switches the background alpha between 0 and 255.

## Create menu
- **Quick Add…** (the Add Layers window), and **Create Editable Primitives** (newly drawn primitives become editable geometry).
- Primitives, Background, Shapes, Behaviours, Effects, Utilities, **Layout** (adds the selection to a Layout).
- **Text Animation Presets** (select a Text Shape first).
- **Demo Scenes** (hold Cmd/Ctrl to start playback automatically).

## Animation menu
- **Set Transform Keyframes:** Position, Rotation, Scale, or All, on all selected layers at the current frame.
- **Magic Easing** on the selected keys.
- **Constraints:** Transform Constraint, plus Transform Constraint Tools (Pick Up and Drop, which set the needed keys automatically); Point and Edge Constraint (a Component Constraint); Composition Constraint.
- **Add Null**, **Create Rubber Hose Limb** and **Attach Rubber Hose Limb**, **Add Animation Control**, **Add Rig Control (Joystick)**, **Add Look At**, **Add Time Marker**.
- **Animate Along Path:** select a shape, then a path.
  - *Move along Path* creates a **Pathfinder** connected to the shape's position and rotation.
  - *Deform along Path* creates a Pathfinder connected as a **Deformer**.
- Nudge Backward/Forward, Go to Next/Previous Keyframe (can be filtered by selection).
- **Clip editing:** Move Layer Start/End to Current Frame (moves the whole clip), Set Layer In/Out Point to Current Frame (crops the clip).
- **Bake Animation** samples a curve and redraws it using the Bake Animation preferences. It also **turns procedural animation (Behaviours, Magic Easing) into keyframes**.
- Reverse Animation, Delete Animation (on an attribute, or on a whole layer), and **Align Keyframes** (Left, Centre, Right).

## Shape menu
- **Make Editable** (Cmd/Ctrl+E), Make Editable Copy, **Bake Selected Shape** (a copy with deformation baked in).
- Separate, Separate to Editable (closed paths become separate shapes); Merge, Merge to Editable (combine shapes; *not* a boolean).
- **Pivot and transforms:** Centre Pivot (bounding box), Centre Pivot (Centroid; the centre of mass, which is useful for the optical centre), **Freeze Transform**, **Reset Transform**.
- **Add Background to Selected** creates a Bounding Box and Rectangle for each selected shape.
- **Swap Fill/Stroke** (not for Shaders).
- **Contours and points:** Close/Open Contour, Join Contours, Split Path at Selection (at most 2 points), Reverse Contour(s), Set First Point (point index 0), Join/Break Bézier Handle, Convert to Corner/Bézier Point, Delete Selected Points, Delete Selected Points and Split Path.
- **Booleans** (Union, Subtract, Intersection, Exclude) create a **new Editable Shape**. The first selected shape is the one changed by the others.

## Tool menu
**General:** each tool has settings in the **Tool Settings** window. Tools draw either Primitives (parametric: radius, size…) or Editable Shapes (points). Shift constrains proportions, Option/Alt draws from the centre, and a single click creates a default shape. Option/Alt-clicking a toolbar icon creates a default shape too.

| Tool | Key points |
|---|---|
| **Select** | Click, marquee, or Cmd/Ctrl+click to add. Drag to move. Rotate from just outside the corners, with Shift to snap. Scale from the corners, with Shift to keep both axes. |
| **Pivot** | Drag the pivot, or click one of 9 grid points. Option/Alt moves the shape and keeps the pivot. Keys **1–9** snap the pivot (1 = bottom-left, 9 = top-right). Shift snaps to an axis, Cmd/Ctrl turns snapping off. |
| **Edit Shape** | Select points (click, marquee, Option/Alt lasso, double-click for a contour, Shift+double-click for the whole shape). Arrow keys move 1px, Shift+arrow 5px; add Option/Alt for world space instead of local. Option/Alt+click switches corner/Bézier; Option/Alt+drag on a point pulls out handles; Option/Alt+drag on a handle locks or unlocks it. **X+click** deletes a handle. Option/Alt+Delete removes a point and both edges. **H** shows the transform tool. **S+click** splits the path (Bézier), **S+double-click** splits it (corner). Drag one end onto the other to close a path. |
| **Pen** | Click for a corner, drag for a Bézier. **S, Esc or Return** commits. **G** commits a contour and starts the next. Cmd/Ctrl+/ clears. Shift snaps to an axis. Option/Alt draws a straight segment after a Bézier point. |
| **Pencil** | Freehand drawing. Hold Cmd/Ctrl to add a contour to the selected path. |
| **Stroke Width** | Drag the dots on a **tapered stroke**: away from the path for width, along it for position. Shift snaps to other widths. Settings: Limit Stroke Width, Lock Point Order, Snap to Points, Reset Profile. You can also edit the Width Profile graph on the Stroke tab. |
| **Camera** | **Look At Camera only.** Option/Alt+drag tracks in X/Y, Shift+drag up/down dollies in Z, Cmd/Ctrl+drag orbits. Option/Alt+click the tool creates a camera. |
| **Line** | Drag to make an Editable Shape. Option/Alt+click the toolbar icon makes a **Basic Line**. |
| **Mesh** | For the **Mesh Shape** only. Option/Alt+click adds vertices. Each vertex has a **Bind** position (Option/Alt+drag) and an **Offset** position (drag). Shift+drag sets the edge or triangle direction. S+drag sets the soft-selection size. Right-click a vertex for *Control with Null(s)*, *Set Keyframe* or *Delete Vertex*. Quick start: right-click an image asset → **Add to Composition as Mesh**. |
| **Text** | Click to make an auto-sized text box, or drag to make a fixed, wrapping box. Size is controlled by the *Auto* checkboxes on Text Box Size. There is a transform widget (top-left) and a font-size widget (bottom-right). |
| **Primitives** | Rectangle, Ellipse, Polygon, Star, Arc, Super Ellipse, Cogwheel, Arrow, Capsule. |
| **Tracking** | Planar tracking, forwards or backwards. Workflow: footage → Footage Shape → *Tool > Tracking* → place 4 corner markers → **Track** → select the overlay shape → **Apply** (creates a **Corner Pin** whose Nulls are driven by the track). Presets: Balanced (default), Edge Snap, Robust (for poor footage). Works best on planes with markers and few obstructions. |

## Dynamics menu (Forge Dynamics)
- **Make Dynamic** creates a **Forge Dynamics Shape** (the solver) and connects the selected shapes to it.
- **Active Forge Solver**, **Add Field**, **Add Collision Event**, **Cache Solver** (writes a cache file).

## Window menu
- **Workspaces:** select, Save Workspace…, Reset to Default; **Focus Mode** (Viewport and Toolbar only); **Add Viewport**.
- **Windows:** Add Layers, Align, Animation Utilities, Assets, Attribute Editor, Audio Monitor, Color, Control Centre, **Dependency Graph (also called the Flow Graph)**, Glyph Browser, Graph Editor, **JavaScript Console**, **JavaScript Editor**, **Mesh Explorer**, Message Bar, **Scene Statistics**, Scene Window (Time Editor), **Shelf**, Tag Window, Tool Settings, Toolbar, **Upload Preset Manager**, **Shortcut Manager**, **Command Search** (all commands, or Quick Actions only).

## Help / About
- About (Cavalry > About on macOS, Help > About on Windows) shows the version, the signed-in email and the licence type. Help > Sign Out… switches accounts.

## Add Layers window
- Add a layer by double-clicking it, dragging it into the Scene Window, or using ↑/↓ and Return. There is a search bar and type tabs (Cmd/Ctrl+←/→ switches tabs).
- **Cmd/Ctrl + .** opens the Add Layers popover. The `+` button in the Scene Window does the same.

## Align Window
- It changes with the active tool. With **Select** it aligns shapes; with **Edit Shape** it aligns points (Shift also aligns the handles).
- Align Left, Centre, Right, Top, Middle, Bottom. Option/Alt aligns to the **Composition**. With one shape selected it always aligns to the Composition.
- Distribute Horizontally, Vertically or Evenly. This works for **shapes only**, needs **three or more**, and spaces them between the first and last selected. With only two selected it distributes against the Composition.

## Animation Utilities window
- Bake Animation (accuracy Low, Medium or High; higher means more keys), Snap Selected to Current Frame, Reverse Animation, Reset Transform Attributes, **Crop Animation to Selected Keys**, Delete Animation for Element, **Nudge Value** (±), **Nudge Frame** (±).

---

## Assets Window

### Ways to import
- File > Import Asset…, double-click in the window, drag from the file system, or right-click and choose Import Assets / Reference / Scene / **Canva Sheet** / Google Sheet / Image Smart Folder / Audio Smart Folder.
- Dropping an image or video into the **Viewport** also adds it to Assets and creates a connected **Footage Shape**.

### Supported file types
| Kind | Formats |
|---|---|
| Audio | .aac, .aif/.aiff, .caf, .mp3, .wav |
| Font | .otc, .otf, .ttf |
| Image / sequence | **.af (Affinity)**, .bmp, .exr (single channel only), .ico, .jpg, .png, .psd (**flattened only**), .webp |
| Movie | .apng (rename the `.png` to `.apng`), .gif, .mov, .mp4, .webm |
| Scene | .cv (imported as a Reference) |
| Spreadsheet | .csv, .xlsx, Google Sheets, Canva Sheets |
| Vector | .svg |
| Text | .txt, .json |

- **Video codecs:** VP8, VP9, AV1, H.263, H.264, H.265/HEVC, MPEG-4, ProRes (422, 422 HQ, LT, Proxy, 4444, 4444 XQ), Motion JPEG, Uncompressed 422.
- **Largest image size:** 15360 × 8640 px.
- **Video with audio:** the audio is imported as a child asset. Adding the video to a comp builds **Footage Shape → Image Shader + Sound Behaviour**, so the audio can be offset on its own.

### Using the window
- Header: search box, and **Sort Order** (None = manual drag order, which is saved; Name; Type). With Name or Type sorting you can still group items with Cmd/Ctrl+G.
- Rows show an icon, a name and tags. Label colours come from the Label Palette. Rename with **Return**, type the name, then Return again. Hovering a row previews images, the first frame of videos, CSV and Sheets, text and JSON, and SVG.
- Footer: Project Settings; new folder (Cmd/Ctrl+G groups the selected items); **new Composition** (right-click to use a Preset; **drag an image onto it** for a comp at that resolution; **drag a comp or video onto it** to copy its resolution, FPS and frame range); remove the selected items.

### Image sequences
- File names follow `<string><numbers>.<ext>`: `name_001.png`, `name.1.png`, `name-001.png`, `name01.png`, `name (1).png`.
- Sequences are detected automatically. Choose the **Any Still** filter in the file browser to import a single frame instead.
- Adding a sequence to a comp creates an Image Shader connected to a Footage Shape.
- 💡 **Image sequences load faster than video**, so use them to speed up heavy scenes.

### Project Settings
- A **Project** makes paths relative (`@project/...`), sets default folders for file dialogs, pre-fills the Render Manager path with `@project/Renders`, and keeps links working when a scene is shared.
- **Creating one:** File > Project Settings (or the folder icon in Assets) → **Create…** → pick a root folder → give it a name. This creates `Assets/` (and `Assets/Palettes`), `Renders/`, `Scenes/`, `Autosave/` and `projectDescription.json`:
  ```json
  { "description": {
      "assets": "@project/Assets", "autoSave": "@project/Autosave",
      "name": "Cavalry", "palettes": "@project/Assets/Palettes",
      "renders": "@project/Renders", "scenes": "@project/Scenes" } }
  ```
- ⚠ **Renaming a folder path in Project Settings renames the real folder on disk.** Renaming the *project* does not rename its folder.
- Switching: use the dropdown at the bottom-left of Assets (recent projects, **Load…** a folder that contains `projectDescription.json`, **Clear Settings**). **Opening a scene switches to its project**, found through `path-to-project`.
- **With no project set, all paths are absolute.**
- `path-to-project` is usually just `..`. You can edit it by hand for custom pipelines, e.g. `../../MyFolder`. Edit `projectDescription.json` by hand only while Cavalry is not using it.
- **Colour management:** Enable Colour Management, choose a **Working Color Space**, and set **Compositing Bit Depth** (8-bit or 16-bit; 16-bit gives smoother gradients). Assets and renders are colour managed **except GIF, SVG and Lottie, which are always sRGB**. Renders take the scene's working space.

### Smart Folders (Image and Audio)
- Import a folder, then drag it into the Scene Window or Viewport. This creates an **Asset from Smart Folder** utility plus a **Footage Shape** (for images) or a **Sound** behaviour (for audio). Set its **Path** relative to the folder, e.g. `path/to/image.jpg`.
- **Data-driven swapping:** connect a **String Array** or a **Spreadsheet** to `assetFromSmartFolder.path`, and drive the Index from the **Render Manager's Dynamic Index** to render one version per row.
- **Maximum depth is 5 folder levels.** Files in the 6th level are not found.
- Image Smart Folders: each image sequence needs its own folder. Files whose names end in a number may be read as a sequence, so name them `image_one` rather than `image_1`, or turn off **Detect Sequences** with the cog icon.

### Referencing
- A Reference is a `.cv` imported as an asset. Its Compositions can be used as Pre-Comps in other scenes, and changes to the source file show up in every scene that uses it.
- A Composition appears in a Reference **only if Referenceable is checked** in its Composition Settings.
- **Artboard** option: ignores the referenced comp's boundary and background.
- **Pre-Comp Overrides** from the source appear on the Pre-Comp's **Overrides** tab, so each instance can differ.
- Right-click → **Open Reference File…** to edit the source. Hold **Shift** when importing to start in `/Scenes` instead of `/Assets`.
- ⚠ **Nulls and Falloffs neither appear nor render inside References.** For visible helpers that don't render, use shapes set as **Guide Layers** (Advanced tab).
- Using Project Settings is recommended, so reference paths stay relative.

## Audio Monitor
- A meter from −50 to 0 dB that shows audible Sound Behaviours during playback. It is green normally, then yellow and red as the level nears or passes 0 dB (clipping).

---

## Lessons for good practice from part 1
- **Always set a Project** before importing assets. Without one, paths are absolute and scenes break on other machines, in Cavalry Player and in the CLI.
- Use **Increment and Save** with a counter in the file name (`shot_001.cv`) to keep versions.
- Use **Export as Project** to archive or hand off work (check font licences) and **Reduce Scene** to clean up.
- Swap heavy video for **image sequences** to speed up playback. Lower **Viewport Quality** while working; render quality is set separately.
- Use **Bake Animation** to turn procedural motion into keyframes, for example before an export that needs plain keyframes.
- For data-driven versioning, combine **Smart Folders + Spreadsheet/String Array + Render Manager Dynamic Index**.
- Use **Guide Layers**, not Nulls or Falloffs, for helpers inside referenced scenes.
- Name image files so they are not mistaken for sequences, and keep Smart Folders within 5 levels.
- Lottie, SVG and GIF ignore colour management (they are always sRGB). Keep that in mind when you match colours.


---
---

# Part 2: Windows, editors and the general UI

## Default workspace layout
```
┌──────────── Tool Settings Bar ────────────┬──── Shelf ────┐
│ Assets Window │T│                          │ Color Window  │
│               │o│        Viewport          │               │
├───────────────┤o│                          ├───────────────┤
│               │l├── Playback Control Bar ──┤ Align Window  │
│ Attribute     │b├──────────────┬───────────┴───────────────┤
│ Editor        │a│  Scene Tree  │ Timeline                  │
│               │r│              │ Time Editor / Graph Editor│
└───────────────┴─┴──── Scene Window (Tree + Timeline + Editors)┘
```

## File and folder locations (macOS / Windows)
| What | macOS | Windows |
|---|---|---|
| Scripts | `~/Library/Application Support/Cavalry/Scripts` | `%APPDATA%\Cavalry\Scripts` |
| Library Palettes | `~/Library/Application Support/Cavalry/Palettes` (one sub-folder level = one library) | `%APPDATA%\Cavalry\Palettes` |
| Label Palettes | `~/Library/Application Support/Cavalry/LabelPalettes` | `%APPDATA%\Cavalry\LabelPalettes` |
| JS snippets | `~/Library/Application Support/Cavalry/snippets.json` | `%APPDATA%\Cavalry\snippets.json` |
| Workspaces | `~/Library/Preferences/Cavalry/Workspaces/` (sub-folders = categories) | `%LOCALAPPDATA%\Cavalry\Workspaces\` |
| Active workspace | `~/Library/Preferences/Cavalry/workspace.json` | `%LOCALAPPDATA%\Cavalry\workspace.json` |
| Velocity presets | `~/Library/Preferences/Cavalry/VelocityPresets/` | `%LOCALAPPDATA%\Cavalry\VelocityPresets\` |
| Presets | `<Preferences folder>/Presets/presets.json`. Any valid `.json` added to this folder loads too. | same |
| Preferences, Plugins, Logs | Help > Show Preferences / Plugins / Logs Folder | same |

---

## Attribute Editor
- Loads each layer's UI as a set of **Control Rows**. Several UIs can be open at once.
- **Header:** a search box that filters attributes across every loaded UI (load 4 shapes, search "position", scrub `position.x`, and all 4 change). Also a **UI count** whose limit is the *Max Attribute Editor UIs* preference (the oldest UI is dropped when the limit is reached; pinned UIs don't count), **Live Mode** (selecting a layer replaces the UI), **Show Selected**, and **Clear All**.
- **Layer header:** a Dependency Graph popover (read-only), connection icons, User Presets, **Pin** (green = stays loaded), and Close.
- **Loading a layer:** drag it from the Scene Window, double-click it (Option/Alt+double-click clears the others first), or turn on Live Mode.
- **Right-click the header:** **Copy Layer Id**, Reset all Attributes (keeps connections and keys, but not Gradient or Graph widgets), Delete all Animation, Advanced > **Wireframe**, and Context > **Filter Time Offset / Filter Index / Filter Position**. These remove that kind of context from everything upstream, which is different from *Use Incoming Index*.

### Control Row types
| Type | Example |
|---|---|
| `int` | Duplicator Count |
| `double` | Rotation |
| `int2` | Composition resolution (can lock proportions) |
| `double2` | Duplicator Shape Position |
| `double3` | Position of a 2.5D shape |
| Color | R, G, B, A and hex. **The hex value cannot be animated.** Typing a palette swatch name (e.g. `gre` → Green `#4ffd7a`) fills in the hex. |
| Slider | Attributes with hard min and max (e.g. Opacity 0–100) |
| String | Has a `+` shortcut to connect a String Generator |
| Graph | A curve widget (see below) |
| **Input List** | Accepts many connections. Drag layers onto it or use `+`; reorder or remove them in a popover (hold Cmd/Ctrl to remove several); right-click > Disconnect All Inputs. |
| **Generator** | A dropdown that is really a list of child layers (Distribution, Primitive Type, Noise Type…). **Reveal Generator** puts it in the Scene Tree so it can be shared (e.g. two Duplicators using one Distribution). **This cannot be undone.** |
| Checkbox | A bool: outputs 1 or 0 |

### Interacting with Control Rows
- Click and type, or click-drag to scrub. The *Infinite Scrubbing* preference lets you scrub past the screen edge. **Option/Alt** applies a change to every field of a double2/3. Tab and Shift+Tab move between fields (on macOS, turn on Keyboard navigation in System Settings).
- **To set many layers at once:** load one layer, select the others in the Scene Tree, then edit.
- **Inline expressions:** type `12*3` into a field and it becomes `36`. This is a one-off calculation.
- **Keyframing:** click the diamond icon. It has three states: no key, has keys, key at the current frame. Option/Alt+click keys every channel. **Auto Key is on by default**, so once an attribute has a key, any change makes or updates a key. Cmd/Ctrl+click deletes the key at the current frame.
- **Right-click menu:**
  - Keys: Set Keyframe, Delete Keyframe, Delete Animation.
  - Connections: Disconnect Input, Duplicate and Replace.
  - Values: Reset Attribute to Default, Rename…, **Edit Limits…**
  - Array items: Delete Selected Attributes, Reorder.
  - **Add Expression**, **Add to Control Centre**, **Add Pre-Comp Override**, **Control with Null**, Add Behaviour, Add Array, Add Math/Script, Add Utility.
  - **Set Selected Attributes / Set Selected Layers**, Copy Value, Paste Values (types must match).
  - **Copy Layer Id**, **Copy Scripting Path** (case-sensitive), **Copy Generator Type**, Reveal Generator.

### Attribute Expressions (ExprTk)
- These can only be added to attributes that **have an input connection**. They are saved with the scene and re-run whenever the value changes. Edit or disable them with the `π` button on the row; the Dependency Graph also shows `π` on the wire.
- **Order of operations:** the incoming value is first **converted to the input's type**, then the expression runs. For example 2.34 becomes 2 for an int and 1 for a bool.
- Short forms: `*2`, `/3`, `%100`, `^2`, `+10`, `sqrt(9)`.
- With the incoming value: `-(value)`, `sqrt(value)`, `clamp(-45, value, 45)`, `round(value/10)*10`, `if(value < 0, 0, value)`.

### Edit Limits
- Hard Min/Max, Soft Min/Max (scrubbing stops there but you can type past them; typing past one removes it), and Step (e.g. step 1 turns a double into whole numbers).
- Setting both a hard min and max turns the row into a **slider** next time the UI loads.
- Limits are stored **per attribute, per layer** and saved in the file.
- Built-in hard limits (e.g. Opacity 0–100) cannot be widened.
- A double2 limit applies to both fields; you can't limit x and y separately.
- ⚠ When you commit a limit, any current value outside it is **clamped**, which can change your composition.

### Gradient widget
Used by the Gradient Shader, Gradient Map Filter, Index to Color and Color Blend.
- **Gradient Mode** (how colours blend): RGB, **Oklab**, HSV (short or long way round), LCH (short or long).
- **Stops:** click to add one; each has Position (0–1), **Jitter** (Gradient Shader and Gradient Map only) and Color. Option/Alt+drag duplicates a stop, Cmd/Ctrl selects several, and you can drop swatches onto it. **Stop positions and colours can be animated and connected.**
- **Right-click menu:**
  - Copy/Paste Gradient, Adjust Colors (HSV), Distribute Stops, Subdivide, Reverse, Shuffle, Shift Stops Left/Right.
  - Select All, Invert Selection, Select Same Color.
  - **Set Interpolation** for each stop: Linear, Stepped, Smooth, Crush, Smooth Blend, Contrast.
  - Save Gradient to Palette.

### Graph Attribute widget
Found on Stagger, Falloff, Number Range and others.
- **Editing points:** drag a point; Option/Alt+click switches it between linear and Bézier; double-click adds a point; Delete removes one.
- **Tools:** preset curves on the right; flip horizontally or vertically; copy and paste; type exact `P` (position) and `V` (value); grid snapping.
- **Animating or connecting points:** tear the panel off first so it stays open, then use the P and V fields.

---

## Color Window and Palettes
- **Picking colours:** use the wheel or the eyedropper, or type Hex, RGB or HSV. Typing `AB` and pressing Return gives `#ABABAB`.
- **Tabs:** Swatches and Generator.
- **Palette types:** Library, **Project**, **Scene** and **Labels**. Each can be shown as a grid or a list.
- **Applying a swatch:**
  - Drag it onto a shape in the viewport (sets the fill) or onto a colour attribute.
  - In grid view, click to set the fill, Option/Alt+click to turn the fill on and set it, or Shift+click to turn the stroke on and set it.
  - In list view, use the row buttons.
- **Options menu:**
  - New, Import (`.pal`, **`.ase`**, `.theme`), Save As, Rename, Reveal in Finder/Explorer.
  - **Set Gradient from Palette**, which also works on a Multi-Point Gradient.
  - **Create Array from Palette** (makes a Color Array).
  - Clear Palette, and Delete Palette (⚠ deletes the file and **cannot be undone**).
- **List view:** rename, reorder, Set W3C Name.
- **`.pal` format** (JSON):
  ```json
  { "colors": [ { "color": "#4ffd7a", "swatchName": "Green", "uid": 3,
                  "types": ["shader","filter"] } ],
    "designer": "Scene Group", "fileType": ".pal", "name": "Cavalry",
    "version": 1.0, "website": "https://cavalry.studio/" }
  ```
  - `colors[].color` and `swatchName` are required.
  - `uid` is used to re-map label colours when you switch palettes.
  - `types` gives default label colours per superType (see `api.getSuperTypes`).
  - Only folders **one level deep** under Palettes count as libraries, and each must contain at least one palette.

## Control Centre
- Right-click an attribute and choose **Add to Control Centre**. A blue dot then marks that row in the Attribute Editor.
- **Groups** can only be one level deep. Options: Auto-Group by Source Layer, Expand or Collapse All, Clear Composition, Clear Control Centre.
- There is also search and a filter by Composition. **You can only drag to reorder when no search or filter is active.**
- **Tips:**
  - You can't promote a single field such as `position.x`. Instead make a **Value** behaviour, connect `value.id → shape.position.x`, and promote the Value.
  - **Custom toggles:** Animation Control `Active` → Color Array `Index` makes a light/dark switch. The **If/Else** utility can make other booleans.
  - **Custom sliders:** use Edit Limits. **Custom dropdowns:** use the Custom Dropdown utility.
  - Rename attributes with Rename…

## Dependency Graph (also called the Flow Graph)
- **What it shows:** each layer is a box listing its attributes, with inputs on the left and outputs on the right, colour-coded by type. The header port is the layer's `Id`. Dropping a wire on the header opens a list of attributes to connect to.
- **Header controls:** grid snapping, grid, mini-map, wire style (Bézier, Straight, Orthogonal), search, **Bookmarks**, Clear Selected and Clear All. The two Clear buttons only remove boxes from the view.
- **Creating and loading layers:** press **Tab** to create a layer at the cursor. Drag a layer from the Scene Tree to load it and everything upstream of it. Double-click (or use Live Mode) to load it into the Attribute Editor.
- ⚠ **Pressing Delete deletes the layer from the scene.** To only remove it from the view, use Clear Selected.
- **Connecting:** click or drag from an output to an input. A new connection **replaces** any existing one on that input. Delete a wire with Delete or right-click > Disconnect. Right-click a wire to add or edit an Attribute Expression.
- **Layout:** drag boxes to arrange them, press F to fit, and group boxes in **Backdrops** (create from selection; you can rename, colour and resize them). The layout is saved with the scene.
- **Not shown in the graph:** connections from a layer to itself (e.g. `position.x → position.y`), from Composition Settings (e.g. `composition.time`), from the Render Manager (e.g. `renderManager.dynamicIndex`), and from the Scene Palette.

## JavaScript Editor and Console
- **Editor buttons:** Run Script (hold Option/Alt to run only the selected text), Clear, Load…, Save As…, and **Save Encrypted…**. Scripts are kept between sessions inside Cavalry, but ⚠ **editing in the Editor does not save back to the original file.**
- **Editing:** tabs, find and replace (Cmd/Ctrl+F), Cmd/Ctrl+/ to comment, autocomplete after `api.`, `cavalry.` and `ui.`, matching brackets inserted automatically, and **Shift+Option/Alt+F** to format.
- **Snippet Panel:** drag code in to save it; drag a snippet back into a script, run it, import or export it, rename or reorder it. Snippets are stored in `snippets.json`:
  ```json
  { "resourceType": "cavalry.snippets", "semVer": "1.0",
    "snippets": [ { "contents": "api.primitive(\"rectangle\");", "name": "Example Snippet" } ] }
  ```
  This also confirms that **`api.primitive("rectangle")`** creates a primitive.
- **Console:** messages are colour-coded green (success), yellow (warning) and red (error). It's editable and can be copied. It's also built into the Editor unless the standalone Console is docked.
- For VS Code there is **Stallion**, an extension that includes the TypeScript type definitions.

## Mesh Explorer
- Shows the mesh hierarchy of **one shape**, up to **200 sub-meshes**. It has Lock and **Refresh** buttons and does not update live.
- The numbers on the left are **levels**, which you need for the Sub-Mesh behaviour. Text, for example, is built as Line → Word → Character.
- Point counts include a duplicate point where a closed path joins, so a closed triangle reports 4 points.

## Message Bar, Scene Statistics, Glyph Browser, Audio Monitor
- **Message Bar:** confirmations, warnings and tips, with a speech-bubble button that opens the Log.
- **Scene Statistics:** an overview of the scene.
- **Glyph Browser:** double-click a glyph to copy it.
- **Audio Monitor:** a meter from −50 to 0 dB.

---

## Preferences
- **Show Experimental Features**, needed for the **Tag Window**, for example.
- **Save > JSON format:**
  - **Pretty** (4-space indent, largest files)
  - **Compact** (the default)
  - **One Line** (smallest files)

  → MCP: use **Pretty** if you want readable diffs of `.cv` files in git.
- **Autosave:**
  - Off, Reminders, or Autosave.
  - Interval in minutes.
  - Daily folders, named Weekday-Day-Month-Year, Weekday-Month-Day-Year or Year-Month-Day-Weekday.
  - A limit on the number of files (per day when using daily folders).
  - Files go in the Project's Autosave folder, or next to the scene if no Project is set.
- **UI:**
  - Font Size, Infinite Scrubbing (ignored with a pen tablet), Tips and Feedback buttons.
  - **Max Attribute Editor UIs**, Large Previews.
  - **Arrow Keys Control Hierarchy**.
  - **Locking Layers Prevents Selection in the Scene Window** (this also blocks Live Mode on locked layers).
  - Preview Compositions in Assets, Viewport Canvas Color.
  - What Return does in a field: Selects All, or Clears Focus.
- **Features:**
  - Add new Layers to selected Tags.
  - Remember Graph Editor Curve Framing.
  - **Maintain Proportional Easing**.
  - **Use Absolute Bézier Positions**.
  - Full Screen Focus Mode.
  - Nudge Step.
  - Default Velocity Presets.
- **Viewport/Rendering:** Show Viewport Timecode (Never, During Playback, Always) and **Render Notifications** (none, after each queue item, or after the whole queue).
- **Color Management:** see the Color Management section below. Small colour differences (about 1%) are expected because Cavalry is not fully 16-bit yet.
- **Export:** **Lottie Author**, which is written into exported Lottie JSON.
- **Bake Animation:** **Collinear Tolerance** (degrees; a higher value gives fewer keys) and **Bake Accuracy**.
- **Performance:** Image and Video Cache Size (MB).
- **MCP Server** ⭐:
  - **Enable MCP Server** allows Cavalry to communicate with MCP servers. See "AI Automation with Claude" in the docs.
  - **MCP Server Port** sets the port the MCP communicates on.
  - Preferences can also be edited by hand (see Tech Info > User Preferences).

  **→ MCP:** this is how Cavalry 2.8+ is controlled natively. For Cavalry-MCP, either talk to this built-in endpoint or use a separate script bridge on a different port. Next, find out its protocol and what it exposes (from the "AI Automation with Claude" page).

---

## Lottie Export
- Use File > Export Lottie… or the Render Manager. The Render Manager route also works with Dynamic Rendering.
- Each shape has extra options on its **Advanced** tab, including **Lottie Baking**: Automatic, **Still**, Animated or **Nuclear**.
- Preview the result at lottiefiles.com/preview.
- **Exports without baking (smallest files):** Position, Rotation, Fill Alpha, Stroke Alpha, Stroke Width, Trim Start, Trim End and Trim Travel, Path Animation, and Star Point Count, Radius and Inner Radius. This assumes no deformers.
- **Exports, but makes large files:** Deformers, Magic Easing on paths, animating any primitive attribute other than Star's, Rig Control and Animation Control combined with Path Animation, and the Duplicator.
- **Tips:**
  - Use the **Alpha attribute**, not the alpha of the colour.
  - LottieFiles' player breaks when Trim Start is greater than Trim End.
  - A parent renders *in front* of its children, so use a Group or Null instead of parenting.
  - Animate masks with Path Animation; masking a Group or parent is not supported.
  - Set a pre-comp's background alpha to 0.
  - If a still scene exports too large, set Lottie Baking to Still. If animation is missing, try Animated or Nuclear.
- **Images:** exported to an `images/` folder alongside the JSON (zip them together for LottieFiles). They cannot be embedded in the JSON, and **image sequences are not supported**.
- **Not supported at all:**
  - **All Filters**.
  - Noise, SkSL and Color Shaders, and Shape to Shader.
  - **Sweep and Conical gradients**, and Linear Gradient's *Gradient Scales with Rotation* option.
  - Colour alpha (use the Alpha attribute instead), Dash Pattern, Skew, and **Shape Opacity** (use the Fill and Stroke Alpha attributes).
  - **Text**, which is exported as shapes.
  - **Looping curves**.
  - **Track Mattes** (use a Clipping Mask instead).

## Dynamic Rendering
- **Dynamic Index** (in the Render Manager header) goes up by 1 after each render. A Render Queue Item's **Dynamic tab** has a **Render Range**: with *Dynamic Render* checked, `0,2` renders 3 versions, with index 0, 1 and 2.
- **Dynamic Index Offset** lets you preview a given version.
- **Typical setup:** connect `renderManager.dynamicIndex` to the Index of a Value Array, Color Array, Spreadsheet or Asset Array, which then drives text, colours, SVG logos and so on (e.g. 32 NFL team variants).
- **File names:**
  - By default each version goes into its own sub-folder (0/, 1/, …).
  - Alternatively, add a `<Dynamic>` token to the file name.
  - Or uncheck *Ensure Unique File Names*, but then making the names unique is up to you.
  - **Custom names:** connect a String, Spreadsheet column or Formatted String Generator to the RQI's **File Name**. Tokens inside the string are only highlighted (shown as valid) once they reach the RQI.
- **Uses:** generative variations, endboards, A/B tests and personalised ads.

## Render Tokens
| Token | Value |
|---|---|
| `<Composition>`, `<Scene>`, `<Project>` (needs a Project), `<Frame>`, `<Resolution>`, `<FPS>`, `<Format>`, `<Dynamic>` | Scene and render information |
| `<D>` `<d>` `<DD>` `<M>` `<m>` `<MM>` `<YYYY>` `<YY>` `<T>` `<TZ>` | Date and time |
| `<%Y>` `<%m>` `<%d>` `<%H>` `<%M>` `<%S>` `<%F>` `<%T>` `<%V>` `<%j>` … | strftime-style custom formats |
| `<Env:VAR>` | Environment variables, e.g. `<Env:HOME>` or `<Env:USERPROFILE>` |
- A token **replaces** the value Cavalry would add automatically, so `Composition.<Frame>` gives `Composition.000.png`, not `.000.000`.
- You can chain tokens (`<d>-<DD>-<m>`). Invalid tokens are shown in red and ignored.

## Upload Preset Manager
- Presets for uploading renders to a URL. You set the name, URL and Path (endpoint), Automatic MIME Types, and Auth (Basic with headers, **Bearer** token, or None).
- Choose a preset on the Render Manager's **Advanced** tab. **You have to reopen the Render Manager** before a new preset appears there.
- web3.storage comes pre-configured. Headers cannot be deleted, but empty ones are ignored.

---

## Scene Window
- Made up of the **Timeline**, **Scene Tree**, **Time Editor** and **Graph Editor**. Each open Composition gets a tab, which you can close individually or in groups (Others, to the Left, to the Right).
- **Header:** search, Add Layers (Cmd/Ctrl+.), Motion Blur, Presets, Composition Settings, and a frame/timecode field (click F or T to switch).
- **Footer:** Tags drawer, **Animation Layer Filter** (**U**: selected layers and their animated attributes; **Option/Alt+U**: also animated children; **Shift+Option/Alt+U**: all children), and a switch between Time Editor and Graph Editor.

### Scene Tree
- **Columns:**
  - **Lock:** blocks viewport selection and renaming; it can also block Scene Window selection, depending on preferences.
  - **Eye or checkmark:** an eye hides a drawable layer; a checkmark disables a non-drawable one so it stops calculating.
  - **2.5D** toggle (used when the comp has a Camera).
  - **Audio** toggle on Sound behaviours, which also controls whether the audio is exported.
  - **Label colour**, which carries over to the Time and Graph Editors.
  - **Tag** icon.
- ⚠ **Hidden shapes are not drawn but are still calculated** when they're inputs elsewhere, e.g. a Duplicator's Input Shape.
- **Keyframing visibility:** use the **Hidden** attribute on the Advanced tab. For audio, use **Play Audio** on the Sound behaviour's Advanced tab.
- **Parenting:**
  - Drag one layer onto another. Hold **Shift** to snap the child to the parent's transform.
  - Or press **Cmd/Ctrl+P**; the last-selected layer becomes the parent.
  - Drawable children inherit the parent's transforms. Children of a hidden parent show a dimmed eye.
  - Drag a layer out to un-parent it. **Cmd/Ctrl+L** reveals the selected layer in the tree.
- **Renaming:** press Return. Selecting several and renaming applies the name with numbers added: Name 1, Name 2, …
- **Search:** filters the tree. Finding children inside collapsed parents needs at least 3 characters.
- **Show/hide animated attributes:** the dot next to the layer, or Cmd/Ctrl+Shift+H.
- **Grouping:** Cmd/Ctrl+G.
- **Double-click** loads the layer into the Attribute Editor. **Option/Alt+Cmd/Ctrl+double-click** opens a Composition.
- **Animation Offsets:** drop a connection onto the extra input that appears on a keyframed attribute. Its value (e.g. from Noise) is **added on top of the keyframes**, and the original curve shows faded in the Graph Editor.

### Composition Settings (Cmd/Ctrl+K)
- **Basics:** Resolution (with presets), Frame Range, Playback Range, **Time** (read-only and connectable, though *Frame* is usually the better choice), Frame Rate, Background Color, and **Playback Step** (play every nth frame).
- Comps created from the Scene Window's right-click menu start with a background alpha of 0.
- **Motion Blur:** on/off, Shutter Angle (180° gives a film look), Motion Blur Centre, **Blur Align** (−100 means no blur when the shape was still on the previous frame), and Samples.
- **Other:** Keyframe Layer, and **Referenceable**.
- You can also edit these by dragging the comp from Assets into the Attribute Editor.

### Timeline
- Click or drag to move the playhead. Drag the teal bookends to set the playback range, or drag the bar between them to move it.
- **Shortcuts:**
  - **B** and **N** set the playback start and end.
  - Cmd/Ctrl+←/→ moves 1 frame; add Shift to move 5.
  - Shift+drag the playhead snaps to every 10 frames or to Time Markers.
  - Option/Alt+Cmd/Ctrl+←/→ jumps to the next or previous keyframe (filtered by selection).
  - Hold **q** and drag to scrub from any window.
- Turn on *Update the UI during playback* to see the playhead move during playback. This requires Playback Caching to be off.

### Time Editor
- **Clips:**
  - For shapes, the clip sets when they're visible; for behaviours, when they're enabled. Utilities, Filters and Shaders show a chevron clip and the clip has no effect on them. The exceptions are Falloffs, Nulls and Sound, which behave like shapes.
  - Option/Alt+drag an end to move ends that are shared between layers.
  - `[` and `]` move the clip's in and out points to the current frame; Option/Alt+`[` and `]` trim instead.
  - Right-click > Clips: **Split**, **Merge**, **Add Clip to Start** or **End**. You can also show names on clips.
- **Keyframes:**
  - Add: scrub a value, click the diamond, or right-click > Add Keyframe.
  - Edit: double-click a key (Option/Alt also moves the playhead to it).
  - Move with drag (multiple keys too). Delete with the Delete key.
  - Copy and paste work **across layers**: if the attribute is missing on the target, it's created.
  - Option/Alt+drag duplicates keys. Set Color highlights keys.
  - **Copy Easing** then Paste copies easing in order; extra keys are ignored.
- **Keybars:** the line between two keys; drag it to move the whole segment. A dashed keybar means both keys have the same value (a hold).
- **Marquee selection:** selects keys if there are any inside the box, otherwise keybars. Option/Alt selects clips only.
- **Tools:**
  - Keyframe Layers.
  - Align keys Left, Centre or Right.
  - A **Transform tool** to move and scale keys.
  - Snapping to keys, clip ends and markers, with an adjustable threshold.
  - **Pacing Markers** (every second with sub-divisions, or by BPM with offset and beats per bar).
  - Zoom: F fits the playback range, Shift+F the frame range.
- **Magic Easing:**
  - Select keys, right-click > Magic Easing. Choose **Edit Custom Expression…** to write your own in ExprTk, where `x` runs from 0 to 1:
    `1 - pow(1 - x, 5)`, `-(cos(PI * x) - 1) / 2`, or a back-ease using `var c1 := 1.70158; …`.
  - Cavalry follows the **Web Animation / W3C easing standard**, which can differ from After Effects.
  - To turn the easing into keys, use Animation > Bake.

### Graph Editor
- **Loading curves:** select layers (all their curves), attributes, or keys. It also shows the resulting curves of **procedural** animation (e.g. Noise) and Animation Offsets.
- **Interpolation types:**
  - **Linear**, **Bézier**, **Stepped**, **Stepped Next**.
  - **Auto-Bézier** (smooth, flat at peaks, never overshoots).
  - **Plateau** (like Auto-Bézier, but also flat at the first and last keys; the strictest at avoiding overshoot).
  - **Spline** (smoothest, may overshoot).
  - **Clamped** (may overshoot, but flattens between keys with nearly equal values, which prevents "foot-slip").
- **Double-clicking a key** lets you set its Value, Interpolation, Magic Easing, handle positions (absolute or relative, per preferences), **Angle Locking** and **Weight Locking**.
- **Shortcuts:**
  - Option/Alt+click switches a key between linear and Bézier; Option/Alt+drag breaks or joins handles.
  - Shift+Option/Alt+drag changes handle weights.
  - **X+click** collapses a handle; **X+drag** restores it.
  - Shift locks movement to one axis.
  - Scroll, Option/Alt-scroll and Shift-scroll zoom; so does Z+drag. Space+drag pans.
  - F frames the view, Cmd/Ctrl+F fits all curves, Shift+F the frame range.
  - Double-click a curve to add a key. Option/Alt+double-click opens **Loop Settings**.
- **Looping:**
  - Loop After and Loop Before, each with None, **Looping**, **Looping with Offset** or **Oscillate**.
  - Limit Loops.
  - Filter Last Keyframes (loop only the last N keys; needs at least 3 keys).
  - ⚠ Looping curves **don't export to Lottie**.
- **Other tools:**
  - Frame and Value fields, the Transform tool (scale from edges or corners; Option/Alt scales from the centre), and grid snapping.
  - **Ghosting**, channel names, and Pacing Markers.
  - **Buffer**: Snapshot and Swap, for A/B-testing timing.
  - Join or break Béziers, and **Align** (Option/Alt aligns to the playhead).

### Keyframe Layers
- Animation layers that blend over the base animation (e.g. walk to run, or making an arm swing bigger).
- Each has **Active**, **Strength** (which can be animated), and **Mode**: *Normal* adds to the layers below, *Overwrite* replaces them.
- Double-click a layer to make it the current one. When non-default layers hold keys, a read-only combined value appears in the Scene Tree. Use the trash icon to delete one.

### Time Markers
- **Adding:** right-click the Timeline, or press **Cmd/Ctrl+\*** (Shift+Cmd/Ctrl+8).
- **Moving:** Option/Alt-marquee to select several, then drag.
- **Settings:** Label, Color, Locked, **Relative Placement** (a 0–1 position in the comp) or Absolute frame, a Color Region (± frames), and when to show the label in the Timeline and in pre-comps.
- **Connecting:** use the anchor to link a marker to **keyframes or clip ends**; moving the marker then moves them (you can link several keys at once). Remove via right-click > Time Markers > Disconnect.
- **Jumping:** `<` and `>` go to the previous or next marker; **1–9** go to marker N.
- Absolute markers snap to whole frames; relative markers don't.

---

## Shelf (quick actions)
| Button | What it does |
|---|---|
| Demo Scenes | Adds an example scene (hold Cmd/Ctrl to start playback) |
| Duplicator | Makes a Duplicator from the selection |
| Extrude | Makes an Extrude Shape from the selection |
| Forge Dynamics | Makes a Forge Dynamics Shape with the selection as its Bodies |
| Particles | Adds a Particle Shape and Particle Emitter |
| Auto-Animate | Adds an Auto-Animate deformer to the selection |
| Align | Adds an Align deformer to the selection |
| Rig Control, Animation Control, Camera | Adds that layer |
| Rubber Hose | Adds a Rubber Hose Limb, connected as a deformer if a shape is selected |
| Cel Animation | Adds a Cel Animation Shape and switches to the Pencil |
| Text along a Path | Select Text, then a Path: connects the path to `textPath` and `composition.time` to `pathTravel` |
| Scheduling Group: Schedule | Adds a Scheduling Group with Sequence on |
| Scheduling Group: Stagger | Adds a Scheduling Group with a Stagger driving Child Offset |
| Layout Group | Horizontal, Vertical, or Grid (Grid Layout Row inside a Grid Layout Group) |

## Tag Window *(experimental)*
- **Modes:** Select, Filter Scene Window, Filter Viewport, or Filter Both.
- **Kinds of tag:**
  - **Quicklist:** temporary, not saved with the scene.
  - **System Tags:** made automatically from label colour and layer type.
  - **User Tags:** ones you create.
- **Adding:**
  - Use `+`, or **Cmd/Ctrl+Shift+T** in the Scene Window (Option/Alt+Return also assigns it to the selection).
  - Drag layers onto a tag, or use the tag icon in the tree.
- **Removing:** right-click > Remove Tag (from one layer), or Clear Tag (from all layers).
- **Nested tags:** type `Character/Body` (e.g. Character › Head › Eyes). Selecting a parent tag selects everything in its children too.
- Right-click > **Convert Quicklist to Tag**.

## Tool Settings
- **Select:**
  - Snap Angle.
  - **Manipulator** (2.6): move freely from the centre, along an axis with the arrows, rotate with the ring, scale with the squares (Shift scales both). The black diamond switches between world and local.
  - Transform mode: **Group** or **Individual** pivots.
  - Option/Alt adjusts one corner radius of a Rectangle.
- **Edit Shape:** Snap Angle, Tooltips, Transform Tool (hides handles and disables corner/Bézier conversion and splitting), **Close Distance** (in screen pixels), Curve Ghosting.
- **Pen, Pencil and Line:**
  - Stroke Width; **Cap Style** (Flat, Round, Projecting); Close Distance.
  - Pencil only: **Accuracy**, **Stabiliser** and Stability Radius.
- **Mesh:** Soft Selection and its size.
- **Tracking:**
  - **Presets:** **Edge Snap** (fast; follows high-contrast screen edges; good for plain or animated screen content and brief blocking), **Balanced** (dense feature points; good for textured planes), **Robust** (remembers keyframe features; slower, but recovers after something blocks the view).
  - **Supervised** (Balanced and Robust only) pauses the track when quality drops so you can fix it.
  - Show Grid, Track Backwards/Forwards, **Create a Keyframe** (manual corrections), Apply (to a Corner Pin), Clear.
- **Primitives:** Create Editable Primitives (adds an "E" badge on the toolbar icons), Tool Help, and **Draw in 2.5D**.

## Toolbar
- Double-click the Pen, Pencil or a primitive tool to switch it to **Quick Mask** (the icon turns yellow). Anything you draw becomes a **Clipping Mask** on the selected shape.

## Viewport
- **Pre-selection highlight:** detail depends on complexity. Simple shapes show full paths; moderate ones show per-sub-mesh boxes (per word for text); complex ones show a single box.
- **Multiple Viewports:** each can preview any Composition, but **only the active comp plays back**. The viewport showing the active comp has a purple border.
- **Footer controls:**
  - **Zoom:** F fits; Cmd/Ctrl +/- doubles or halves.
  - **Camera** picker.
  - **Playback** and Playback Mode (Loop or Once).
  - Tag filter indicator.
  - Color Management.
  - **Audio:** Play Audio, device, channels, and Playback Volume (doesn't affect export). Device names with unicode characters can break playback.
  - **Snapping:** threshold, plus Grid, Ruler Guide, Composition centre, Bounding Box, Point and Pixel.
  - **Grid:** 2D, 3D and Pixel. The **2D grid is saved per comp**; 3D and Pixel are preferences. The 2D grid can be Regular (origin, rotation, margins, cell size or divisions, subdivisions) or **Swiss** (gutters), with copy and paste between comps.
- **Playback Caching:**
  - Caches the whole comp.
  - **Any change other than time clears the entire cache.**
  - Hides drawables while playing if *Show Drawables* is set to *Except during Playback*.
- **Display overlays:**
  - Composition Boundary.
  - **Motion Paths:** up to 10 selected shapes, showing frames, seconds, keys, path and direction, over a set duration.
  - **Onion Skinning:** before and after colours and frame counts, outline only.
  - **Clipping Mask overview:** outline, plus a green fill option.
  - Checkerboard transparency, which only shows when the comp's background alpha is below 255.
- **Viewport Settings:**
  - **Quality:** Full; No Anti-aliasing; or No AA, Shaders or Filters.
  - **Anti-aliasing:**
    - **Auto** (recommended).
    - **Standard** (analytical AA; fastest for typical scenes).
    - **Enhanced MSAA** (cleaner edges, and faster for Meshes, Particles and Gradient Strokes).
  - **Display Color Space** (preview as other devices would show it).
  - Layer Tools, and **Draw Debug Information** (shows Duplicator point IDs; not during playback).
  - Show FPS in Playback, Tool Help.
  - **Show Drawables:** Always, Except during Playback, or Never.
  - Shape Depth Debug (for SVG sub-mesh depth).
- **Right-click menu:**
  - Select: pick from overlapping shapes, or Select Hierarchy.
  - **Get Info** (click an item to copy it).
  - Zoom, Snapshots.
  - **Copy Layer Id**, **Copy as SVG**, **Copy as JavaScript** (the shape as `cavalry.Path` code).
  - Make Editable, Add Background, Layout.
  - Arrange, **Add to Duplicator**, Group Selected, Lock Selected.
  - Show in Attribute Editor, Show in Scene Window.

### Motion Paths (editing)
- Use the Select tool. Drag a key ◆ to move it. Hold **S** and click a frame dot to add a key. Press Delete to remove one.
- Option/Alt+click switches between linear and Bézier; Option/Alt+drag a handle joins or breaks it.
- **Velocity editing:** drag the yellow arrows along the path to change speed, or away from the path to change influence. Option/Alt mirrors the change.
- **Velocity Presets:** click the path between two keys. Built-in presets keep the path's shape.
  - Custom presets have **Speed In/Out** (0–2) and **Influence In/Out** (0–1). You can manage, import and export them.
  - Use **Export All** and set the result as **Default Velocity Presets** to share one motion style across a team.

### Rulers and Guides
- Cmd/Ctrl+R toggles rulers, which show pixels or percent with the origin at the centre or bottom-left.
- **Guides:** drag one out from a ruler; double-click to type a position; drag back onto the ruler to delete. Cmd/Ctrl+; toggles them. They always snap to the nearest pixel.

## Command Search
- Press **/** anywhere to search and run any command, window or script. It shows the last 3 commands you ran.
- Press **Option/Alt+/** for **Quick Actions**:
  - **Keyframe…** lists the keyable attributes of the selection. Option/Alt+X, Y, Z or W keys one channel (for RGB, use XYZ; W is the 4th channel).
  - **Presets…** applies a preset.

## Workspaces
- Save a layout with Window > Save Workspace…; sub-folders appear as categories. Workspaces don't save automatically, so save again to overwrite one.
- The current layout is saved to `workspace.json` when you quit.
- Script UIs can be docked and saved in workspaces.

## Scripts menu and Help menu
- **Scripts:** lists the scripts in the Scripts folder. Show Scripts Folder opens it.
- **Help:** About, Getting Started Guides, Documentation, Video Tutorials, **System Diagnostics**, Anonymised Analytics and Crash Reports (sentry.io), and the **Show Preferences, Scripts, Plugins and Logs Folder** commands. Also View Account… (Canva) and Sign Out…

## Color Management *(opt-in technical preview)*
- **Pipeline:** each input is converted to the **Working Space**, where blending, anti-aliasing, gradients and compositing happen. That result goes to the **Display transform** (Viewport) and, separately, to export with the profile embedded.
- **"Disabled" still means sRGB everywhere**, so colours stay predictable.
- You can turn it on in Preferences, override it per Project, or toggle it in the Viewport.
- **Colours are always entered, picked and stored in the `.cv` as sRGB.** Flat colours look the same either way.
- **Embedded profiles:** PNG, JPEG, WebP, QuickTime, WebM and MP4 get the working-space profile. **GIF, SVG and Lottie are always sRGB.**
- **Per-asset Color Settings…** (right-click an asset):
  - **Interpret As:** when the profile is missing or wrong.
  - **Linearise:** gamma 1.0, keeping the gamut.
  - **Preserve RGB:** skips colour management; use it for assets read by the **Image Sampler**.
- Footage tagged Rec.709 is displayed with gamma 2.4 (BT.1886).

## Presets
- Available for Layers, **Compositions** and **Render Queue Items**, from the layer header in the Attribute Editor, the Scene Tree header, or the RQI header.
- **Save options:**
  - Reset Layer.
  - Include Primitive Type (Basic Shape).
  - Include Transforms.
  - Include Path (Editable Shape).
  - **Availability:** This Shape Type, or All Shapes (useful for presets that only set fill and stroke).
  - Include File Name and Path (RQI).
- **Manage:** rename, delete (Option/Alt skips the confirmation), and **Set as Default Settings**, shown with a green icon. For example, every new comp then uses your resolution, FPS and background.
- **Stored in** `Preferences/Presets/presets.json`. Any other valid `.json` in that folder also loads, so presets can be **shared as files**.
- ⚠ **Presets don't save connections**, including the comps attached to an RQI, and they skip attributes left at their defaults. Presets also don't apply when you drag out a primitive or text with a tool; they only apply to Option/Alt-click default shapes.

---

## Lessons for good practice from part 2
- **For automation and scripting:**
  - Use **Copy Scripting Path**, **Copy Layer Id**, **Copy Generator Type** and **Copy as JavaScript** to find exact (case-sensitive) API identifiers.
  - Save scenes as **Pretty JSON** if they'll be compared in git.
  - Share snippets, presets, palettes, workspaces and velocity presets as JSON files.
  - Turn on **Enable MCP Server** and set its port in Preferences.
- **Prefer connections plus Attribute Expressions** to JS Layers for simple maths.
  - Remember the input is **converted to the target's type first** (int and bool truncate).
- **Build template control surfaces** with the Control Centre, Edit Limits (sliders, steps), Custom Dropdown, If/Else and Animation Control toggles, and Pre-Comp Overrides.
  - Use a **Value** behaviour to expose a single field.
- **For variant work,** use **Dynamic Rendering**: connect the Dynamic Index to arrays or spreadsheets, name files with a String or Formatted String Generator plus tokens, and add an Upload Preset to deliver.
- **For Lottie:**
  - Animate Position, Rotation, Alpha, Trim and Path rather than primitive attributes.
  - Don't use filters, skew, text, looping curves, track mattes or sweep/conical gradients.
  - Use the Fill/Stroke Alpha attributes, not colour alpha.
  - Set the Lottie Baking mode per shape.
- **Animation craft:**
  - Use Graph Editor interpolations: **Plateau** or **Auto-Bézier** to avoid overshoot, **Clamped** to prevent foot-slip.
  - Use **Keyframe Layers** for blending states, **Animation Offsets** to put noise on top of keys, and **Time Markers linked to keys** for retiming.
  - Use **Buffer** snapshots to A/B-test timing.
  - Share **Velocity Presets** so a team uses one motion style.
- **Performance:**
  - Disable non-drawable layers you don't need (checkmark column). Hidden shapes that feed other layers are still calculated.
  - Playback Caching is cleared by any edit.
  - Use Viewport AA set to Auto or Standard, or MSAA for meshes and particles.
- **Watch out for:**
  - **Reveal Generator** can't be undone.
  - **Delete in the Dependency Graph deletes the layer itself.**
  - **Delete Palette** can't be undone.
  - Committing a limit clamps the existing value.
  - Edits in the JS Editor don't save back to the source file.
  - Hex colour can't be animated.
  - Presets don't save connections.
