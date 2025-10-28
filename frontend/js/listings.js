// Load and display listings
async function loadListings(filters = {}) {
  try {
    const listings = await listingsAPI.getAll(filters);
    displayListings(listings);
  } catch (error) {
    console.error('Error loading listings:', error);
  }
}

// Display listings in the DOM
function displayListings(listings) {
  const container = document.getElementById('listings-container');
  container.innerHTML = '';

  if (listings.length === 0) {
    container.innerHTML = '<p>No animals available for adoption.</p>';
    return;
  }

  listings.forEach(listing => {
    const card = createListingCard(listing);
    container.appendChild(card);
  });
}

// Create listing card element
function createListingCard(listing) {
  const card = document.createElement('div');
  card.className = 'listing-card';
  
  const photo = listing.photos[0] || 'placeholder.jpg';
  
  card.innerHTML = `
    <img src="${photo}" alt="${listing.name}">
    <div class="listing-info">
      <h3>${listing.name}</h3>
      <p class="type">${listing.type} • ${listing.location}</p>
      <p class="description">${listing.description.substring(0, 100)}...</p>
      <span class="status status-${listing.status.toLowerCase()}">${listing.status}</span>
      <a href="listing-detail.html?id=${listing._id}" class="btn">View Details</a>
    </div>
  `;
  
  return card;
}

// Create new listing
async function createListing(e) {
  e.preventDefault();
  
  const listingData = {
    name: document.getElementById('name').value,
    type: document.getElementById('type').value,
    breed: document.getElementById('breed').value,
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    description: document.getElementById('description').value,
    location: document.getElementById('location').value,
    healthStatus: document.getElementById('healthStatus').value,
    vaccinated: document.getElementById('vaccinated').checked,
    photos: [] // Add photo upload logic with Cloudinary
  };

  try {
    await listingsAPI.create(listingData);
    alert('Listing created successfully!');
    window.location.href = 'index.html';
  } catch (error) {
    alert('Error creating listing: ' + error.message);
  }
}