import { chromium, BrowserContext, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

interface Lead {
  id: number;
  name: string;
  first_name: string;
  role: string;
  company: string;
  linkedin_url: string;
  full_message: string;
  connection_note: string;
  note_length: number;
}

interface LeadStatus {
  status: 'pending' | 'sent' | 'skipped' | 'already_connected' | 'already_pending' | 'failed' | 'requires_email';
  timestamp?: string;
  note_sent?: string;
  error?: string;
}

type Tracker = Record<string, LeadStatus>;

const LEADS_FILE = path.join(__dirname, 'leads.json');
const TRACKER_FILE = path.join(__dirname, 'outreach_tracker.json');
const SESSION_DIR = path.resolve(process.cwd(), '.linkedin_session');

// Parse CLI flags
const args = process.argv.slice(2);
const IS_AUTO = args.includes('--auto');
const IS_DRY_RUN = args.includes('--dry-run');
const IS_RESET = args.includes('--reset');
const LIMIT_ARG_INDEX = args.indexOf('--limit');
const DAILY_LIMIT = LIMIT_ARG_INDEX !== -1 && args[LIMIT_ARG_INDEX + 1] ? parseInt(args[LIMIT_ARG_INDEX + 1], 10) : 15;
const START_ARG_INDEX = args.indexOf('--start');
const START_ID = START_ARG_INDEX !== -1 && args[START_ARG_INDEX + 1] ? parseInt(args[START_ARG_INDEX + 1], 10) : 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function loadTracker(leads: Lead[]): Tracker {
  if (IS_RESET && fs.existsSync(TRACKER_FILE)) {
    fs.unlinkSync(TRACKER_FILE);
    console.log('🔄 Tracker file reset.');
  }

  let tracker: Tracker = {};
  if (fs.existsSync(TRACKER_FILE)) {
    try {
      tracker = JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf-8'));
    } catch {
      tracker = {};
    }
  }

  for (const lead of leads) {
    if (!tracker[lead.id.toString()]) {
      tracker[lead.id.toString()] = { status: 'pending' };
    }
  }

  fs.writeFileSync(TRACKER_FILE, JSON.stringify(tracker, null, 2));
  return tracker;
}

function saveTracker(tracker: Tracker) {
  fs.writeFileSync(TRACKER_FILE, JSON.stringify(tracker, null, 2));
}

async function simulateHumanTyping(page: Page, selector: string, text: string) {
  await page.focus(selector);
  for (const char of text) {
    await page.keyboard.type(char, { delay: randomBetween(35, 75) });
  }
}

async function ensureLoggedIn(page: Page) {
  console.log('\n🔍 Verifying LinkedIn authentication status...');
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  await sleep(3000);

  const isLoggedIn = await page.evaluate(() => {
    return Boolean(
      document.querySelector('input[aria-label*="Search"]') ||
      document.querySelector('.global-nav__me') ||
      document.querySelector('.feed-identity-module') ||
      document.querySelector('nav.global-nav')
    );
  });

  if (isLoggedIn) {
    console.log('✅ Successfully authenticated with LinkedIn!');
    return;
  }

  console.log('\n' + '='.repeat(65));
  console.log('⚠️  NOT LOGGED IN: Please log in using the opened browser window.');
  console.log('1. Enter your LinkedIn email & password in the browser.');
  console.log('2. Complete 2FA / security verification if prompted.');
  console.log('3. Your session will be permanently saved in .linkedin_session/');
  console.log('='.repeat(65));

  await askQuestion('\n👉 Press [Enter] here once you are logged into your LinkedIn feed... ');

  await sleep(2000);
  console.log('✅ Proceeding with authenticated session...');
}

async function main() {
  console.log('\n' + '='.repeat(65));
  console.log('🚀 EU AI ACT COMPLIANCE CHECKER — LINKEDIN OUTREACH COPILOT');
  console.log('='.repeat(65));
  console.log(`• Mode:        ${IS_AUTO ? '⚡ Fully Automated' : '🛡️ Human-in-the-Loop Copilot (Recommended)'}`);
  console.log(`• Dry Run:     ${IS_DRY_RUN ? 'YES (Will not click Send)' : 'NO (Live Outbound)'}`);
  console.log(`• Session Cap: ${DAILY_LIMIT} invitations max this run`);
  console.log(`• Data Dir:    ${SESSION_DIR}`);
  console.log('='.repeat(65) + '\n');

  if (!fs.existsSync(LEADS_FILE)) {
    console.error(`❌ Error: ${LEADS_FILE} not found!`);
    process.exit(1);
  }

  const leads: Lead[] = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  const tracker = loadTracker(leads);

  // Launch persistent context with stealth settings
  const context: BrowserContext = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: false,
    viewport: { width: 1280, height: 850 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
    ],
  });

  const page = context.pages()[0] || (await context.newPage());

  await ensureLoggedIn(page);

  let sentCount = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];

    if (START_ID && lead.id < START_ID) {
      continue;
    }

    const currentStatus = tracker[lead.id.toString()]?.status;
    if (currentStatus === 'sent' || currentStatus === 'already_connected' || currentStatus === 'already_pending') {
      continue;
    }

    if (sentCount >= DAILY_LIMIT) {
      console.log(`\n🛑 Daily limit of ${DAILY_LIMIT} invitations reached! Pausing to protect account reputation.`);
      break;
    }

    console.log('\n' + '-'.repeat(65));
    console.log(`📌 [${i + 1}/${leads.length}] Lead #${lead.id}: ${lead.name}`);
    console.log(`🏢 ${lead.role} @ ${lead.company}`);
    console.log(`🔗 ${lead.linkedin_url}`);
    console.log('-'.repeat(65));
    console.log(`💬 Note (${lead.connection_note.length} chars):\n"${lead.connection_note}"`);
    console.log('-'.repeat(65));

    console.log(`🌐 Navigating to ${lead.name}'s profile...`);
    try {
      await page.goto(lead.linkedin_url, { waitUntil: 'domcontentloaded' });
      await sleep(randomBetween(2500, 4500));

      // Gentle natural scroll
      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
      await sleep(1500);
      await page.evaluate(() => window.scrollBy({ top: -200, behavior: 'smooth' }));
      await sleep(1000);

      // Check if already pending or connected
      const isPending = await page.locator('button:has-text("Pending")').isVisible({ timeout: 1500 }).catch(() => false);
      if (isPending) {
        console.log('ℹ️ Invitation is already pending for this contact. Skipping.');
        tracker[lead.id.toString()] = { status: 'already_pending', timestamp: new Date().toISOString() };
        saveTracker(tracker);
        continue;
      }

      // Find Connect button
      let connectBtn = page.locator('main section button:has-text("Connect"):visible').first();
      let hasDirectConnect = await connectBtn.isVisible({ timeout: 2000 }).catch(() => false);

      if (!hasDirectConnect) {
        // Try the "More" button in the top action card
        const moreBtn = page.locator('main section button[aria-label*="More actions"]:visible, main section button:has-text("More"):visible').first();
        if (await moreBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await moreBtn.click();
          await sleep(1000);

          const moreConnect = page.locator('div[role="button"]:has-text("Connect"):visible, div[role="menuitem"]:has-text("Connect"):visible, span:has-text("Connect"):visible').first();
          if (await moreConnect.isVisible({ timeout: 2000 }).catch(() => false)) {
            await moreConnect.click();
            hasDirectConnect = true;
          }
        }
      } else {
        await connectBtn.click();
      }

      if (!hasDirectConnect) {
        console.log('⚠️ Could not find "Connect" button (Profile might be 1st degree or InMail only).');
        tracker[lead.id.toString()] = { status: 'skipped', error: 'No Connect button found', timestamp: new Date().toISOString() };
        saveTracker(tracker);
        continue;
      }

      await sleep(1500);

      // Check if LinkedIn asks for email
      const asksEmail = await page.locator('input[type="email"]').isVisible({ timeout: 1500 }).catch(() => false);
      if (asksEmail) {
        console.log('⚠️ Profile requires an email address to connect. Skipping.');
        tracker[lead.id.toString()] = { status: 'requires_email', timestamp: new Date().toISOString() };
        saveTracker(tracker);
        const closeBtn = page.locator('button[aria-label="Dismiss"], button[aria-label="Close"]').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
        continue;
      }

      // Click "Add a note"
      const addNoteBtn = page.locator('button:has-text("Add a note"):visible, button[aria-label*="Add a note"]:visible').first();
      if (await addNoteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addNoteBtn.click();
        await sleep(1000);
      }

      // Type note into textarea
      const textarea = page.locator('textarea[name="message"], textarea#custom-message').first();
      if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('✍️ Typing personalized connection note...');
        await simulateHumanTyping(page, 'textarea[name="message"], textarea#custom-message', lead.connection_note);
      } else {
        console.log('⚠️ Note textarea not found.');
      }

      // Decision Gate: Copilot Mode vs Auto Mode
      let shouldSend = false;

      if (IS_AUTO) {
        shouldSend = true;
        console.log('⚡ Auto Mode enabled: Preparing to send...');
      } else {
        console.log('\n👉 Review in browser:');
        const answer = await askQuestion(
          '   [Enter] = Send invitation\n   [s]     = Skip this lead\n   [e]     = Edit note in terminal\n   [q]     = Quit\n   Choice: '
        );

        if (answer.toLowerCase() === 'q') {
          console.log('\n👋 Session paused by user. Progress saved!');
          break;
        } else if (answer.toLowerCase() === 's') {
          console.log('⏭️ Skipping this lead.');
          tracker[lead.id.toString()] = { status: 'skipped', timestamp: new Date().toISOString() };
          saveTracker(tracker);

          // Close modal
          const dismissBtn = page.locator('button[aria-label="Dismiss"], button[aria-label="Close"]').first();
          if (await dismissBtn.isVisible()) await dismissBtn.click();
          continue;
        } else if (answer.toLowerCase() === 'e') {
          const editedNote = await askQuestion('✍️ Enter revised note: ');
          if (editedNote.trim()) {
            await textarea.fill('');
            await simulateHumanTyping(page, 'textarea[name="message"], textarea#custom-message', editedNote.trim());
          }
          shouldSend = true;
        } else {
          shouldSend = true;
        }
      }

      if (shouldSend) {
        if (IS_DRY_RUN) {
          console.log('🧪 DRY RUN: Simulating send (closing modal without submitting)...');
          const dismissBtn = page.locator('button[aria-label="Dismiss"], button[aria-label="Close"]').first();
          if (await dismissBtn.isVisible()) await dismissBtn.click();
        } else {
          const sendBtn = page.locator('button:has-text("Send"):visible, button[aria-label*="Send invitation"]:visible').first();
          if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await sendBtn.click();
            console.log('🎉 Invitation sent successfully!');
            sentCount++;
            tracker[lead.id.toString()] = {
              status: 'sent',
              timestamp: new Date().toISOString(),
              note_sent: lead.connection_note,
            };
            saveTracker(tracker);
          } else {
            console.log('⚠️ Send button not clickable.');
          }
        }
      }

      // Safe jitter delay between profiles
      const delaySec = IS_AUTO ? randomBetween(45, 75) : randomBetween(10, 20);
      console.log(`⏳ Pausing for ${delaySec}s before next contact...`);
      await sleep(delaySec * 1000);
    } catch (err: any) {
      console.error(`❌ Error processing lead #${lead.id}:`, err?.message || err);
      tracker[lead.id.toString()] = {
        status: 'failed',
        error: String(err?.message || err),
        timestamp: new Date().toISOString(),
      };
      saveTracker(tracker);
    }
  }

  console.log('\n' + '='.repeat(65));
  console.log(`🏁 Session Complete! Total invitations sent this run: ${sentCount}`);
  console.log(`📄 Detailed log saved to: scripts/outreach/outreach_tracker.json`);
  console.log('='.repeat(65) + '\n');

  await context.close();
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
