# LinkedIn Outreach Copilot (Playwright Automation)

This tool automates the connection request and messaging process for the 56 verified European AI founders and executives from [`docs/RESEARCH_LEADS_41_100_VERIFICATION.md`](../../docs/RESEARCH_LEADS_41_100_VERIFICATION.md).

---

## 🛡️ Safety & Anti-Ban Architecture

1. **Persistent Session Context (`.linkedin_session/`)**:
   - Launches a real visible browser window.
   - You log in **once** manually (supporting 2FA / CAPTCHA).
   - Session cookies and storage are preserved locally and added to `.gitignore`. You never need to enter credentials again.
2. **Strict ≤ 300 Character Notes**:
   - LinkedIn has a strict 300-character limit on connection request notes.
   - All 56 messages in `leads.json` are pre-formatted to ≤ 285 characters so they never get truncated or blocked.
3. **Natural Human Emulation**:
   - Random keystroke delays (35ms–75ms).
   - Natural page scrolling and human-like delays (10s–25s in Copilot mode, 45s–75s in Auto mode).
4. **Daily Caps**:
   - Enforces a safety limit (default: 15 per session) to prevent triggering LinkedIn's weekly connection limits (~100–150/week).
5. **Progress Persistence (`outreach_tracker.json`)**:
   - Automatically tracks every lead (`pending`, `sent`, `skipped`, `already_pending`, `requires_email`).
   - You can stop (`q`) anytime and resume right where you left off.

---

## 🚀 How to Run

### 1. Human-in-the-Loop Copilot Mode (Recommended)
This mode opens each profile, clicks Connect -> Add note, pastes the pitch, and waits for your confirmation before sending:

```bash
npm run outreach:copilot
```

**Controls in Terminal:**
* `[Enter]` = Send invitation and proceed
* `[s]` = Skip this lead
* `[e]` = Edit the note directly in your terminal before sending
* `[q]` = Save progress and quit

---

### 2. Dry Run Mode (Test without sending)
Simulates navigation and typing the note, but dismisses the modal without submitting:

```bash
npm run outreach:dry-run
```

---

### 3. Fully Automated Mode
Sends automatically with 45–75s randomized delays between leads (up to the daily cap):

```bash
npm run outreach:auto
```

---

### 4. Custom Flags
* **Set custom daily limit:**
  ```bash
  npx tsx scripts/outreach/linkedin_copilot.ts --limit 10
  ```
* **Start from specific lead ID (e.g. #61):**
  ```bash
  npx tsx scripts/outreach/linkedin_copilot.ts --start 61
  ```
* **Reset progress tracker:**
  ```bash
  npx tsx scripts/outreach/linkedin_copilot.ts --reset
  ```
