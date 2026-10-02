# Cavalry UI Reference: Menus, Tools and Windows

This file condenses Cavalry's official User Interface documentation, which the user pasted in two parts. **This is part 1**: the File, Edit, View, Composition, Create, Animation, Shape, Tool, Dynamics and Window menus; Help/About; Add Layers; the Align Window; Animation Utilities; the Assets Window (with Project Settings, Smart Folders and Referencing); and the Audio Monitor.

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
