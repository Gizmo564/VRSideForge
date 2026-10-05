const API = 'http://127.0.0.1:4000/api/session/import-cookies';
let timer = null;

async function sync() {
  try {
    const all = await chrome.cookies.getAll({ domain: 'rutracker.org' });
    const bb = all.find(c => c.name === 'bb_session');
    const cf = all.find(c => c.name === 'cf_clearance');
    if (!bb) { badge('?', '#888'); return; }
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bb_session: bb.value,
        cf_clearance: cf ? cf.value : '',
        userAgent: navigator.userAgent
      })
    });
    const data = await res.json();
    badge(data.success ? 'OK' : '!', data.success ? '#2a9d3a' : '#d33');
  } catch (e) {
    badge('X', '#d33'); // backend not running
  }
}

function badge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

// Auto-sync a few seconds after the login cookies change (debounced)
chrome.cookies.onChanged.addListener(({ cookie }) => {
  if (!cookie.domain.endsWith('rutracker.org')) return;
  if (cookie.name !== 'bb_session' && cookie.name !== 'cf_clearance') return;
  clearTimeout(timer);
  timer = setTimeout(sync, 3000);
});

// Clicking the toolbar icon syncs manually
chrome.action.onClicked.addListener(sync);
