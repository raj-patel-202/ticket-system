/**
 * Online Ticketing Platform - Core Application JS
 * Apple Glass UI Micro-interactions & Auth Handling
 */

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Clean SVG icon based on type
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Global Logout Action
async function handleLogout() {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      showToast('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }
  } catch (err) {
    showToast('Failed to log out', 'error');
  }
}

// Global Login Form Handler
async function handleLoginForm(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  const username = form.username.value.trim();
  const password = form.password.value;

  if (!username || !password) {
    showToast('Please enter both username and password', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>Signing in...</span>`;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      showToast('Authentication successful!', 'success');
      // Check for 'next' query param or use role redirect
      const urlParams = new URLSearchParams(window.location.search);
      const nextUrl = urlParams.get('next');
      setTimeout(() => {
        window.location.href = nextUrl || data.redirect_url || '/';
      }, 600);
    } else {
      showToast(data.detail || 'Login failed. Please check credentials.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  } catch (err) {
    showToast('Network error while signing in.', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Global Register Form Handler
async function handleRegisterForm(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  const username = form.username.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const user_type = form.user_type.value;

  if (password.length < 6) {
    showToast('Password must be at least 6 characters.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>Creating Account...</span>`;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, user_type })
    });

    const data = await response.json();

    if (response.ok) {
      showToast('Account created successfully! Redirecting...', 'success');
      setTimeout(() => {
        if (user_type === 'organizer') {
          window.location.href = '/organizer';
        } else if (user_type === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      }, 700);
    } else {
      showToast(data.detail || 'Registration failed.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  } catch (err) {
    showToast('Network error while creating account.', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Quick demo login filler
function fillDemoAccount(username, password) {
  const uInput = document.querySelector('input[name="username"]');
  const pInput = document.querySelector('input[name="password"]');
  if (uInput && pInput) {
    uInput.value = username;
    pInput.value = password;
    showToast(`Loaded ${username} credentials`, 'info');
  }
}
