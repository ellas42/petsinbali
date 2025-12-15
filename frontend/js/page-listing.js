//header stuff
document.addEventListener('DOMContentLoaded', () => {
  const accountBtn = document.getElementById('account-btn');
  const accountDropdown = document.getElementById('account-dropdown');
  const dropdownMenu = document.getElementById('dropdown-menu');

  if (accountBtn) {
    accountBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      accountDropdown.classList.toggle('active');
    });
  }

  document.addEventListener('click', (e) => {
    if (!accountDropdown.contains(e.target)) {
      accountDropdown.classList.remove('active');
    }
  });

  updateAccountDropdown();
});

function updateAccountDropdown() {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  
  const dropdownGuest = document.getElementById('dropdown-guest');
  const dropdownUser = document.getElementById('dropdown-user');
  const accountName = document.getElementById('account-name');
  const userName = document.getElementById('user-name');
  const userRole = document.getElementById('user-role');
  const myListingsLink = document.getElementById('my-listings-link');

  if (token && user) {
    dropdownGuest.style.display = 'none';
    dropdownUser.style.display = 'block';
    accountName.textContent = user.name || 'Account';
    userName.textContent = user.name;
    userRole.textContent = user.role;
    
    if (user.role === 'Finder') {
      myListingsLink.style.display = 'flex';
      document.getElementById('create-listing-link').style.display = 'block';
    }
  } else {
    dropdownGuest.style.display = 'block';
    dropdownUser.style.display = 'none';
    accountName.textContent = 'Account';
  }
}

function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}


const API_URL = 'http://localhost:5000/api'; 
const listingImage = document.querySelector('.listing-image');
const noImageIcon = document.getElementById('no-image-icon');

const urlParams = new URLSearchParams(window.location.search);
const listingId = urlParams.get('id');

if (!listingId) {
    alert('No listing ID provided');
    window.location.href = 'index.html';
}

async function loadListing() {
    console.log('Listing ID:', listingId);
    console.log('Fetching URL:', `${API_URL}/listings/${listingId}`);
    try {
        const response = await fetch(`${API_URL}/listings/${listingId}`);
        console.log('Response status:', response.status); 
        if (!response.ok) {
            throw new Error('Listing not found');
        }
        const listing = await response.json();
        console.log('Listing data:', listing);

        if (listing.photos && listing.photos.length > 0) {
            listingImage.src = listing.photos[0];
            listingImage.style.display = 'block';
            noImageIcon.style.display = 'none';
        } else {
            listingImage.style.display = 'none';
            noImageIcon.style.display = 'flex';
        }

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
        window.location.href = 'index.html';
    }
}

loadListing();


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