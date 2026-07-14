// Prodigy User Authentication Client-Side App

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');
  const dashboardSection = document.getElementById('dashboard-section');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const goToRegister = document.getElementById('go-to-register');
  const goToLogin = document.getElementById('go-to-login');
  const logoutBtn = document.getElementById('logout-btn');
  const verifyTokenBtn = document.getElementById('verify-token-btn');
  const themeToggle = document.getElementById('theme-toggle');

  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // Input Password Visibility Toggles
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const icon = btn.querySelector('.material-icons-round');
      if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
      } else {
        input.type = 'password';
        icon.textContent = 'visibility';
      }
    });
  });

  // Theme Management
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('.material-icons-round');
    icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
  }

  // Toast Alerts
  let toastTimeout;
  function showToast(message, type = 'success') {
    clearTimeout(toastTimeout);
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    
    // Set icon based on type
    const icon = toast.querySelector('.toast-icon');
    if (type === 'success') {
      icon.textContent = 'check_circle_outline';
    } else if (type === 'error') {
      icon.textContent = 'error_outline';
    } else {
      icon.textContent = 'info';
    }

    toast.classList.remove('hidden');

    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 4000);
  }

  // View Routing States
  function showView(view) {
    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    dashboardSection.classList.add('hidden');

    if (view === 'login') {
      loginSection.classList.remove('hidden');
    } else if (view === 'register') {
      registerSection.classList.remove('hidden');
    } else if (view === 'dashboard') {
      dashboardSection.classList.remove('hidden');
    }
  }

  goToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    clearValidationErrors();
    showView('register');
  });

  goToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    clearValidationErrors();
    showView('login');
  });

  // Client-side input validation helpers
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }

  function setError(elementId, message) {
    const errorSpan = document.getElementById(elementId);
    if (errorSpan) {
      errorSpan.textContent = message;
    }
  }

  function clearValidationErrors() {
    document.querySelectorAll('.error-msg').forEach(span => span.textContent = '');
  }

  // Form Registration Logic
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearValidationErrors();

    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    let hasErrors = false;

    // Client-side validations
    if (!username) {
      setError('register-username-error', 'Username is required');
      hasErrors = true;
    } else if (username.length < 3) {
      setError('register-username-error', 'Username must be at least 3 characters');
      hasErrors = true;
    }

    if (!email) {
      setError('register-email-error', 'Email address is required');
      hasErrors = true;
    } else if (!validateEmail(email)) {
      setError('register-email-error', 'Please enter a valid email address');
      hasErrors = true;
    }

    if (!password) {
      setError('register-password-error', 'Password is required');
      hasErrors = true;
    } else if (password.length < 6) {
      setError('register-password-error', 'Password must be at least 6 characters');
      hasErrors = true;
    }

    if (password !== confirmPassword) {
      setError('register-confirm-password-error', 'Passwords do not match');
      hasErrors = true;
    }

    if (hasErrors) return;

    // Submit API Request
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        showToast('Registration successful! Welcome.', 'success');
        syncDashboard(data.user);
        showView('dashboard');
        registerForm.reset();
      } else {
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast('Network error, please try again later.', 'error');
      console.error(err);
    }
  });

  // Form Login Logic
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearValidationErrors();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    let hasErrors = false;

    // Client-side validations
    if (!email) {
      setError('login-email-error', 'Email address is required');
      hasErrors = true;
    } else if (!validateEmail(email)) {
      setError('login-email-error', 'Please enter a valid email address');
      hasErrors = true;
    }

    if (!password) {
      setError('login-password-error', 'Password is required');
      hasErrors = true;
    }

    if (hasErrors) return;

    // Submit API Request
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        showToast('Welcome back! Login successful.', 'success');
        syncDashboard(data.user);
        showView('dashboard');
        loginForm.reset();
      } else {
        showToast(data.message || 'Invalid credentials', 'error');
      }
    } catch (err) {
      showToast('Network error, please try again.', 'error');
      console.error(err);
    }
  });

  // Logout Logic
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    showToast('Logged out successfully.', 'success');
    showView('login');
  });

  // Verify Token Logic
  verifyTokenBtn.addEventListener('click', () => {
    checkAuthentication(true);
  });

  // Sync user details to dashboard fields
  function syncDashboard(user) {
    document.getElementById('dashboard-username').textContent = user.username;
    document.getElementById('user-id').textContent = user.id || user._id;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-display-username').textContent = user.username;
    document.getElementById('user-role').textContent = user.role || 'user';
    
    // Set avatar initial
    document.getElementById('user-avatar-initial').textContent = user.username.charAt(0).toUpperCase();

    // Format date
    const date = new Date(user.createdAt);
    document.getElementById('user-joined').textContent = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Active Session Authorization Check
  async function checkAuthentication(manualVerify = false) {
    const token = localStorage.getItem('token');
    if (!token) {
      showView('login');
      return;
    }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        syncDashboard(data.user);
        showView('dashboard');
        if (manualVerify) {
          showToast('JWT authorization token is verified and active!', 'success');
        }
      } else {
        localStorage.removeItem('token');
        showView('login');
        if (manualVerify) {
          showToast('Session expired. Please log in again.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      if (manualVerify) {
        showToast('Verification failed. Unable to reach API.', 'error');
      } else {
        // In case of network errors during auto-check, don't boot user immediately, but display error
        showToast('Network error, profile check failed.', 'error');
      }
    }
  }

  // Initial Auth Check on page load
  checkAuthentication();
});
