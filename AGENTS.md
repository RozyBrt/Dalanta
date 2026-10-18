# AI Agent Instructions & Guidelines for Dalanta

## Project Overview
Dalanta is a lightweight, mobile-first local courier & on-demand delivery web app designed for home-based online sellers (e.g. Facebook marketplace sellers) and personal buyers.

## Key Reference Documents
- **PRD**: `docs/local_courier_app_prd.pdf`
- **Progress & Roadmap Tracker**: `PROGRESS.md`

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.agents/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.agents/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.agents/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.agents/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.agents/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.agents/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->

## Anti-Slop UI & Design Principles for Dalanta
1. **Aesthetic Intentionality**:
   - Avoid generic AI-template aesthetics (random purple gradients on dark backgrounds, glassmorphism without purpose).
   - Use a focused, cohesive color palette tailored to a local courier / errand service (high contrast, crisp typography, clean status badges).
2. **Authentic Microcopy (No AI Slop Text)**:
   - Avoid buzzwords like "Transform your logistics", "Supercharge your business", or "Next-gen delivery".
   - Use straightforward, human Indonesian suitable for local sellers and buyers: "Kirim Paket", "Titip Beli", "Alamat Penjemputan", "Kirim ke WhatsApp".
3. **Ergonomic Mobile Layout**:
   - Touch targets must be comfortably tappable on mobile screens (minimum 44x44px).
   - Input forms must not break or hide under on-screen keyboards.
4. **Code Hygiene**:
   - Zero boilerplate comments that state the obvious (e.g. `// State for order`).
   - Clean, readable React code with proper prop typing and meaningful names.

## Architecture & Code Conventions
1. **Framework**: React 19 + Vite.
2. **Styling**: Tailwind CSS v4.
3. **Hybrid Interaction Strategy**:
   - Always maintain both options: Self-service digital form AND direct WhatsApp ordering.
   - WhatsApp message triggers should generate clear, pre-formatted order templates.
4. **Order Status Lifecycle**:
   - Orders must transition strictly through: `pending` -> `picking_up` -> `delivering` -> `completed`.
5. **Progress Updates**:
   - When completing features or milestone tasks, update `PROGRESS.md` to keep the project state current.
