const API_URL = 'http://localhost:5000/api';

    const setToken = (token) => localStorage.setItem('token', token);

    function showError(message) {
      const errorEl = document.getElementById('error-message');
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      setTimeout(() => {
        errorEl.style.display = 'none';
      }, 5000);
    }

    function showSuccess(message) {
      const successEl = document.getElementById('success-message');
      successEl.textContent = message;
      successEl.style.display = 'block';
    }

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = document.getElementById('login-btn');
      btn.disabled = true;
      btn.textContent = 'Logging in...';

      const credentials = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // Save token and user info
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showSuccess('Login successful! Redirecting...');
        
        // Redirect to home
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);

      } catch (error) {
        showError(error.message);
        btn.disabled = false;
        btn.textContent = 'Login';
      }
    });