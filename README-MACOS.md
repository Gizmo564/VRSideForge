# VRSideForge (macOS cookie-login fork)

Fork of [yGuilhermy/VRSideForge](https://github.com/yGuilhermy/VRSideForge) with changes for
macOS and for RuTracker's Cloudflare protection. All credit for the app goes to the upstream author.

## Why this fork exists

RuTracker sits behind Cloudflare. The upstream login flow opens an automated Chrome window, and
Cloudflare often keeps rejecting it ("Just a moment..."), so logging in never completes. This fork lets you
log in with your **own normal Chrome** and hand the resulting cookies to the app.

## What changed

- **`POST /api/session/import-cookies`**: stores your `bb_session` and `cf_clearance` cookies plus your
  browser's User-Agent, then verifies them with a plain HTTP request.
- **`GET /api/session/validate`**: returns success immediately if the stored session works. Otherwise it opens
  one shared login window (concurrent or retried calls no longer launch duplicate browsers).
- **HTTP scraper** uses your saved User-Agent. Cloudflare ties `cf_clearance` to the User-Agent it was issued
  to, and the upstream hardcoded one made every request fail with 403.
- **Concurrency lowered from 8 to 2**, and the fetcher no longer retries on 403.
- **`saveCookies`** keeps the saved User-Agent instead of wiping it.
- **Domain** switched from `rutracker.me` to `rutracker.org` (login page, registration link, captcha URL,
  placeholders, default blacklist).

## Requirements

- macOS (developed on Apple Silicon), Node.js 18 or newer, npm
- Google Chrome, plus Puppeteer's Chrome: `npx puppeteer browsers install chrome`
- A RuTracker account

## Setup

```bash
git clone https://github.com/Gizmo564/VRSideForge.git
cd VRSideForge
git checkout macos-cookie-login
npm install
npm install --prefix backend
npm install --prefix frontend
npm run dev
```

Follow the upstream README for anything not covered here (download folder, torrent client, and so on).

Don't add a `.puppeteerrc.cjs` with `chrome: { skipDownload: true }`, or Chrome won't be installed.

## Logging in with cookies

1. In your normal Chrome, open https://rutracker.org, pass the Cloudflare check, and log in.
2. Open DevTools (`Cmd+Option+I`), go to **Application**, then **Cookies**, then `https://rutracker.org`.
   Copy the values of `bb_session` and `cf_clearance`.
3. In the DevTools **Console**, run `navigator.userAgent` and copy the result.
4. With the app running, in a second Terminal tab:
```bash
   ./scripts/import-cookies.sh
```
   Paste the three values when prompted. You want `"success":true`.
5. Restart the app once so the scraper picks up the saved User-Agent, then reload the page.

### When it stops working

`cf_clearance` expires (often after hours or days). If you see 403 errors or "Session expired", stop the app,
repeat the steps above with fresh values, and restart. Use the **exact** User-Agent from the same Chrome that
passed the check.

## Security

`bb_session` is effectively your password. It is stored in the local SQLite database. Never commit the `.db`
file (it is in `.gitignore`), never share the cookies, and don't paste them into issues or chats.

## Notes

- This fork doesn't bypass or disguise anything. It reuses a session you created yourself in a normal browser.
- Use it at a gentle pace. Rapid parallel requests can get your clearance flagged.
