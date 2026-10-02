# Cavalry: Research Notes

A reference on Cavalry (https://cavalry.studio): what it is, its features, how it works, its workflows, and good and bad practice. It also covers what this means for building **Cavalry-MCP**.

> **How this was gathered (2 Oct 2026).** The official sites (`cavalry.studio`, `docs.cavalry.scenegroup.co`) were blocked by the network proxy in the research environment, so they could not be read directly. The facts below come from web-search snippets of the official docs and release notes, plus press (CG Channel, Digital Production, Lesterbanks), tutorials (School of Motion, MotionCircles, kamilk.co.uk, nstudio) and open-source bridges on GitHub. Anything marked **(unverified)** came from a single secondary source. The "practice" sections combine documented advice with the author's own reasoning. Check exact API signatures against https://cavalry.studio/docs/tech-info/scripting/api-module/ before you rely on them.

---

## 1. What Cavalry is

- A **procedural 2D motion design and animation app** for macOS and Windows. It sits between timeline tools (After Effects) and node-based procedural tools (Houdini). It is often called "the Houdini of 2D".
- It is **node-based at its core** but looks layer-based. Every layer is a node, every attribute can be keyframed or connected to another attribute, and "anything can connect to anything".
- It is **real-time and GPU-accelerated**: the viewport plays back as you edit, and rendering uses Skia (custom shaders are written in SkSL).
- It is **data-driven**: CSV, Excel (.xlsx), Google Sheets and (from 2.8) Canva Sheets can drive any attribute.
- **History:** made by Scene Group, which was founded in 2019 by Chris Hardcastle (CEO), Ian Waters (CTO) and Adam Jenns (CMO). They came from the London/Manchester studio Mainframe and earlier built **MASH** for Maya, which Autodesk acquired in 2015. Cavalry 1.0 shipped in Aug 2020, and 2.0 followed in Feb 2024.
- **Canva acquired Cavalry on 24 Feb 2026.** From **2.7 (16 Apr 2026)**, all former "Professional" features are **free for individuals, including commercial use**. Studios that need SSO or Enterprise features (for example the CLI) need a paid Canva Enterprise plan. Older reviews that list "Free vs Pro" limits (1080p cap, no Google Sheets, no Lottie) are out of date.

### System requirements (from secondary sources)
- macOS 12+ (Intel and Apple silicon). Windows 10+ (Intel or AMD; Windows ARM runs under Prism emulation and is slower).
- A GPU with OpenGL 4.1 Core Profile. Scenes with very many nodes can be slow on GPUs with under about 6 GB VRAM **(unverified)**.

---

## 2. Core concepts (learn these first)

| Concept | What it means |
|---|---|
| **Scene / Composition** | A Scene file (`.cv`) holds one or more Compositions. Several can be open in tabs, but only one is active at a time. |
| **Layers** | Everything is a layer: shapes, behaviours, utilities, deformers, filters, cameras and so on. Each has an ID such as `basicShape#1`. |
| **Attributes** | Every property of a layer. Attribute paths are dotted, e.g. `position.x`, `material.materialColor`, `font.style`. |
| **Connections** | You can wire any output attribute into any input of a compatible type. This is the basic building block, and it replaces most expressions and parenting. |
| **Behaviours** | Procedural drivers (Noise, Oscillator, Stagger, Random, Spring, Sound…) that you attach to attributes, usually by right-clicking an attribute. They replace hand-made keyframes. |
| **Duplicator** | Copies input shapes over a **Distribution** (Grid, Circle, Path, Point, Sub-Mesh, Particle, Custom/JS…) and gives each copy an **index**. |
| **Context** | Data that flows from a layer to its inputs. The best-known example is the Duplicator's *index context*, which lets one Random, Stagger or Color Array give each copy a different value. Contexts nest: a Duplicator inside a Duplicator gives two levels, and **Index Context** lets you choose the depth. |
| **Falloffs** | Fields that output 1 at the centre and 0 at the edge. They limit how strongly most Behaviours and Deformers act. |
| **Pre-Comps** | A Composition used as a layer. It is a single source of truth: edits to the original appear in every instance. **Pre-Comp Overrides** expose chosen attributes so each instance can differ. |
| **Components** | A Component Shape groups layers and exposes chosen attributes as one simple custom node. |
| **Control Centre** | Brings a Composition's key attributes into one panel. Use it for rigs and client hand-offs. |
| **Assets** | Imported footage, images, SVG, audio, fonts, spreadsheets, and (from 2.5) other `.cv` scenes as references, plus (from 2.8) Affinity `.af` files. They live in the Assets Window, which supports Smart Folders. |

### Main UI windows
- **Viewport.** Real-time preview. Multi-viewport since 2.3. Quality settings trade fidelity for speed. A 3D-like **Manipulator** and editable motion paths arrived in 2.6.
- **Scene Window.** The layer tree, plus the **Time Editor** (keyframes and clips) and the **Graph Editor** (curves). Only animated attributes appear in the Scene Window.
- **Attribute Editor.** The main window for editing values, setting keyframes and making connections.
- **Dependency Graph** (2.4+). An interactive node/schematic view of a Composition's connections.
- **Assets Window**, **Render Manager**, **JavaScript Editor**, **Log Window**, **Preferences**, **AI Studio** (2.8).

---

## 3. Feature inventory

### Shapes and generators
Basic shapes, Editable Paths, Text (fonts and styles, auto-named from their string), Duplicator, Connect Shape, Trails, Particle Shape, Mesh Shape (2.4), Isolines (2.3), Extract Sub-Meshes, Metaballs (2.8), Component, Composition/Pre-Comp, Group, JavaScript Shape, Image and Video layers. Materials include fills, strokes (with taper), gradients and Trim.

### Behaviours (a partial list)
Noise, Oscillator (custom wave types, BPM time mode, seamless loops in 2.4), Stagger, Random, Spring, Sound (audio-reactive), Value / Value Array, Math / JS Math, Number Range, Number Range to Color, Morph, Motion Stretch, Squash and Stretch, Path Offset, Path Relax, Path Average, Pathfinder (booleans), Resample Path, Reverse Path, Pinch, Skew, Position Blend, Push Along Vector, Round, **Rubber Hose Limb**, Stitches, Sub-Mesh, Contours to Sub-Meshes (2.3), Apply Layout, Auto-Animate, Style Behaviours (e.g. Apply Font Style), Blend Sub-Mesh Positions.

### Deformers, filters and effects
- **Deformers:** Lattice and Four Point Warp (2.6), Noise and Oscillator used as deformers, and JavaScript Deformer.
- **Filters:** Blur family (Gaussian, Box, Bilateral, Directional, Zoom, Luminance), Chroma Key, Spherise, Bulge, Grain, Light Sweep (2.5), Lighting with contact and long shadows, Twist, Ripple, Curves (2.8), and the **SkSL Filter** for custom GPU filters (2.4).
- **Shaders:** built-in shaders plus SkSL Shader. Since 2.4, third-party native plugins can add Filters and Shaders.

### Utilities
Spreadsheet and Spreadsheet Lookup, String Generators (including the Formatted String Generator with `{index}` tokens), Falloff, Index Context, Layer Seed (2.3), Camera Guide (2.4), Custom Dropdown (2.8), JavaScript Utility, Particle Emitter and Modifiers (forces, goals, turbulence, paths), Rig Control, and Quad Tree.

### Animation tools
- Keyframes support **Linear, Bézier and Step** interpolation. **Magic Easing** applies mathematical easing presets or custom expressions; right-click selected keys and choose Magic Easing.
- Graph Editor and Time Editor. Layer clips snap with Shift (2.7). Motion paths are editable in the viewport (2.6).
- **Cameras** (Freeform and Look At) give 2.5D depth. Motion blur includes a Transform Only mode.
- **Presets** (2.3) store saved settings for layers, compositions and render items.

### Data and text
- Spreadsheet sources: CSV, Excel (.xlsx, with sheet selection), Google Sheets (live updates), and Canva Sheets (2.8).
- A **Spreadsheet Utility outputs only one column**, so you need one utility per column.
- Text can be driven by spreadsheet data and string generators, which suits charts, league tables, versioned ads and kinetic type.

### Collaboration and project management
- **Referencing** (2.5): import other `.cv` scenes as assets and use them like pre-comps, so several artists can work on one project.
- **Export as Project** (2.5) collects the scene and its assets into one folder. **File > Reduce Scene** (2.6) removes unused comps and assets.
- **Planar tracking** (2.5).

### Import and export
- **Import:** SVG (gradients, opacity, text and clipping masks since 2.8), images and image sequences, video (with audio tracks from 2.5; ProRes is hardware-decoded on macOS), audio, fonts, Affinity `.af` (2.8), and spreadsheets. An After Effects plugin called "Cavalry Importer" (third-party) brings Cavalry scenes into AE.
- **Export (Render Manager / Render Queue):** MP4/MOV (H.264, ProRes; hardware-accelerated MP4 on macOS), WebM (including AV1 from 2.5), GIF (back in 2.3), PNG/EXR sequences (alpha), SVG, PDF, **Lottie (.json)**, and audio. You can render several outputs at once, and file names use **render tokens**. **Render Scripts** (setup, pre-render and post-render JS) let you automate around a render.
- **Cavalry CLI** (Enterprise): `cavalry-cli render [OPTIONS] <scene>` with `-f/--frame`, `-s/--startFrame`, `-e/--endFrame`, `-p/--padding`, `-n/--name`, and `-d/--directory`. It renders headless with no UI.
- **Cavalry Player** (desktop) and the **Web Player** (a WebAssembly runtime, in beta). The Web Player plays `.cv` scenes in a browser, and its JS API can change layer attributes live, for interactive or data-driven web graphics.

### AI (2.8, 30 Sep 2026)
- **Built-in MCP support**, so AI assistants such as Claude can automate Cavalry from natural-language instructions. The docs page is "AI Automation with Claude" (https://cavalry.studio/docs/tips/ai-automation-with-claude/).
- **AI Studio window**: background removal for video, vector generation, and splitting images into layers.

---

## 4. Scripting and automation (most relevant to Cavalry-MCP)

Cavalry uses **JavaScript** in several places, each with a different API surface:

| Where | Namespaces | Purpose |
|---|---|---|
| **JavaScript Editor** (Window menu) and **UI scripts** (Scripts menu) | `api.`, `cavalry.`, `ui.` | Edit the scene and file system: create layers, set and get attributes, connect, keyframe, render, call web services and run shell commands. |
| **JavaScript Layers** (JS Utility, JS Shape, JS Deformer, JS Emitter, JS Modifier, JS Math) | `ctx.`, `cavalry.` (**no `api.`**) | Expressions that run on every frame of evaluation. Inputs are named `n0`, `n1`… by default; you can rename them. `ctx.index` gives the Duplicator or Connect Shape index. |
| **SkSL Shader / SkSL Filter** | SkSL (Skia's GLSL dialect) | Custom GPU shading. |
| **Render Scripts** | `api.` | Setup, pre-render and post-render hooks. |

### Key `api.` functions (from the docs and examples)
- `api.create(type, name?)` creates a layer, e.g. `api.create("textShape", "Bouncy Text")`. It returns a layer ID such as `basicShape#1`.
- `api.set(layerId, {attr: value, ...})` sets many attributes at once, e.g. `{"fontSize": 72, "material.materialColor": "#ff0000"}`.
- `api.get(layerId, attrPath)`, e.g. `api.get("basicShape#1", "position")`.
- `api.connect(fromLayer, fromAttr, toLayer, toAttr)` wires attributes together, e.g. a Sub-Mesh into a Text layer's `deformers`.
- Keyframing functions. `api.getSelectedKeyframeIds()` returns the selected keyframes.
- `api.getCompLayers(topLevelOnly)`, `api.getChildren(layerId)`, and the selection getters and setters.
- `api.renderPNGFrame(filePath, scalePercent)` renders the current frame to PNG. It is useful for visual feedback in an AI loop.
- `api.getAllLayerTypes()` and `api.getAttributeDefinition(...)` let you **discover node types and attributes at runtime**, so you do not need to hard-code them.
- **Web:** `new api.WebClient(...)` makes blocking get, post and put requests. `new api.WebServer()` followed by `server.listen("localhost", port)` starts a server, and `addCallbackObject({ onPost(){...} })` handles requests. This is how every external bridge works.
- **UI module:** buttons with `onClick`, `ui.openSceneDialog()`, `addCallbackObject`, and `setCallbacksActive(false)`.
- UI scripts go in the Scripts folder (Help > Show Scripts Folder): `~/Library/Application Support/Cavalry/Scripts/` on macOS and `%APPDATA%\Cavalry\Scripts\` on Windows. Once there they appear in the Scripts menu.

### Developer ecosystem
- **Stallion** (scenery-io/stallion) is a VS Code extension. It sends code to a Cavalry-side script by HTTP POST to the hard-coded address `127.0.0.1:8080/post`, using JSON `{type, code, path}`. The `type` field takes values such as `script`, `javaScriptShape`, `skslShader` and `renderSetupExpression`. Output goes to Cavalry's Log Window.
- **@scenery/cavalry-types** (npm) provides TypeScript definitions for the scripting API.
- **Third-party MCP servers:** DonaldEOgbame/cavalry-MCP, kacperchlebowicz/Cavalry-mcp, ZHUYUFAN3-33/cavalry-mcp, hralet1/cavalry-assistant, and a paid one from splines.me. The common design is:
  `MCP client ⇄ (JSON-RPC over stdio) ⇄ Node/TS MCP server ⇄ (HTTP POST 127.0.0.1:8080) ⇄ bridge.js running as a Cavalry UI script using api.WebServer`.
  Lessons documented in those projects:
  - Find types and attributes at runtime with `api.getAllLayerTypes()` and `api.getAttributeDefinition()`. One server reported 436 node types and 3,168 attributes.
  - Keep a `raw_script` escape hatch, disabled by default.
  - Use an `expectedRevision` guard so the AI does not overwrite edits a human makes at the same time.
  - Use timeouts of about 15 s or more, because WebClient calls block.
  - The bridge's status window must stay open.
  - Some features are not scriptable (as of 2.7.2): Camera Guides, Editable Path morphing, HEVC/ProRes audio export, and tags.
  - Avoid a port conflict on 8080 with Stallion.

### Implications for this repo
1. **Native MCP is now built in (2.8).** Before building anything, read the "AI Automation with Claude" page and decide whether Cavalry-MCP should (a) add to the native server, for example with higher-level motion-design tools, recipes, presets and render pipelines, (b) support users on Cavalry ≤ 2.7, or (c) offer things the native one does not, such as batch and data pipelines, CLI rendering, Web Player output or visual QA.
2. If you build a bridge yourself, follow the proven pattern above. Do not use port 8080 by default; make the port configurable.
3. Prefer **discovery over hard-coding**, **batch operations** (one `api.set` with many keys), and **PNG frame previews** so the agent can see its own result.

---

## 5. Typical workflows

1. **Procedural system (the core Cavalry workflow).** Make one base shape, add a Duplicator and Distribution, attach Behaviours (Stagger, Random, Noise) that read the index context, limit them with Falloffs, and keyframe only a few "master" values.
2. **Kinetic typography.** Text Shape, Sub-Mesh or per-character splitting, Stagger and Oscillator, then Magic Easing.
3. **Data visualisation and versioning.** Spreadsheet asset, Spreadsheet Utilities (one per column), then connect them to bar heights, text, colours and the Formatted String Generator for labels and file names. Render every row through the Render Queue with tokens. With Google or Canva Sheets the scene updates live.
4. **Templates and rigs.** Build a Composition, expose its controls with Pre-Comp Overrides, Components and the Control Centre, then reuse it as Pre-Comps or Referenced scenes. Hand it to clients or teammates.
5. **Character work.** Rubber Hose limbs, Lattice and Four Point Warp, Mesh Shape and Rig Control.
6. **2.5D scenes.** Add a Camera (Freeform or Look At), set layers' Z depth, add Camera Guides and motion blur.
7. **Export for web and apps.** Lottie for UI animation, SVG or WebM for the web, and the Web Player for interactive graphics. For video, use ProRes or PNG/EXR sequences for compositing in AE, Nuke or Resolve.
8. **Automation.** UI scripts and Render Scripts, the CLI for headless batch rendering (Enterprise), and MCP for AI-driven edits.

---

## 6. Good practice

**Thinking and structure**
- **Think in systems, not layers.** If you are copying a shape by hand more than twice, use a Duplicator. If you are keyframing the same motion on many items, use Behaviours with Stagger.
- **Keep one source of truth.** Use Pre-Comps, Referencing and Components instead of copied layers. Change something once and every instance updates.
- **Expose a small control surface.** Put the 5 to 10 attributes that matter in the Control Centre or as Pre-Comp Overrides, so other people (and AI agents) can adjust the scene without opening its internals.
- **Name layers and group them logically.** Layer IDs (`basicShape#3`) mean nothing on their own, and scripts, overrides and the Dependency Graph are far easier to read with good names.
- **Check the Dependency Graph** when connections stop making sense.

**Animation**
- Keyframe a few master values and drive the rest procedurally. Use Magic Easing or the Graph Editor for polish instead of linear default curves.
- Use **Layer Seed** and Random seeds on purpose, so "random" results can be repeated and art-directed.
- Use **Falloffs** to localise effects instead of animating strengths by hand.
- Preview all the time. Playback is real-time, so judge timing in motion, not on a still frame.
- Animate with restraint. Motion should add meaning, not noise.

**Data**
- Clean the spreadsheet first (headers, types, no merged cells) and keep one column per Spreadsheet Utility.
- Use the Formatted String Generator and render tokens to name versioned outputs.
- Store the data file next to the scene, or use Export as Project, so links do not break.

**Performance**
- Use **Skip Invisible Duplicates** on heavy Duplicators, lower Viewport Quality while working, and set RAM caps for image and video caches in Preferences.
- Prefer native Behaviours over JavaScript Layers for per-frame maths. JS runs on every evaluation (this is the author's reasoning, not documented).
- Use **File > Reduce Scene** before you hand off or archive.
- For export, try CPU and GPU render engines; a weak integrated GPU can be slower than the CPU.

**Scripting and automation**
- Batch attribute changes into one `api.set` call. Discover attribute paths with `api.getAttributeDefinition` or by inspecting the Attribute Editor instead of guessing.
- Keep JS Layer code pure and deterministic (input to output). Put scene changes in Editor or UI scripts.
- Use Presets for repeated set-ups, and Render Scripts for pre- and post-render automation.
- Version your scenes with save increments or git for `.cv` plus assets, especially before running automated or AI-driven edits.

---

## 7. Bad practice and common pitfalls

- **Working the After Effects way:** stacking dozens of hand-keyed copies, deep parenting chains, and nesting comps only to organise them. You lose the procedural advantage.
- **Keyframing duplicates one by one** instead of driving them with index-aware behaviours.
- **Expecting expressions everywhere.** In Cavalry you usually make a *connection*. Reach for a JS Layer only when no native node does the job.
- **Using `api.` inside JavaScript Layers.** It is only available in the Editor and UI scripts. Layers get `ctx.` and `cavalry.`.
- **Wiring several columns into one Spreadsheet Utility.** It outputs one column.
- **Huge Duplicator counts or particle systems at full viewport quality**, nested Duplicators without Skip Invisible, and unlimited caches. All of these slow playback badly.
- **Unseeded randomness** that changes when you rebuild the scene, or "magic numbers" buried deep in a rig instead of exposed controls.
- **Absolute asset paths and loose files**, which break on another machine. Use Export as Project.
- **Leaving unused comps and assets in the scene.** Use Reduce Scene.
- **Relying on old feature-tier information.** Since 2.7 everything for individuals is free. Only the Enterprise items (CLI, SSO) are gated.
- **Scripting gotchas:** WebClient calls block, so long requests freeze the UI. Port 8080 conflicts with Stallion and other tools. Bridge scripts stop when their window closes. Some features cannot be scripted (see §4).
- **Letting an AI agent edit a scene while a human is editing it** without a revision or conflict check.

---

## 8. Version timeline (highlights)

| Version | Date | Highlights |
|---|---|---|
| 1.0 | Aug 2020 | Launch |
| 1.1–1.4 | 2021–22 | Lottie export, Graph Editor and Magic Easing improvements, JS scripting grows |
| 2.0 | Feb 2024 | Cameras (2.5D), Pre-Comp Overrides, Components, tapered strokes, new particle system, background rendering |
| 2.1–2.2 | 2024 | Extract Sub-Meshes and more |
| 2.3 | 11 Dec 2024 | Presets, Multi-Viewports, Isolines, Contours to Sub-Meshes, Layer Seed, GIF export |
| 2.4 | 7 May 2025 | Dependency Graph, Mesh Shape, third-party native plugins, .xlsx, SkSL Filter, Camera Guide, Oscillator upgrades |
| 2.5 | 1 Oct 2025 | Referencing, planar Tracking, Export as Project, AV1 WebM, video with audio, 11 new filters, layout wrapping, API upgrades |
| 2.6 | 4 Feb 2026 | Editable motion paths, Manipulator, Lattice, Four Point Warp, Reduce Scene |
| 2.7 | 16 Apr 2026 | Part of Canva; all Pro features free; onboarding guides; snapping clips |
| 2.8 | 30 Sep 2026 | **Native MCP / AI automation**, AI Studio, Canva Sheets, Affinity import, Metaballs, Custom Dropdown, Lighting, Twist, Ripple and Curves filters, better SVG import |

---

## 9. Sources

Official docs (seen through search; not fetched directly):
- Docs home: https://cavalry.studio/docs/ (mirror: https://docs.cavalry.scenegroup.co/)
- Key concepts: [Context](https://cavalry.studio/docs/getting-started/key-concepts/context/), [Connections](https://cavalry.studio/docs/getting-started/key-concepts/connections/), [Composition](https://cavalry.studio/docs/nodes/shapes/composition/), [Pre-Comp Overrides](https://cavalry.studio/docs/nodes/shapes/composition/pre-comp-overrides/), [Referencing](https://docs.cavalry.scenegroup.co/user-interface/menus/window-menu/assets-window/referencing/)
- Nodes: [Duplicator](https://cavalry.studio/docs/nodes/shapes/duplicator/), [Behaviours](https://docs.cavalry.scenegroup.co/nodes/behaviours/), [Oscillator](https://cavalry.studio/docs/nodes/behaviours/oscillator/), [Falloff](https://cavalry.studio/docs/nodes/utilities/falloff/), [Spreadsheet](https://docs.cavalry.scenegroup.co/nodes/utilities/spreadsheet/), [Formatted String Generator](https://docs.cavalry.scenegroup.co/nodes/utilities/string-generator/formatted-string-generator/), [Index Context](https://cavalry.studio/docs/nodes/utilities/index-context/), [Particle Emitter](https://cavalry.studio/docs/nodes/utilities/particle-emitter/), [SkSL Filter](https://cavalry.studio/docs/nodes/effects/filters/sksl-filter/)
- UI: [Attribute Editor](https://docs.cavalry.scenegroup.co/user-interface/menus/window-menu/attribute-editor/), [Graph Editor](https://docs.cavalry.scenegroup.co/user-interface/menus/window-menu/scene-window/graph-editor/), [Time Editor](https://cavalry.studio/docs/user-interface/menus/window-menu/scene-window/time-editor/), [Render Manager](https://cavalry.studio/docs/user-interface/menus/window-menu/render-manager/), [Lottie Export](https://cavalry.studio/docs/user-interface/menus/window-menu/render-manager/lottie-export/), [Preferences](https://docs.cavalry.scenegroup.co/user-interface/menus/window-menu/preferences/)
- Scripting: [Getting Started](https://cavalry.studio/docs/tech-info/scripting/scripting-getting-started/), [API Module](https://cavalry.studio/docs/tech-info/scripting/api-module/), [Cavalry Module](https://cavalry.studio/docs/tech-info/scripting/cavalry-module/), [Context Module](https://cavalry.studio/docs/tech-info/scripting/context-module/), [Script UIs](https://cavalry.studio/docs/tech-info/scripting/script-uis/), [Web APIs](https://cavalry.studio/docs/tech-info/scripting/web-apis/), [Render Scripts](https://docs.cavalry.scenegroup.co/tech-info/scripting/render-scripts/), [Example Scripts](https://cavalry.studio/docs/tech-info/scripting/example-scripts/), [JavaScript Layers](https://cavalry.studio/docs/nodes/general/javascript-layers/)
- Apps: [Cavalry CLI](https://docs.cavalry.scenegroup.co/applications/cavalry-cli/), [Cavalry Player](https://cavalry.studio/docs/applications/cavalry-player/), [Web Player](https://cavalry.studio/docs/web-player/), [AI Automation with Claude](https://cavalry.studio/docs/tips/ai-automation-with-claude/), [Licence Types](https://cavalry.studio/docs/tech-info/licensing/licence-types/)
- Release notes: [2.3](https://cavalry.studio/docs/tech-info/release-notes/2.3/2-3-0-release-notes/), [2.4](https://cavalry.studio/docs/tech-info/release-notes/2.4/2-4-0-release-notes/), [2.5](https://cavalry.studio/docs/tech-info/release-notes/2.5/2-5-0-release-notes/), [2.6](https://docs.cavalry.scenegroup.co/tech-info/release-notes/2.6/2-6-0-release-notes/), [2.7](https://cavalry.studio/docs/tech-info/release-notes/2.7/2-7-0-release-notes/), [2.8](https://cavalry.studio/docs/tech-info/release-notes/2.8/2-8-0-release-notes/)

Press, tutorials and community:
- [CG Channel: Cavalry 2.6](https://www.cgchannel.com/2026/02/scene-group-releases-cavalry-2/), [CG Channel: Canva makes Cavalry free](https://www.cgchannel.com/2026/04/canva-makes-motion-graphics-and-animation-app-cavalry-free/), [Digital Production: 2.5](https://digitalproduction.com/2025/10/13/cavalry-2-5-adds-referencing-tracking-luminance-blur-and-more/), [Lesterbanks: Cavalry 2 launch](https://lesterbanks.com/2024/02/cavalry-2-launches-with-cameras-pre-comp-overrides-and-components-and-more/), [Creative Bloq: origin story](https://www.creativebloq.com/features/cavalry-2d-motion-design-software)
- [School of Motion: 5 things beginners should know](https://schoolofmotion.com/blog/getting-started-with-cavalry-5-things-every-beginner-should-know), [School of Motion: Houdini of 2D](https://schoolofmotion.com/blog/cavalry-houdini-of-2d-after-effects), [MotionCircles: data-driven animation](https://motioncircles.com/knowledge/data-driven-animation-in-cavalry-connect-data-to-motion/), [MotionCircles: export guide](https://motioncircles.com/knowledge/how-to-export-from-cavalry-for-web-and-social-media/), [kamilk: Index Context](https://www.kamilk.co.uk/2025/12/lets-learn-about-index-context-in-cavalry/), [Envato: why switch](https://elements.envato.com/learn/cavalry-motion-graphics)
- Developer: [scenery-io/stallion](https://github.com/scenery-io/stallion), [scenery-io/cavalry-types](https://github.com/scenery-io/cavalry-types), [DonaldEOgbame/cavalry-MCP](https://github.com/DonaldEOgbame/cavalry-MCP), [kacperchlebowicz/Cavalry-mcp](https://github.com/kacperchlebowicz/Cavalry-mcp), [ZHUYUFAN3-33/cavalry-mcp](https://github.com/ZHUYUFAN3-33/cavalry-mcp), [sammularczyk/easey](https://github.com/sammularczyk/easey)
