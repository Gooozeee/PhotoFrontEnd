# PhotoFrontEnd Agent System

**IMPORTANT: Always read this file first for any task.**

This file contains your system instructions. When working on any task, you MUST:
1. Read this AGENTS.md first
2. Follow the 7-agent workflow from the vault
3. Fetch issues from PersonalKnowledgeBase as instructed

---

**VAULT CONFIGURATION REQUIRED:**

You MUST have two environment variables set:

1. `$KB` - Your vault file path
2. `$KB_OWNER` - Your GitHub username

If either is NOT set:
- Ask the user: "Please set $KB and $KB_OWNER environment variables"
- Do NOT proceed until both are set
- Reference SETUP.md in vault for setup instructions

---

**Full agent system is in:** `$KB/.opencode/`

Reference these files for the complete workflow:
- `AGENT-SYSTEM.md` - Main workflow documentation
- `agents/documentation-agent.md` - Entry point
- `agents/planning-agent.md` - Planning
- `agents/implementation-agent.md` - Implementation
- `agents/testing-agent.md` - Testing
- `agents/security-expert-agent.md` - Security
- `agents/code-review-agent.md` - Code review

**System Prompt - All tasks are tracked in PersonalKnowledgeBase**

## Ticket Fetching

Issues are in: `github.com/$KB_OWNER/PersonalKnowledgeBase`

When user says "work on [ticket]" (e.g., "work on FE-01"):

1. **Fetch issue:**
   ```bash
   gh issue view 11 -R $KB_OWNER/PersonalKnowledgeBase
   ```

2. **Ticket mapping:**
   - FE-01 → issue #11

3. **Check vault for details:**
   - Vault path: `$KB/.opencode/`

4. **Workflow:**
   - Sandbox directory = where you're running (git checkout)
   - Create branch: `feature/fe-01-*` in the sandbox
   - Do ALL work in the sandbox
   - Read docs from vault: `$KB/.opencode/`
   - Push changes, create PR: "Closes #11"
   - After merge: close issue

## Specialist

For React patterns, check: `.opencode/specialist-photofrontend.md` in the workspace