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

    //photos input
    const photosInput = document.getElementById('photos');
    const photosPreview = document.getElementById('photo-preview');

    function updatePreview() {
      const previewContainer = document.getElementById('photo-preview');
      previewContainer.innerHTML = '';

      selectedPhotos.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const div = document.createElement('div');
          div.className = 'photo-item';
          div.style.position = 'relative';
      div.style.display = 'inline-block';
      div.style.margin = '0.5rem';

      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.width = '150px';
      img.style.height = '150px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '6px';

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.style.position = 'absolute';
      removeBtn.style.top = '5px';
      removeBtn.style.right = '5px';
       removeBtn.style.background = 'rgba(255, 255, 255, 0.8)';
      removeBtn.style.border = 'none';
      removeBtn.style.borderRadius = '50%';
      removeBtn.style.width = '20px';
      removeBtn.style.height = '20px';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.fontSize = '14px';
      removeBtn.style.fontWeight = 'bold';
      removeBtn.onclick = () => {
        selectedPhotos.splice(index, 1);
        updatePreview();
      };

      div.appendChild(img);
      div.appendChild(removeBtn);
      previewContainer.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
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

      const requiredFields = [
        { id: 'name', label: 'Animal Name'},
        { id: 'type', label: 'Animal Type'},
        { id: 'location', label: 'Location' },
        { id: 'description', label: 'Description' }
      ];

      for (const field of requiredFields) {
        const value = document.getElementById(field.id).value.trim();
        if (!value) {
          showError(`${field.label} is required`);
          return;
        }
      }

      const btn = document.getElementById('submit-btn');
      btn.disabled = true;
      btn.textContent = 'Posting...';

      let photosUrls = [];
      if (selectedPhotos.length > 0) {
        const formData = new FormData();
        selectedPhotos.forEach(file => formData.append('photos', file));

        try {
          const uploadRes = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${getToken()}`
            },
            body: formData
          });

          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) {
            throw new Error(uploadData.error || 'Photo upload failed');
          }
          photosUrls = uploadData.urls;
        } catch (error) {
          showError('Failed to upload photos: ' + error.message); 
          btn.disabled = false;
          btn.textContent = 'Post Animal';
          return;
        }
      }

      // For now, we'll skip photo upload to Cloudinary
      // In production, you'd upload to Cloudinary first
      const listingData = {
        name: document.getElementById('name').value.trim(),
        type: document.getElementById('type').value,
        breed: document.getElementById('breed').value.trim(),
        age: document.getElementById('age').value.trim(),
        gender: document.getElementById('gender').value,
        location: document.getElementById('location').value.trim(),
        description: document.getElementById('description').value.trim(),
        healthStatus: document.getElementById('healthStatus').value.trim(),
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
