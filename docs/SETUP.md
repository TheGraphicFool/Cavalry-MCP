# Setup: run Cavalry-MCP and connect it to Claude

Cavalry-MCP is a local **stdio** MCP server written in Node.js. Claude starts it as a child process; nothing listens on a network port.

## 1. Requirements
- **Node.js 18 or newer.** Check with `node --version`.
- **The Cavalry docs dump**: a JSON file shaped `{ source, fetched, pageCount, pages: [{ url, path, title, breadcrumbs, markdown }] }`, e.g. `cavalry-docs.json`.
  - **The dump is private.** It is never committed: `data/cavalry-docs.json` is in `.gitignore`.
  - **Recommended location:** outside the repo, e.g. `~/Documents/Cavalry/cavalry-docs.json` (macOS) or `C:\Users\<you>\Documents\Cavalry\cavalry-docs.json` (Windows).
  - Inside the repo, `data/cavalry-docs.json` works too; git ignores it.

## 2. Install and build
```bash
git clone https://github.com/TheGraphicFool/Cavalry-MCP.git
cd Cavalry-MCP
npm install
npm run build
```

## 3. Check that it can find and index the docs
```bash
node dist/src/index.js --docs ~/Documents/Cavalry/cavalry-docs.json --check
# cavalry-mcp 0.2.0: 3112 sections from 534 pages (…/cavalry-docs.json, fetched 2026-10-02…)
# API symbols: 607
```
The server looks for the docs in this order:
1. `--docs <path>`
2. the `CAVALRY_DOCS` environment variable
3. `<repo>/data/cavalry-docs.json`

Optionally run `npm test`. Tests that need the dump are skipped if it isn't found; set `CAVALRY_DOCS` to point them at it.

You need the **absolute paths** of two files for the config below:
- the server: `<repo>/dist/src/index.js`
- the docs dump

---

## 4a. Connect to Claude Desktop
1. Open **Claude Desktop → Settings → Developer → Edit Config**. This opens `claude_desktop_config.json`:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add the server under `mcpServers`. Merge it with any servers already listed.

**macOS**
```json
{
  "mcpServers": {
    "cavalry-docs": {
      "command": "node",
      "args": [
        "/Users/you/Cavalry-MCP/dist/src/index.js",
        "--docs",
        "/Users/you/Documents/Cavalry/cavalry-docs.json"
      ]
    }
  }
}
```

**Windows**: backslashes must be doubled in JSON.
```json
{
  "mcpServers": {
    "cavalry-docs": {
      "command": "node",
      "args": [
        "C:\\Users\\you\\Cavalry-MCP\\dist\\src\\index.js",
        "--docs",
        "C:\\Users\\you\\Documents\\Cavalry\\cavalry-docs.json"
      ]
    }
  }
}
```
3. **Quit Claude Desktop completely and reopen it.** Closing the window isn't enough.
4. Check that it's connected:
   - The tools icon or "Search and tools" menu in a chat should list **cavalry-docs** with 5 tools.
   - The **+** menu should offer its 3 prompts.
   - Ask: *"Use cavalry-docs to look up api.connect."*

### Use it alongside Canva's official Cavalry MCP
Cavalry 2.8+ comes with **Cavalry by Canva**, a Claude Desktop extension that controls the app. To install it, unzip `cavalry-mcp-server.zip` into Claude's Extensions folder and turn on *Preferences → Enable MCP Server* in Cavalry.

Both servers can be enabled at once, and they don't overlap:
- **Cavalry by Canva** acts on your open scene.
- **cavalry-docs** supplies exact API signatures and attribute paths, and checks scripts first.

Prompt Claude to use both. Examples are in [PROMPTING.md](PROMPTING.md).

## 4b. Connect to Claude Code (CLI)
```bash
claude mcp add --scope user cavalry-docs -- \
  node /Users/you/Cavalry-MCP/dist/src/index.js --docs /Users/you/Documents/Cavalry/cavalry-docs.json
claude mcp list        # should show cavalry-docs as connected
```
- `--scope user` makes it available in every project. Use `--scope project` to write a shareable `.mcp.json` instead. If you do, keep the docs path out of it, or pass `-e CAVALRY_DOCS=/path` and keep that machine-specific.
- In a session, `/mcp` shows the server status. The prompts appear as slash commands: `/mcp__cavalry-docs__cavalry_script`, `/mcp__cavalry-docs__cavalry_explain` and `/mcp__cavalry-docs__cavalry_setup_plan`.

## 4c. Any other MCP client
Run `node <repo>/dist/src/index.js --docs <dump>` as a stdio server. It logs to stderr and speaks MCP JSON-RPC on stdin/stdout.

---

## Updating
- **New docs snapshot:** replace the dump file and restart Claude. Indexing happens at startup and takes under half a second, so there's no rebuild step.
- **New code:** `git pull && npm install && npm run build`, then restart Claude.

## Troubleshooting
| Symptom | Fix |
|---|---|
| Server shows as failed / "spawn node ENOENT" | Claude Desktop can't find `node`. Use its full path as `command` (`which node` on macOS, `where node` on Windows), e.g. `/opt/homebrew/bin/node`. |
| "docs dump not found at …" in the MCP log | The `--docs` path is wrong or relative. Use an absolute path, and run the `--check` command from step 3 with the same path. |
| Tools missing after editing config | Fully quit and restart Claude Desktop. Check the JSON is valid (no trailing commas; doubled backslashes on Windows). |
| Where are the logs? | Claude Desktop: Settings → Developer → the server's log (macOS `~/Library/Logs/Claude/mcp-server-cavalry-docs.log`). Claude Code: `claude --debug` or `/mcp`. |
| Answers about very new features are missing | The dump is a snapshot. Its date shows in `--check` and in the server instructions. Refresh the dump. |
