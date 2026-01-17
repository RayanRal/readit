// Config is loaded from config.js
const { API_BASE, LOGIN_URL } = CONFIG;

document.addEventListener('DOMContentLoaded', async () => {
  const loadingScreen = document.getElementById('loading');
  const loginScreen = document.getElementById('login');
  const saveScreen = document.getElementById('save');
  const successScreen = document.getElementById('success');
  
  const titleEl = document.getElementById('page-title');
  const urlEl = document.getElementById('page-url');
  const saveBtn = document.getElementById('save-btn');
  const loginBtn = document.getElementById('login-btn');
  const errorMsg = document.getElementById('error-msg');

  // Helper to switch screens
  const showScreen = (screen) => {
    [loadingScreen, loginScreen, saveScreen, successScreen].forEach(el => el.classList.add('hidden'));
    screen.classList.remove('hidden');
  };

  // 1. Get Current Tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.url.startsWith('http')) {
    showScreen(saveScreen); // Or error screen
    titleEl.textContent = "Cannot save this page";
    urlEl.textContent = "";
    saveBtn.disabled = true;
    return;
  }

  // 2. Check Auth Status
  try {
    const res = await fetch(`${API_BASE}/links`, {
      method: 'GET',
      credentials: 'include' // Important: sends cookies
    });

    if (res.status === 401) {
      showScreen(loginScreen);
    } else if (res.ok) {
      // User is logged in
      titleEl.textContent = tab.title;
      urlEl.textContent = tab.url;
      showScreen(saveScreen);
    } else {
      throw new Error('Network error');
    }
  } catch (err) {
    console.error(err);
    // Assuming unauth for network errors in this simple MVP (or server down)
    // For now, let's show login screen or error
    errorMsg.textContent = "Could not connect to Readit.";
    errorMsg.classList.remove('hidden');
    showScreen(saveScreen);
    saveBtn.disabled = true;
  }

  // 3. Handlers
  loginBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: LOGIN_URL });
  });

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    
    try {
      const res = await fetch(`${API_BASE}/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important
        body: JSON.stringify({
          url: tab.url,
          title: tab.title
        })
      });

      if (res.ok) {
        showScreen(successScreen);
        setTimeout(() => window.close(), 1500);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Link";
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    }
  });
});
