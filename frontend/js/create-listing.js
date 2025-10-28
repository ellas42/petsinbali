const API_URL = 'http://localhost:5000/api';
    const getToken = () => localStorage.getItem('token');
    const getCurrentUser = () => JSON.parse(localStorage.getItem('user') || '{}');

    function logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '../pages/login.html';
    }

    // Check if user is logged in and is a Finder
    const user = getCurrentUser();
    if (!getToken() || user.role !== 'Finder') {
      alert('Only Finders can post animals for adoption');
      window.location.href = '../pages/index.html';
    }

    function showError(message) {
      const errorEl = document.getElementById('error-message');
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      setTimeout(() => errorEl.style.display = 'none', 5000);
    }

    function showSuccess(message) {
      const successEl = document.getElementById('success-message');
      successEl.textContent = message;
      successEl.style.display = 'block';
    }

    // Photo preview
    document.getElementById('photos').addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      const previewContainer = document.getElementById('photo-preview');
      previewContainer.innerHTML = '';

      if (files.length > 5) {
        showError('Maximum 5 photos allowed');
        e.target.value = '';
        return;
      }

      files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
          showError('Each photo must be less than 5MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });

    // Form submission
    document.getElementById('listing-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = document.getElementById('submit-btn');
      btn.disabled = true;
      btn.textContent = 'Posting...';

      // For now, we'll skip photo upload to Cloudinary
      // In production, you'd upload to Cloudinary first
      const listingData = {
        name: document.getElementById('name').value,
        type: document.getElementById('type').value,
        breed: document.getElementById('breed').value,
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        location: document.getElementById('location').value,
        description: document.getElementById('description').value,
        healthStatus: document.getElementById('healthStatus').value,
        vaccinated: document.getElementById('vaccinated').checked,
        photos: [] // TODO: Implement Cloudinary upload
      };

      try {
        const response = await fetch(`${API_URL}/listings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify(listingData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create listing');
        }

        showSuccess('Animal posted successfully! Redirecting...');
        
        setTimeout(() => {
          window.location.href = '../index.html';
        }, 2000);

      } catch (error) {
        showError(error.message);
        btn.disabled = false;
        btn.textContent = 'Post Animal';
      }
    });
