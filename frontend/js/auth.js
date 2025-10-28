// Register form handler
async function handleRegister(e) {
  e.preventDefault();
  
  const formData = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    name: document.getElementById('name').value,
    role: document.getElementById('role').value,
    location: document.getElementById('location').value,
    phone: document.getElementById('phone').value
  };

  try {
    const response = await authAPI.register(formData);
    setToken(response.token);
    
    // Store user info
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Redirect to home
    window.location.href = '/pages/index.html';
  } catch (error) {
    alert('Registration failed: ' + error.message);
  }
}

// Login form handler
async function handleLogin(e) {
  e.preventDefault();
  
  const credentials = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  try {
    const response = await authAPI.login(credentials);
    setToken(response.token);
    
    // Store user info
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Redirect to home
    window.location.href = '/pages/index.html';
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}

// Logout
function logout() {
  removeToken();
  localStorage.removeItem('user');
  window.location.href = '/pages/login.html';
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}