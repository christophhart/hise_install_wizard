# Feature Ideas

This file contains ideas about new features / changes to the web app and should be used as guideline when implementing these.

---

## Implementation Order & Difficulty Summary

| Priority | Feature | Difficulty | Estimated Time |
|----------|---------|------------|----------------|
| 1 | Feature 4: Consistent Page Layout | **Low** | 0.5-1 day |
| 2 | Feature 3: Easy Mode / Dev Mode | **Medium** | 1.5-2 days |
| 3 | Feature 2: IDE Toolset Workflow | **Medium** | 1.5-2 days |
| 4 | Feature 1: AI Agent Mode | **High** | 3-4 days |

**Total Estimated Time:** 6.5-9 days

**Rationale for Order:**
1. Feature 4 is a quick win that improves the foundation for other features
2. Feature 3 establishes content architecture useful for Feature 1
3. Feature 2 simplifies scripts and is needed before Feature 1
4. Feature 1 is most complex and builds on a cleaner codebase

---

## Feature 1: AI Agent Mode

**Difficulty: High (3-4 days)**

In addition to the user running the generated script files in the Powershell / terminal, it can also output a prompt that the user can paste into an AI coding agent which will perform the same steps but with guidance from the agent. This will help spot trivial mistakes and automatically fix it without having to troubleshoot manually.

### User Flow

At the beginning of the setup page, the user can switch between Terminal / AI agent mode. This setting will then be used across the web app to determine the style of the output:

- All commands in the setup page that query the current system stats will use either the CLI command for the given OS (Terminal mode) or a simple prompt (eg. "Check if GIT is installed and print out a simple "Yes" or "No" as response).

- The autodetect components mode will show a prompt that checks all tickboxes (just like the terminal command) and then prints out a response with the same format as the terminal command.

> Note that the agent is supposed to be run with the HISE repository as work directory so this should somehow be validated before doing any work.

- on the generate script page, the instructions will not show how to run the script in the terminal, but how to setup the AI agent to perform these steps:
  - must validate that the AI agent is in the HISE repo as work directory
  - must validate that the AI agent has admin read & write privilege and is not in
    plan (read-only) mode

- The script preview should not contain a terminal script, but the exact prompt that the user can paste into the AI agent. This should then use a simple markdown syntax highlighter. The download option should be greyed out in this case as we're only using the paste workflow

### Decisions Made

- **Prompt Structure:** Single comprehensive prompt with all steps (agent runs everything sequentially)
- **Agent Selection:** Dropdown selector to choose target agent (Generic, Claude, Cursor, OpenCode, etc.) with tailored prompts per agent
- **Work Directory:** Prompt includes explicit path validation step
- **Detection Format:** AI agent responds in same comma-separated format (`git,compiler,hiseRepo,...`) for consistency

### TODO List

| # | Task | Status |
|---|------|--------|
| 1.1 | Add `executionMode` and `agentType` state fields to WizardContext | Pending |
| 1.2 | Create ModeSelector component (Terminal/Agent toggle at top of setup page) | Pending |
| 1.3 | Create AgentSelector sub-component (dropdown when Agent mode active) | Pending |
| 1.4 | Create prompt templates directory (`lib/prompts/templates/`) | Pending |
| 1.5 | Create generic agent prompt template (base prompt for any agent) | Pending |
| 1.6 | Create agent-specific prompt variants (Claude, Cursor, OpenCode, etc.) | Pending |
| 1.7 | Update ComponentChecklist for agent mode (natural language detection prompt) | Pending |
| 1.8 | Create prompt generator (similar to script generator but outputs markdown) | Pending |
| 1.9 | Add `/api/generate-prompt` endpoint | Pending |
| 1.10 | Update generate page for agent mode (show prompt preview instead of script) | Pending |
| 1.11 | Update ScriptPreview component for markdown rendering mode | Pending |
| 1.12 | Disable download button in agent mode (gray out, keep copy) | Pending |
| 1.13 | Update "How to run" instructions for agent-specific setup | Pending |
| 1.14 | Add work directory validation step to generated prompts | Pending |
| 1.15 | Add admin/write access validation step to generated prompts | Pending |

---

## Feature 2: IDE Toolset Installation Workflow

**Difficulty: Medium (1.5-2 days)**

Installing the IDE toolset (VS2026 / Xcode) is a very long process that requires a lot of user interaction. I would like to move that out of the automatic script process and offer the user a download link with a simple instruction to just download & install the IDE toolkit **before** running the script. It can use the UI component that shows the planned steps and instead of "Will run" you can add a download / external link button to the URL of the download. This should be used for installing these tools:

- VS2026 Community Edition (Windows)
- IPP (Windows)
- XCode / command line tools (macOS)

Then the instruction list should be updated and tell the user to download & run the installers before proceeding with executing the automated part. Ideally it should add the UI component that checks the availability of the IDE tools from the setup page again so people can confirm this before moving on.

### Decisions Made

- **Location:** Download buttons appear inline in SetupSummary phase list (instead of "Will Run" status)
- **Verification:** Show warning if IDE not verified, but allow user to proceed anyway
- **Linux:** Keep automated `apt-get install` approach (reliable and non-interactive)

### TODO List

| # | Task | Status |
|---|------|--------|
| 2.1 | Define manual installation phases (VS2026, IPP, Xcode) with download URLs | Pending |
| 2.2 | Add download URL configuration to phase definitions | Pending |
| 2.3 | Update SetupSummary component with "Download" button variant for manual phases | Pending |
| 2.4 | Create download link styling (match phase row styling with external link icon) | Pending |
| 2.5 | Add IDE verification UI section on generate page | Pending |
| 2.6 | Update Windows script template (remove VS installation, add pre-requisite check only) | Pending |
| 2.7 | Update macOS script template (remove Xcode installation prompts, add check only) | Pending |
| 2.8 | Update instructions text (tell user to install IDEs before running script) | Pending |
| 2.9 | Add warning Alert for missing IDE (non-blocking) | Pending |
| 2.10 | Update phase skip logic (manual phases don't appear in skipPhases array) | Pending |

---

## Feature 3: Easy Mode / Dev Mode

**Difficulty: Medium (1.5-2 days)**

I would like to optimize the wording of the explanations of each step a bit. Ideally we would have two modes:

1. Easy mode. Assume that the developer does not have experience with setting up development environments or terminal usage so explain these steps more thoroughly.
2. Dev mode. Assume that the developer already has used terminal commands and give precise information about what each step will do.

These modes should be switchable at the beginning of the setup page.

### Decisions Made

- **Scope:** Mode affects component descriptions, auto-detect instructions, "How to run" instructions, and general page copy (NOT script comments)
- **Default:** Easy Mode is the default for new users
- **Persistence:** Mode resets each session (no localStorage)

### TODO List

| # | Task | Status |
|---|------|--------|
| 3.1 | Add `explanationMode: 'easy' \| 'dev'` state field to WizardContext | Pending |
| 3.2 | Create ExplanationModeSelector component (toggle at top of setup page) | Pending |
| 3.3 | Create content strings file (`lib/content/explanations.ts`) | Pending |
| 3.4 | Write Easy Mode content (beginner-friendly explanations for all elements) | Pending |
| 3.5 | Write Dev Mode content (concise, technical explanations) | Pending |
| 3.6 | Update ComponentChecklist to use mode-aware descriptions | Pending |
| 3.7 | Update auto-detect instructions to use mode-aware text | Pending |
| 3.8 | Update "How to run" instructions on generate page | Pending |
| 3.9 | Update general page copy (headers, intro text, tips) | Pending |
| 3.10 | Create `useExplanation` hook (helper to get mode-appropriate text) | Pending |

---

## Feature 4: Consistent Page Layout

**Difficulty: Low (0.5-1 day)**

I noticed that the UI components that give additional information are not consistently styled (eg. the Tip with the File explorer looks differently than than the "How it works" for the Auto-Detect Component feature). Also I notice that the order in the page layout is sometimes backwards - eg. the Hint to check all components on the setup page is at the bottom while I would expect to read it before looking at the tick boxes.

### Decisions Made

- **Standard Style:** All hints/tips/info boxes should use Alert component style (colored left border with icon)
- **Information Order:** Context-dependent (some hints before, some after based on what makes sense)
- **Help Popup:** Convert to collapsible section with Alert styling (not inline, but expandable)

### TODO List

| # | Task | Status |
|---|------|--------|
| 4.1 | Audit current info box usage across all pages | Done |
| 4.2 | Document inconsistent patterns (elements not using Alert style) | Done |
| 4.3 | Convert ComponentChecklist popup to collapsible section with Alert styling | Done |
| 4.4 | Standardize setup page hints to use Alert component | Done |
| 4.5 | Standardize generate page hints to use Alert component | Done |
| 4.6 | Review information ordering for each section | Done |
| 4.7 | Fix setup page ordering (move component checklist hint above checkboxes) | Done |
| 4.8 | Create Collapsible wrapper component if needed | Done |
| 4.9 | Update Alert component if missing variants or props needed | Done (no changes needed) |
| 4.10 | Visual QA pass across all pages for consistency | Done |
