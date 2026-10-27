const accountIndexSelect = document.getElementById('accountIndex');
const checkIntervalSelect = document.getElementById('checkInterval');
const showBadgeCountCheckbox = document.getElementById('showBadgeCount');
const btnSave = document.getElementById('btnSave');
const btnTest = document.getElementById('btnTest');
const saveStatus = document.getElementById('saveStatus');
const statusText = document.getElementById('statusText');
const statusDetail = document.getElementById('statusDetail');
const previewIcon = document.getElementById('previewIcon');
const previewBadge = document.getElementById('previewBadge');

// Load stored settings
async function loadSettings() {
  const settings = await chrome.storage.sync.get({
    accountIndex: 0,
    checkIntervalMinutes: 1,
    showBadgeCount: true
  });

  accountIndexSelect.value = settings.accountIndex.toString();
  checkIntervalSelect.value = settings.checkIntervalMinutes.toString();
  showBadgeCountCheckbox.checked = !!settings.showBadgeCount;

  // Also query background for last check state
  chrome.runtime.sendMessage({ action: 'getLastState' }, (state) => {
    if (state) {
      renderState(state);
    }
  });
}

// Render check state in the preview panel
function renderState(state) {
  const showBadge = showBadgeCountCheckbox.checked;

  if (state.status === 'ok') {
    const count = state.unreadCount;
    if (count > 0) {
      previewIcon.src = '../icons/color-48.png';
      previewBadge.style.background = '';
      if (showBadge) {
        previewBadge.style.display = 'block';
        previewBadge.textContent = count > 99 ? '99+' : count;
      } else {
        previewBadge.style.display = 'none';
      }
      statusText.textContent = `✅ Conectado: ${count} correo(s) no leído(s)`;
      statusText.style.color = 'var(--primary)';
      statusDetail.textContent = `Icono en COLOR activo. Última comprobación: ${new Date(state.timestamp).toLocaleTimeString()}`;
    } else {
      previewIcon.src = '../icons/bw-48.png';
      previewBadge.style.display = 'none';
      statusText.textContent = '✅ Conectado: 0 correos no leídos';
      statusText.style.color = 'var(--success)';
      statusDetail.textContent = `Bandeja al día. Icono en BLANCO Y NEGRO. Última comprobación: ${new Date(state.timestamp).toLocaleTimeString()}`;
    }
  } else if (state.status === 'unauthorized') {
    previewIcon.src = '../icons/bw-48.png';
    previewBadge.style.display = 'block';
    previewBadge.textContent = '?';
    previewBadge.style.background = '#757575';
    statusText.textContent = '⚠️ Sesión no iniciada';
    statusText.style.color = 'var(--danger)';
    statusDetail.textContent = 'Asegúrate de haber iniciado sesión en Gmail con este perfil de navegador.';
  } else {
    previewIcon.src = '../icons/bw-48.png';
    previewBadge.style.display = 'block';
    previewBadge.textContent = '!';
    previewBadge.style.background = '#5F6368';
    statusText.textContent = '❌ Error al consultar Gmail';
    statusText.style.color = 'var(--danger)';
    statusDetail.textContent = state.message || 'No se pudo conectar con los servidores de Gmail.';
  }
}

// Save settings
async function saveSettings() {
  const newSettings = {
    accountIndex: parseInt(accountIndexSelect.value, 10) || 0,
    checkIntervalMinutes: parseInt(checkIntervalSelect.value, 10) || 1,
    showBadgeCount: showBadgeCountCheckbox.checked
  };

  await chrome.storage.sync.set(newSettings);

  saveStatus.textContent = '¡Configuración guardada correctamente!';
  saveStatus.className = 'save-status success';
  setTimeout(() => {
    saveStatus.textContent = '';
  }, 3000);

  // Notify background script to apply new alarm & refresh
  chrome.runtime.sendMessage({ action: 'settingsUpdated' }, (res) => {
    if (res) renderState(res);
  });
}

// Test connection button
function testConnection() {
  statusText.textContent = 'Consultando Gmail...';
  statusText.style.color = 'var(--text-main)';
  statusDetail.textContent = 'Obteniendo estado del feed de Gmail...';
  btnTest.disabled = true;

  chrome.runtime.sendMessage({ action: 'checkNow' }, (res) => {
    btnTest.disabled = false;
    if (res) {
      renderState(res);
    } else {
      statusText.textContent = 'Error de comunicación con el servicio en segundo plano.';
      statusText.style.color = 'var(--danger)';
    }
  });
}

// Live update preview when checkbox is toggled
showBadgeCountCheckbox.addEventListener('change', () => {
  if (!showBadgeCountCheckbox.checked) {
    previewBadge.style.display = 'none';
  } else {
    chrome.runtime.sendMessage({ action: 'getLastState' }, (state) => {
      if (state && state.unreadCount > 0) {
        previewBadge.style.display = 'block';
        previewBadge.textContent = state.unreadCount > 99 ? '99+' : state.unreadCount;
      }
    });
  }
});

btnSave.addEventListener('click', saveSettings);
btnTest.addEventListener('click', testConnection);

document.addEventListener('DOMContentLoaded', loadSettings);
