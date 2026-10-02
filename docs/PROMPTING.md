# Prompting guide

How to get accurate Cavalry answers and working scripts from Claude with Cavalry-MCP connected. The server's tools are listed in [CAPABILITIES.md](CAPABILITIES.md).

---

## 1. How Claude uses the server
Claude decides when to call tools. Prompts that make it **look things up before answering** give the best results. The server's built-in instructions already tell Claude to:
1. search or look up first (`search_docs`, `lookup_api`),
2. read only the relevant sections (`read_doc`),
3. check any script with `validate_script`,
4. cite docs URLs.

Your prompt only needs to state the task clearly. Mentioning the server ("use cavalry-docs…") makes Claude far more likely to use it, especially in a chat that isn't obviously about Cavalry.

## 2. What a good prompt contains
| Part | Why it matters | Example |
|---|---|---|
| **Goal** | What should happen in the scene, not just "a script" | "stagger 12 circles in from the left, one every 3 frames" |
| **Where the code runs** | Decides which namespaces exist (`api` vs `ctx`) | "for the JavaScript Editor" / "as a JavaScript Utility expression" / "as a Render Script" |
| **What exists already** | Layer names and types the script must find | "the selected Text Shape", "all Rectangles in the active comp" |
| **Inputs and controls** | What should be adjustable | "expose count and spacing as sliders in a UI script" |
| **Output** | The form you want back | "a single script, then a 3-step test plan" / "steps with menu paths" |
| **Constraints** | Version, export target, performance | "must export to Lottie", "Cavalry 2.8", "keep it light for 2,000 duplicates" |

## 3. Using the prompt templates
- **Claude Desktop:** in the chat box choose **+ → cavalry-docs → prompt name**, fill in the fields and send.
- **Claude Code:** type `/mcp__cavalry-docs__cavalry_script`, then your task.

| Template | Use it for | Example input |
|---|---|---|
| `cavalry_script` | Any script or expression | task: *"Rename every selected layer to its layer type plus an index"*, context: `editor` |
| `cavalry_explain` | How-to and concept questions | question: *"How do I loop a pre-comp?"* |
| `cavalry_setup_plan` | Designing a procedural rig before building it | goal: *"An audio-reactive bar visualiser with 32 bars"* |

The templates spell out the full workflow (look up, write, validate, cite), so they give consistent results without a long prompt.

---

## 4. Recipes

### 4.1 JavaScript Editor scripts (one-off automation)
> Using cavalry-docs, write a JavaScript Editor script that creates a 5×5 grid of rounded rectangles using a Duplicator with a Grid Distribution, then adds a Stagger behaviour that offsets their scale. Look up every api function first, check the script with validate_script, then give me the script and the docs links.

Tips:
- Ask for **attribute changes batched into one `api.set` call**, the way the docs' own examples do.
- Ask Claude to **find the attribute paths on the node's docs page** (e.g. the Duplicator page lists its attributes) rather than guess them. Paths such as `material.materialColor` and `position.x` are case-sensitive.
- If you have an existing layer, give its **layer id**: right-click > *Copy Layer Id*. For an attribute, right-click > *Copy Scripting Path*.

### 4.2 UI tools for the Scripts menu
> Build a Cavalry UI script (ui.* widgets) with a Slider for "count" (1–50), a ColorChip for colour and a Button "Build" that creates that many circles in a row using api.primitive. Check it with validate_script in the editor context. Tell me where to save it so it appears in the Scripts menu.

Expected answer: a script using `ui.Slider`, `ui.ColorChip`, `ui.Button`, `ui.add`, `ui.show`, saved as `.js` in `~/Library/Application Support/Cavalry/Scripts` (macOS) or `%APPDATA%\Cavalry\Scripts` (Windows).

### 4.3 Expressions in JavaScript Layers
State the layer type, the input variables (`n0`, `n1`… or the names you gave them), and what it connects to.
> Write a JavaScript Utility expression that outputs a colour per duplicate: use ctx.index and ctx.count to blend from #ff3366 to #3366ff. It will be connected to a Duplicator's shape colour. Validate it in the "layer" context; there's no api.* in layers.

For a **JavaScript Deformer**, say so; it adds `def.*` (e.g. `def.getPoints`, `def.setPoints`):
> Write a JavaScript Deformer that pushes each point outward by sin(time) * 20. Validate with context "deformer".

### 4.4 Render Scripts and batch variants
> Using cavalry-docs, explain Dynamic Rendering, then write a pre-render Render Script that logs the current Dynamic Index (api.getDynamicIndex). Validate it with context "render". Also list the Render Tokens I can use to name each file by spreadsheet row.

### 4.5 How-to and concept questions
> According to the Cavalry docs, what's the difference between Pre-Comp Overrides and the Control Centre, and when should I use each? Cite the sections.

> How do I make a Text Shape follow a path in Cavalry? Give menu paths and attribute names.

Tip: ask for **"steps with exact menu paths and attribute names"**, which are much more useful than a summary.

### 4.6 Planning a procedural setup
> Plan a Cavalry setup for a looping kinetic-type intro: the word "MOTION" with each character bouncing in, offset by index, colour from a palette. List the layers, every connection (layer.attribute → layer.attribute), what to expose in the Control Centre, and Lottie export caveats.

### 4.7 Checking code from elsewhere
> Here's a script from a forum. Run validate_script on it (editor context), explain every issue, and fix it using the documented API:
> ```js
> var l = api.createLayer("rectangle");
> api.Set(l, {"Position.X": 100});
> ```

Expected result:
- `api.createLayer` is flagged as not in the docs, with `api.create` suggested.
- `api.Set` is flagged for wrong case.
- Claude also checks the attribute path, which the validator doesn't cover, using the docs (`position.x`).

### 4.8 "When did this arrive?" (versions)
> Which Cavalry version added Referencing and the Tracking tool? Check the release notes in cavalry-docs.

> Is getMagicEasing available in Cavalry 2.7? Check the release notes.

### 4.9 Using it with Canva's official Cavalry MCP (Cavalry 2.8+)
With both **Cavalry by Canva** (controls your scene) and **cavalry-docs** enabled:
> First use cavalry-docs to look up the exact attribute name for a Rectangle's corner radius. Then use the Cavalry MCP to add a Value layer and connect it to the corner radius of every Rectangle in the active composition.

> Write a reusable screen-print filter UI script. Look up the ui.* widgets and any api calls in cavalry-docs and run validate_script before handing it to the Cavalry MCP to create.

The order that works: **docs first (exact names), validate, then act.** That's why the two servers work well together.

---

## 5. Prompt patterns that help
- **"Look it up, don't guess."** For example: *"Confirm each function with lookup_api before using it."*
- **Name the context:** editor, layer, deformer or render. This one choice avoids the most common scripting mistake (`api.*` inside a JavaScript Layer).
- **Ask for citations**, e.g. "link the docs sections". It makes Claude read the docs, and lets you check the answer.
- **Paste the error.** If Cavalry's JavaScript Console shows an error, paste it with the script: *"Here's the console error; find the cause in the docs and fix it."*
- **Iterate in small steps.** Build the grid, check it in Cavalry, then add behaviours, then the UI.
- **Use the right Cavalry words:** Duplicator, Distribution, Behaviour, Falloff, Utility, Composition, Pre-Comp, Attribute Editor, Control Centre, Scene Tree. Search works best with the docs' own terms.

## 6. Things to avoid
| Avoid | Why | Do instead |
|---|---|---|
| "Write a Cavalry script" with no context | Claude has to guess the namespace and target layers | Say where it runs and what it acts on |
| Asking for After Effects-style expressions | Cavalry uses connections, Behaviours, ExprTk attribute expressions or JS Layers instead | "Do this with connections/Behaviours; use a JS Layer only if needed" |
| Accepting scripts that weren't validated | Invented functions like `api.createLayer` are common | Ask for `validate_script`, or use the `cavalry_script` template |
| Asking it to "open my scene" | This server can't see Cavalry | Use the Cavalry by Canva MCP, or paste layer ids and attribute paths |
| Very broad "explain all of Cavalry" | Reads lots of docs and gives shallow output | One feature or workflow per question |

## 7. Optional: a Claude Project for Cavalry work
In Claude Desktop, create a **Project** and paste this into its instructions so every chat follows the workflow:

```
You are a Cavalry (cavalry.studio) motion design and scripting assistant.
- Use the cavalry-docs tools for every Cavalry fact: lookup_api for functions,
  search_docs + read_doc for nodes, attributes, menus and workflows.
- Never invent API functions, layer types or attribute paths; if the docs don't
  show it, say so.
- Always state where code runs (JavaScript Editor/UI script, JavaScript Layer,
  JavaScript Deformer, Render Script) and run validate_script with that context
  before showing code. Fix all errors.
- Prefer procedural solutions (Duplicator, Behaviours, Falloffs, connections)
  over keyframing many layers by hand.
- End answers with the docs URLs used.
```

## 8. Quick examples
- *"cavalry-docs: what does api.getCompLayersOfType return and what are its arguments?"*
- *"Search the Cavalry docs for how Falloffs affect Behaviours and summarise in 5 bullets."*
- *"Which Cavalry features can't export to Lottie? Use the Lottie export docs."*
- *"Outline the Script UIs page and list all widget types."*
- *"Validate this JS Utility expression in the layer context: …"*
