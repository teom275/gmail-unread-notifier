// Icons definitions
const COLOR_ICONS = {
  "16": "icons/color-16.png",
  "32": "icons/color-32.png",
  "48": "icons/color-48.png",
  "128": "icons/color-128.png"
};

const BW_ICONS = {
  "16": "icons/bw-16.png",
  "32": "icons/bw-32.png",
  "48": "icons/bw-48.png",
  "128": "icons/bw-128.png"
};

// Default settings
const DEFAULT_SETTINGS = {
  accountIndex: 0,
  showBadgeCount: true,
  checkIntervalMinutes: 1
};

// Retrieve settings from chrome.storage
async function getSettings() {
  const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...result };
}

// Update the extension icon, badge and tooltip based on state
async function updateUI(state) {
  const settings = await getSettings();

  if (state.status === 'ok') {
    const count = state.unreadCount;

    if (count > 0) {
      // Unread emails exist: Show full color icon
      await chrome.action.setIcon({ path: COLOR_ICONS });

      if (settings.showBadgeCount) {
        const badgeText = count > 99 ? '99+' : count.toString();
        await chrome.action.setBadgeText({ text: badgeText });
        await chrome.action.setBadgeBackgroundColor({ color: '#EA4335' });
        if (chrome.action.setBadgeTextColor) {
          try {
            await chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
          } catch (_) {}
        }
      } else {
        await chrome.action.setBadgeText({ text: '' });
      }

      const plural = count === 1 ? '' : 's';
      await chrome.action.setTitle({
        title: `Gmail: ${count} correo${plural} no leído${plural}`
      });
    } else {
      // 0 unread emails: Show black and white icon
      await chrome.action.setIcon({ path: BW_ICONS });
      await chrome.action.setBadgeText({ text: '' });
      await chrome.action.setTitle({
        title: 'Gmail: Sin correos no leídos'
      });
    }
  } else if (state.status === 'unauthorized') {
    // Session expired or not signed in
    await chrome.action.setIcon({ path: BW_ICONS });
    await chrome.action.setBadgeText({ text: '?' });
    await chrome.action.setBadgeBackgroundColor({ color: '#757575' });
    await chrome.action.setTitle({
      title: 'Gmail: Inicia sesión para verificar tus correos'
    });
  } else {
    // Network or other error
    await chrome.action.setIcon({ path: BW_ICONS });
    await chrome.action.setBadgeText({ text: '!' });
    await chrome.action.setBadgeBackgroundColor({ color: '#5F6368' });
    await chrome.action.setTitle({
      title: 'Gmail: Error de conexión'
    });
  }
}

// Fetch unread count from Gmail's Atom feed
async function checkUnread() {
  const settings = await getSettings();
  const feedUrl = `https://mail.google.com/mail/u/${settings.accountIndex}/feed/atom?timestamp=${Date.now()}`;

  let state = {
    timestamp: Date.now(),
    unreadCount: 0,
    status: 'error',
    message: ''
  };

  try {
    const response = await fetch(feedUrl, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    });

    if (response.status === 200) {
      const xmlText = await response.text();
      const countMatch = xmlText.match(/<fullcount>(\d+)<\/fullcount>/i);

      if (countMatch) {
        state.unreadCount = parseInt(countMatch[1], 10);
        state.status = 'ok';
      } else {
        state.status = 'error';
        state.message = 'No se encontró la etiqueta <fullcount> en el feed.';
      }
    } else if (response.status === 401) {
      state.status = 'unauthorized';
      state.message = 'No autenticado en Gmail. Inicia sesión en tu cuenta.';
    } else {
      state.status = 'error';
      state.message = `Respuesta HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (error) {
    state.status = 'error';
    state.message = error.message || 'Error de red al consultar Gmail.';
  }

  // Save the latest state
  await chrome.storage.local.set({ lastCheckState: state });

  // Update icon and badge
  await updateUI(state);

  return state;
}

// Open or switch to Gmail tab
async function openGmail() {
  const settings = await getSettings();
  const gmailUrl = `https://mail.google.com/mail/u/${settings.accountIndex}/`;

  try {
    const tabs = await chrome.tabs.query({ url: '*://mail.google.com/*' });
    if (tabs && tabs.length > 0) {
      // Find the first matching tab
      const tab = tabs[0];
      await chrome.tabs.update(tab.id, { active: true });
      if (tab.windowId) {
        await chrome.windows.update(tab.windowId, { focused: true });
      }
    } else {
      // No Gmail tab open: create one
      await chrome.tabs.create({ url: gmailUrl });
    }
  } catch (err) {
    console.error('Error al abrir Gmail:', err);
    await chrome.tabs.create({ url: gmailUrl });
  }

  // Trigger a fresh check after clicking
  setTimeout(checkUnread, 1500);
}

// Setup background alarms
async function setupAlarm() {
  const settings = await getSettings();
  const period = Math.max(1, Number(settings.checkIntervalMinutes) || 1);

  await chrome.alarms.clear('checkGmail');
  chrome.alarms.create('checkGmail', {
    delayInMinutes: period,
    periodInMinutes: period
  });
}

// Setup context menus
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'open_gmail',
      title: 'Abrir Gmail',
      contexts: ['action']
    });

    chrome.contextMenus.create({
      id: 'check_now',
      title: 'Comprobar correos ahora',
      contexts: ['action']
    });

    chrome.contextMenus.create({
      id: 'open_options',
      title: 'Configuración...',
      contexts: ['action']
    });
  });
}

// Event: Extension clicked (Toolbar icon shortcut)
chrome.action.onClicked.addListener(() => {
  openGmail();
});

// Event: Context menu clicked
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'open_gmail') {
    openGmail();
  } else if (info.menuItemId === 'check_now') {
    checkUnread();
  } else if (info.menuItemId === 'open_options') {
    chrome.runtime.openOptionsPage();
  }
});

// Event: Alarm fired
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkGmail') {
    checkUnread();
  }
});

// Event: Extension installed or updated
chrome.runtime.onInstalled.addListener(() => {
  setupAlarm();
  setupContextMenus();
  checkUnread();
});

// Event: Browser startup
chrome.runtime.onStartup.addListener(() => {
  setupAlarm();
  checkUnread();
});

// Real-time synchronization: listen to tab title updates on Gmail tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes('mail.google.com')) {
    // If the tab title changed, check if it has unread count info: e.g. "(3) Recibidos - ..."
    if (changeInfo.title) {
      const match = changeInfo.title.match(/\((\d+)\)/);
      if (match) {
        const count = parseInt(match[1], 10);
        updateUI({
          status: 'ok',
          unreadCount: count,
          timestamp: Date.now()
        });
      } else if (changeInfo.title.includes('Gmail') || changeInfo.title.includes('Recibidos') || changeInfo.title.includes('Inbox')) {
        // Tab is open and title has no parenthesis count -> 0 unread
        updateUI({
          status: 'ok',
          unreadCount: 0,
          timestamp: Date.now()
        });
      }
    }

    // If navigation completed, do a clean check
    if (changeInfo.status === 'complete') {
      setTimeout(checkUnread, 1000);
    }
  }
});

// When a tab is closed, if it might have been Gmail, verify count
chrome.tabs.onRemoved.addListener(() => {
  setTimeout(checkUnread, 1500);
});

// Messages from options page or tests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkNow') {
    checkUnread().then(res => sendResponse(res));
    return true; // Asynchronous response
  }
  if (request.action === 'settingsUpdated') {
    setupAlarm();
    checkUnread().then(res => sendResponse(res));
    return true;
  }
  if (request.action === 'getLastState') {
    chrome.storage.local.get(['lastCheckState'], (data) => {
      sendResponse(data.lastCheckState || null);
    });
    return true;
  }
});
