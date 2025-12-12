const API_URL = 'http://localhost:5000/api'; // Fix: Use HTTP, not HTTPS
const listingImage = document.querySelector('.listing-image');
const noImageIcon = document.getElementById('no-image-icon');

// Get listing ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const listingId = urlParams.get('id');

if (!listingId) {
    alert('No listing ID provided');
    window.location.href = 'index.html';
}

// Fetch listing data and set image
async function loadListing() {
    console.log('Listing ID:', listingId); // Debug: Log the ID
    console.log('Fetching URL:', `${API_URL}/listings/${listingId}`); // Debug: Log the full URL
    try {
        const response = await fetch(`${API_URL}/listings/${listingId}`);
        console.log('Response status:', response.status); // Debug: Log status
        if (!response.ok) {
            throw new Error('Listing not found');
        }
        const listing = await response.json();
        console.log('Listing data:', listing); // Debug: Log the full response

        // Set image
        if (listing.photos && listing.photos.length > 0) {
            listingImage.src = listing.photos[0];
            listingImage.style.display = 'block';
            noImageIcon.style.display = 'none';
        } else {
            listingImage.style.display = 'none';
            noImageIcon.style.display = 'flex';
        }

        // Populate other details (fix field name: Finder -> finder)
        document.querySelector('.listing-title').textContent = listing.name || 'Untitled Listing';
        document.querySelector('.listing-abouts').innerHTML = `
            <span><i class="fa-solid fa-map-marker-alt"></i> ${listing.location || 'Location not specified'}</span>
            <span><i class="fa-solid fa-calendar"></i> ${new Date(listing.createdAt).toLocaleDateString()}</span>
            <span><i class="fa-solid fa-user"></i> ${listing.finder?.name || 'Anonymous'}</span>
        `;
        document.querySelector('.listing-description').textContent = listing.description || 'No description available.';

    } catch (error) {
        console.error('Error loading listing:', error);
        alert('Failed to load listing: ' + error.message);
        window.location.href = 'index.html'; // Fix: Redirect to index on error
    }
}

// Load listing on page load
loadListing();

// ... rest of the file remains the same ...

//no image fallback
listingImage.addEventListener('error', () => {
    listingImage.style.display = 'none';
    noImageIcon.style.display = 'flex';
});

//report btn functionality
document.getElementById('report-btn').addEventListener('click', () => {
  document.getElementById('report-reason').style.display = 'block';
});

document.querySelectorAll('input[name="report-reason"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const othersText = document.getElementById('others-text');
    if (e.target.value === 'others') {
      othersText.style.display = 'block';
      othersText.focus();
    } else {
      othersText.style.display = 'none';
    }
  });
});

document.getElementById('cancel-report-btn').addEventListener('click', () => {
  document.getElementById('report-reason').style.display = 'none';
  document.querySelectorAll('input[name="report-reason"]').forEach(radio => radio.checked = false);
  document.getElementById('others-text').value = '';
});

document.getElementById('submit-report-btn').addEventListener('click', async () => {
  const selectedReason = document.querySelector('input[name="report-reason"]:checked');
  const othersText = document.getElementById('others-text').value;

  if (!selectedReason) {
    alert('Please select a reason');
    return;
  }

  const reportData = {
    reason: selectedReason.value,
    details: selectedReason.value === 'others' ? othersText : ''
  };

  console.log('Report submitted:', reportData);
  alert('Report submitted successfully');
  document.getElementById('report-reason').style.display = 'none';
});