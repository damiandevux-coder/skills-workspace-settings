import { WorkspaceSkill } from "@/types/skills";

/**
 * The bundled OpenClaw skill catalog (extracted from a live pod's /app/skills
 * SKILL.md frontmatter), ordered by relevancy. Popularity uses real ClawHub
 * download counts where known and estimates elsewhere.
 */
export const BUNDLED_SKILLS: WorkspaceSkill[] = [
  {
    "id": "github",
    "name": "github",
    "description": "GitHub CLI for issues, PRs, CI/check logs, comments, reviews, releases, repos, and gh api queries.",
    "category": "Platform",
    "emoji": "🐙",
    "requiresEnv": [],
    "requiresBins": [
      "gh"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 193000
  },
  {
    "id": "gog",
    "name": "gog",
    "description": "Google Workspace CLI for Gmail, Calendar, Drive, Contacts, Sheets, and Docs.",
    "category": "Productivity",
    "emoji": "🎮",
    "requiresEnv": [],
    "requiresBins": [
      "gog"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 189000
  },
  {
    "id": "weather",
    "name": "weather",
    "description": "Current weather and forecasts with wttr.in via curl for locations, rain, temperature, travel planning.",
    "category": "Lookups",
    "emoji": "☔",
    "requiresEnv": [],
    "requiresBins": [
      "curl"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 164000
  },
  {
    "id": "slack",
    "name": "slack",
    "description": "Slack tool actions: send/read/edit/delete messages, react, pin/unpin, list pins/reactions/emoji, member info.",
    "category": "Platform",
    "emoji": "💬",
    "requiresEnv": [],
    "requiresBins": [],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 152000
  },
  {
    "id": "summarize",
    "name": "summarize",
    "description": "Summarize or transcribe URLs, YouTube/videos, podcasts, articles, transcripts, PDFs, and local files.",
    "category": "Productivity",
    "emoji": "🧾",
    "requiresEnv": [],
    "requiresBins": [
      "summarize"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 141000
  },
  {
    "id": "gh-issues",
    "name": "gh-issues",
    "description": "Fetch GitHub issues, select candidates, spawn background fix agents, open PRs, and optionally process PR review comments.",
    "category": "Platform",
    "emoji": "🔧",
    "requiresEnv": [],
    "requiresBins": [
      "git",
      "gh"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 128000
  },
  {
    "id": "notion",
    "name": "notion",
    "description": "Notion CLI/API for pages, Markdown content, data sources, files, comments, search, Workers, and raw API calls.",
    "category": "Productivity",
    "emoji": "📝",
    "requiresEnv": [],
    "requiresBins": [
      "ntn",
      "curl"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 117000
  },
  {
    "id": "coding-agent",
    "name": "coding-agent",
    "description": "Delegate coding work to Codex, Claude Code, or OpenCode as background workers; not simple edits or read-only code lookup.",
    "category": "Authoring",
    "emoji": "🧩",
    "requiresEnv": [],
    "requiresBins": [
      "claude",
      "codex",
      "opencode"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 109000
  },
  {
    "id": "skill-creator",
    "name": "skill-creator",
    "description": "Create, edit, audit, tidy, validate, or restructure AgentSkills and SKILL.md files.",
    "category": "Authoring",
    "emoji": "🔧",
    "requiresEnv": [],
    "requiresBins": [],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 98000
  },
  {
    "id": "canvas",
    "name": "canvas",
    "description": "Present HTML on connected OpenClaw node canvases, navigate/eval/snapshot, and debug canvas host URLs.",
    "category": "System",
    "emoji": "🖼️",
    "requiresEnv": [],
    "requiresBins": [],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 91000
  },
  {
    "id": "discord",
    "name": "discord",
    "description": "Discord message-tool ops: send/read/edit/delete, react, poll, pin, thread, search, presence, media/components.",
    "category": "Platform",
    "emoji": "🎮",
    "requiresEnv": [],
    "requiresBins": [],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 87000
  },
  {
    "id": "taskflow",
    "name": "taskflow",
    "description": "Coordinate multi-step detached tasks as one durable TaskFlow job with owner context, state, waits, and child tasks.",
    "category": "Authoring",
    "emoji": "🪝",
    "requiresEnv": [],
    "requiresBins": [],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 82000
  },
  {
    "id": "gemini",
    "name": "gemini",
    "description": "Gemini CLI one-shot prompts, summaries, generation, skills, hooks, MCP, or Gemma routing.",
    "category": "Lookups",
    "emoji": "✨",
    "requiresEnv": [],
    "requiresBins": [
      "gemini"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 78000
  },
  {
    "id": "diagram-maker",
    "name": "diagram-maker",
    "description": "Create SVG/HTML or Excalidraw diagrams for concepts, architecture, flows, and whiteboards.",
    "category": "Authoring",
    "emoji": "🧭",
    "requiresEnv": [],
    "requiresBins": [],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 74000
  },
  {
    "id": "obsidian",
    "name": "obsidian",
    "description": "Work with Obsidian vaults using the official obsidian CLI: read/search/create/edit notes, tasks, links, properties, plugins.",
    "category": "Productivity",
    "emoji": "💎",
    "requiresEnv": [],
    "requiresBins": [
      "obsidian"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 69000
  },
  {
    "id": "trello",
    "name": "trello",
    "description": "Manage Trello boards, lists, and cards via the Trello REST API.",
    "category": "Productivity",
    "emoji": "📋",
    "requiresEnv": [
      "TRELLO_API_KEY",
      "TRELLO_TOKEN"
    ],
    "requiresBins": [
      "jq"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 64000
  },
  {
    "id": "healthcheck",
    "name": "healthcheck",
    "description": "Audit/harden OpenClaw hosts: SSH, firewall, updates, exposure, backups, disk encryption, gateway security.",
    "category": "System",
    "emoji": "🔧",
    "requiresEnv": [],
    "requiresBins": [],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 61000
  },
  {
    "id": "tmux",
    "name": "tmux",
    "description": "Control tmux sessions/panes for interactive CLIs: list, capture output, send keys, paste text, monitor prompts.",
    "category": "System",
    "emoji": "🧵",
    "requiresEnv": [],
    "requiresBins": [
      "tmux"
    ],
    "os": [
      "darwin",
      "linux"
    ],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 57000
  },
  {
    "id": "oracle",
    "name": "oracle",
    "description": "Oracle CLI second-model review/debug/refactor/design with selected files, dry-run token checks, API or browser engine.",
    "category": "Lookups",
    "emoji": "🧿",
    "requiresEnv": [],
    "requiresBins": [
      "oracle"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 54000
  },
  {
    "id": "1password",
    "name": "1password",
    "description": "Set up and use 1Password CLI for sign-in, desktop integration, and reading or injecting secrets.",
    "category": "General",
    "emoji": "🔐",
    "requiresEnv": [],
    "requiresBins": [
      "op"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 51000
  },
  {
    "id": "himalaya",
    "name": "himalaya",
    "description": "Himalaya CLI for IMAP/SMTP mail: list, read, search, compose, reply, forward, copy, move, delete.",
    "category": "Productivity",
    "emoji": "📧",
    "requiresEnv": [],
    "requiresBins": [
      "himalaya"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 47000
  },
  {
    "id": "xurl",
    "name": "xurl",
    "description": "xurl CLI for authenticated X posts, replies, reads/search, DMs, media upload, followers, auth status, or raw v2 API calls.",
    "category": "Lookups",
    "emoji": "🐦",
    "requiresEnv": [],
    "requiresBins": [
      "xurl"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 44000
  },
  {
    "id": "session-logs",
    "name": "session-logs",
    "description": "Search and analyze your own session logs (older/parent conversations) using jq.",
    "category": "System",
    "emoji": "📜",
    "requiresEnv": [],
    "requiresBins": [
      "jq",
      "rg"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 41000
  },
  {
    "id": "taskflow-inbox-triage",
    "name": "taskflow-inbox-triage",
    "description": "Example TaskFlow pattern for inbox triage, intent routing, waiting on replies, and later summaries.",
    "category": "Productivity",
    "emoji": "📥",
    "requiresEnv": [],
    "requiresBins": [],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 39000
  },
  {
    "id": "model-usage",
    "name": "model-usage",
    "description": "Summarize CodexBar local cost logs by model for Codex or Claude, including current or full breakdowns.",
    "category": "System",
    "emoji": "📊",
    "requiresEnv": [],
    "requiresBins": [
      "codexbar"
    ],
    "os": [
      "darwin"
    ],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 37000
  },
  {
    "id": "goplaces",
    "name": "goplaces",
    "description": "Query Google Places for text search, place details, resolve, reviews, or scriptable JSON via goplaces.",
    "category": "Lookups",
    "emoji": "📍",
    "requiresEnv": [
      "GOOGLE_PLACES_API_KEY"
    ],
    "requiresBins": [
      "goplaces"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 35000
  },
  {
    "id": "clawhub",
    "name": "clawhub",
    "description": "Search, install, update, sync, or publish agent skills with the ClawHub CLI and registry.",
    "category": "General",
    "emoji": "🔧",
    "requiresEnv": [],
    "requiresBins": [
      "clawhub"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 33000
  },
  {
    "id": "nano-pdf",
    "name": "nano-pdf",
    "description": "Edit PDFs with natural-language instructions using the nano-pdf CLI.",
    "category": "Media",
    "emoji": "📄",
    "requiresEnv": [],
    "requiresBins": [
      "nano-pdf"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 31000
  },
  {
    "id": "spotify-player",
    "name": "spotify-player",
    "description": "Terminal Spotify playback/search via spogo (preferred) or spotify_player.",
    "category": "Media",
    "emoji": "🎵",
    "requiresEnv": [],
    "requiresBins": [
      "spogo",
      "spotify_player"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 29000
  },
  {
    "id": "apple-notes",
    "name": "apple-notes",
    "description": "Create, view, edit, delete, search, move, or export Apple Notes via the memo CLI on macOS.",
    "category": "Productivity",
    "emoji": "📝",
    "requiresEnv": [],
    "requiresBins": [
      "memo"
    ],
    "os": [
      "darwin"
    ],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 27000
  },
  {
    "id": "apple-reminders",
    "name": "apple-reminders",
    "description": "List, add, edit, complete, or delete Apple Reminders and reminder lists via remindctl.",
    "category": "Productivity",
    "emoji": "⏰",
    "requiresEnv": [],
    "requiresBins": [
      "remindctl"
    ],
    "os": [
      "darwin"
    ],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 26000
  },
  {
    "id": "imsg",
    "name": "imsg",
    "description": "iMessage/SMS CLI for listing chats, history, and sending messages via Messages.app.",
    "category": "Platform",
    "emoji": "📨",
    "requiresEnv": [],
    "requiresBins": [
      "imsg"
    ],
    "os": [
      "darwin"
    ],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 24000
  },
  {
    "id": "wacli",
    "name": "wacli",
    "description": "Send third-party WhatsApp messages or sync/search WhatsApp history via wacli, not normal active chats.",
    "category": "Platform",
    "emoji": "📱",
    "requiresEnv": [],
    "requiresBins": [
      "wacli"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 23000
  },
  {
    "id": "voice-call",
    "name": "voice-call",
    "description": "Start voice calls via the OpenClaw voice-call plugin.",
    "category": "Platform",
    "emoji": "📞",
    "requiresEnv": [],
    "requiresBins": [],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 22000
  },
  {
    "id": "blogwatcher",
    "name": "blogwatcher",
    "description": "Monitor blogs and RSS/Atom feeds for updates using the blogwatcher CLI.",
    "category": "Lookups",
    "emoji": "📰",
    "requiresEnv": [],
    "requiresBins": [
      "blogwatcher"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 20000
  },
  {
    "id": "video-frames",
    "name": "video-frames",
    "description": "Extract frames or short clips from videos using ffmpeg.",
    "category": "Media",
    "emoji": "🎬",
    "requiresEnv": [],
    "requiresBins": [
      "ffmpeg"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 19000
  },
  {
    "id": "openai-whisper",
    "name": "openai-whisper",
    "description": "Local speech-to-text with the Whisper CLI (no API key).",
    "category": "Media",
    "emoji": "🎤",
    "requiresEnv": [],
    "requiresBins": [
      "whisper"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 18000
  },
  {
    "id": "openai-whisper-api",
    "name": "openai-whisper-api",
    "description": "OpenAI Audio Transcriptions API via curl; gpt-4o-transcribe, mini, diarize, or whisper-1.",
    "category": "Media",
    "emoji": "🌐",
    "requiresEnv": [
      "OPENAI_API_KEY"
    ],
    "requiresBins": [
      "curl",
      "node"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 17000
  },
  {
    "id": "meme-maker",
    "name": "meme-maker",
    "description": "Search meme templates, suggest formats, and generate local or hosted image memes.",
    "category": "Media",
    "emoji": "🖼️",
    "requiresEnv": [],
    "requiresBins": [
      "node"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 16000
  },
  {
    "id": "gifgrep",
    "name": "gifgrep",
    "description": "Search GIF providers with CLI/TUI, download results, and extract stills/sheets.",
    "category": "Media",
    "emoji": "🧲",
    "requiresEnv": [],
    "requiresBins": [
      "gifgrep"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 15000
  },
  {
    "id": "peekaboo",
    "name": "peekaboo",
    "description": "Capture and automate macOS UI with the Peekaboo CLI.",
    "category": "Hardware",
    "emoji": "👀",
    "requiresEnv": [],
    "requiresBins": [
      "peekaboo"
    ],
    "os": [
      "darwin"
    ],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 14000
  },
  {
    "id": "node-connect",
    "name": "node-connect",
    "description": "Diagnose OpenClaw Android, iOS, or macOS node pairing, QR/setup code, route, auth, and connection failures.",
    "category": "System",
    "emoji": "🔧",
    "requiresEnv": [],
    "requiresBins": [],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 13000
  },
  {
    "id": "node-inspect-debugger",
    "name": "node-inspect-debugger",
    "description": "Debug Node.js with node inspect, --inspect, breakpoints, CDP, heap, and CPU profiles.",
    "category": "Authoring",
    "emoji": "🪲",
    "requiresEnv": [],
    "requiresBins": [
      "node"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 12500
  },
  {
    "id": "python-debugpy",
    "name": "python-debugpy",
    "description": "Debug Python with pdb, breakpoint(), post-mortem inspection, and debugpy remote attach.",
    "category": "Authoring",
    "emoji": "🔧",
    "requiresEnv": [],
    "requiresBins": [
      "python3"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 12000
  },
  {
    "id": "spike",
    "name": "spike",
    "description": "Run throwaway prototypes to validate feasibility, compare approaches, and report a verdict.",
    "category": "Authoring",
    "emoji": "🧪",
    "requiresEnv": [],
    "requiresBins": [],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 11000
  },
  {
    "id": "mcporter",
    "name": "mcporter",
    "description": "List, configure, authenticate, call, and inspect MCP servers/tools with mcporter over HTTP or stdio.",
    "category": "System",
    "emoji": "📦",
    "requiresEnv": [],
    "requiresBins": [
      "mcporter"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 10500
  },
  {
    "id": "sag",
    "name": "sag",
    "description": "ElevenLabs text-to-speech with mac-style say UX.",
    "category": "Media",
    "emoji": "🔊",
    "requiresEnv": [
      "ELEVENLABS_API_KEY"
    ],
    "requiresBins": [
      "sag"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 10000
  },
  {
    "id": "sherpa-onnx-tts",
    "name": "sherpa-onnx-tts",
    "description": "Local text-to-speech via sherpa-onnx (offline, no cloud)",
    "category": "Media",
    "emoji": "🔉",
    "requiresEnv": [
      "SHERPA_ONNX_RUNTIME_DIR",
      "SHERPA_ONNX_MODEL_DIR"
    ],
    "requiresBins": [],
    "os": [
      "darwin",
      "linux",
      "win32"
    ],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 9500
  },
  {
    "id": "songsee",
    "name": "songsee",
    "description": "Generate spectrograms and feature-panel visualizations from audio with the songsee CLI.",
    "category": "Media",
    "emoji": "🌊",
    "requiresEnv": [],
    "requiresBins": [
      "songsee"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 9000
  },
  {
    "id": "bear-notes",
    "name": "bear-notes",
    "description": "Create, search, and manage Bear notes via grizzly CLI.",
    "category": "Productivity",
    "emoji": "🐻",
    "requiresEnv": [],
    "requiresBins": [
      "grizzly"
    ],
    "os": [
      "darwin"
    ],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 8500
  },
  {
    "id": "things-mac",
    "name": "things-mac",
    "description": "Add, update, list, search, or inspect Things 3 todos, inbox, today, projects, areas, and tags on macOS.",
    "category": "Productivity",
    "emoji": "✅",
    "requiresEnv": [],
    "requiresBins": [
      "things"
    ],
    "os": [
      "darwin"
    ],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 8000
  },
  {
    "id": "openhue",
    "name": "openhue",
    "description": "Control Philips Hue lights and scenes via the OpenHue CLI.",
    "category": "Hardware",
    "emoji": "💡",
    "requiresEnv": [],
    "requiresBins": [
      "openhue"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 7500
  },
  {
    "id": "sonoscli",
    "name": "sonoscli",
    "description": "Control Sonos speakers (discover/status/play/volume/group).",
    "category": "Hardware",
    "emoji": "🔊",
    "requiresEnv": [],
    "requiresBins": [
      "sonos"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 7000
  },
  {
    "id": "eightctl",
    "name": "eightctl",
    "description": "Control Eight Sleep pods (status, temperature, alarms, schedules).",
    "category": "Hardware",
    "emoji": "🛌",
    "requiresEnv": [],
    "requiresBins": [
      "eightctl"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 6500
  },
  {
    "id": "blucli",
    "name": "blucli",
    "description": "BluOS CLI (blu) for discovery, playback, grouping, and volume.",
    "category": "General",
    "emoji": "🫐",
    "requiresEnv": [],
    "requiresBins": [
      "blu"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 6000
  },
  {
    "id": "camsnap",
    "name": "camsnap",
    "description": "Capture frames or clips from RTSP/ONVIF cameras.",
    "category": "Hardware",
    "emoji": "📸",
    "requiresEnv": [],
    "requiresBins": [
      "camsnap"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 5500
  },
  {
    "id": "ordercli",
    "name": "ordercli",
    "description": "Foodora-only CLI for checking past orders and active order status (Deliveroo WIP).",
    "category": "General",
    "emoji": "🛵",
    "requiresEnv": [],
    "requiresBins": [
      "ordercli"
    ],
    "os": [],
    "installHints": [],
    "disabled": false,
    "hasScripts": false,
    "hasReferences": false,
    "hasAssets": false,
    "origin": "bundled",
    "popularity": 5000
  }
];
