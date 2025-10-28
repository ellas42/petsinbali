async function uploadImages(files) {
  const formData = new FormData();
  
  for (let file of files) {
    formData.append('photos', file);
  }

  const token = getToken();
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData // Don't set Content-Type, browser will set it with boundary
  });

  const data = await response.json();
  return data.urls; // Array of Cloudinary URLs
}

// Usage in create listing form
document.getElementById('photos').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  try {
    const urls = await uploadImages(files);
    // Store URLs to submit with listing
    window.uploadedPhotoUrls = urls;
  } catch (error) {
    alert('Image upload failed');
  }
});