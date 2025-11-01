const API_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");
const setToken = (token) => localStorage.setItem("token", token);
const removeToken = () => localStorage.removeItem("token");

async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

function isLoggedIn() {
  return !!getToken();
}

function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

function logout() {
  removeToken();
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

async function loadListings(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const listings = await apiRequest(`/listings?${params}`);
    displayListings(listings);
  } catch (error) {
    document.getElementById("listings-container").innerHTML =
      '<p style="text-align: center; color: #e74c3c;">Error loading listings. Please try again.</p>';
  }
}

function displayListings(listings) {
  const container = document.getElementById("listings-container");
  container.innerHTML = "";

  if (listings.length === 0) {
    container.innerHTML =
      '<p style="text-align: center;", "align-items: center;", "justify-content: center;">No animals available for adoption.</p>';
    return;
  }

  listings.forEach((listing) => {
    const card = document.createElement("div");
    card.className = "listing-card";

    const photo =
      listing.photos && listing.photos[0]
        ? listing.photos[0]
        : "https://via.placeholder.com/400x300?text=No+Image";

    card.innerHTML = `
          <img src="${photo}" alt="${listing.name}">
          <div class="listing-info">
            <h3>${listing.name}</h3>
            <p class="type">${listing.type} • ${listing.location}</p>
            <p class="description">${listing.description.substring(
              0,
              100
            )}...</p>
            <span class="status status-${listing.status.toLowerCase()}">${
      listing.status
    }</span>
            <br><br>
            <a href="#" onclick="viewListing('${
              listing._id
            }')" class="btn">View Details</a>
          </div>
        `;

    container.appendChild(card);
  });
}

function applyFilters() {
  const filters = {
    type: document.getElementById("filter-type").value,
    location: document.getElementById("filter-location").value,
    status: document.getElementById("filter-status").value,
  };

  Object.keys(filters).forEach((key) => {
    if (!filters[key]) delete filters[key];
  });

  loadListings(filters);
}

function viewListing(id) {
  alert("Listing detail page coming soon! Listing ID: " + id);
}

window.addEventListener("DOMContentLoaded", () => {
  if (isLoggedIn()) {
    const user = getCurrentUser();
    //I HAVE NO IDEA WHY I COMMENTED TS ???????
    //document.getElementById("login-link").style.display = "none";
    //document.getElementById("register-link").style.display = "none";
    //document.getElementById("logout-link").style.display = "block";

    if (user && user.role === "Finder") {
      document.getElementById("create-listing-link").style.display = "block";
    }
  }

  loadListings();
});

//for carousels

const cafes = [
  {
    name: "The Odd Cat Cafe",
    location: "Canggu, Bali",
    description:
      "The Odd Cat is Bali's first comprehensive cat centre. They are a cat cafe, a professional cat boarding hotel, an event space, a sanctuary and a cat adoption centre.",
    features: ["Pet Friendly", "Rescue Support", "Outdoor Seating"],
    mapsLink: "https://maps.app.goo.gl/ZhwWDPD1phub1fWn8",
    images: [
      "../images/the-odd1.jpg",
      "../images/the-odd2.jpg",
      "../images/the-odd3.jpg",
    ],
  },
  {
    name: "Bali Pet Nirvana",
    location: "Seminyak, Bali",
    description:
      "Bali Pet Nirvana is the first luxury pets lounge and park in Bali.",
    features: ["Pet Friendly", "Garden Setting", "Swim Area"],
    mapsLink: "https://maps.app.goo.gl/ujHQ8R8kE4ZECoKR6",
    images: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1573865526739-10c1d3a1f0cc?w=800&h=600&fit=crop",
    ],
  },
  {
    name: "Omah Neko by Muliacoon Cattery",
    location: "Canggu, Bali",
    description:
      "Modern cafe filled with lovely cats to play with while enjoying a coffee. A great spot for cat lovers to relax and unwind.",
    features: ["Kids Friendly", "Specialty Coffee", "WiFi Available"],
    mapsLink: "https://maps.app.goo.gl/ZmLWWgdhgBFz3aTXA",
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1530126483408-aa533e55bdb2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800&h=600&fit=crop",
    ],
  },
  {
    name: "Brie's Unicorn Cafe and Pocket Pet Playground",
    location: "Canggu, Bali",
    description:
      "Unicorn themed cafe with adorable sugar gliders and hedgehods. A magical experience for all ages.",
    features: ["Unique Theme", "Healthy Food", "Play Area"],
    mapsLink: "https://maps.app.goo.gl/1EspRxZQ74yzjg9w8",
    images: [
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&h=600&fit=crop",
    ],
  },
  {
    name: "Furry Friends Bistro",
    location: "Denpasar, Bali",
    description:
      "Family-friendly bistro welcoming all pets. Spacious indoor and outdoor areas with pet-friendly menu options.",
    features: ["All Pets Welcome", "Pet Menu", "Family Friendly"],
    mapsLink: "https://maps.google.com/?q=Pet+Friendly+Bistro+Denpasar+Bali",
    images: [
      "../images/the-odd1",
      "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504595403659-9088ce801e29?w=800&h=600&fit=crop",
    ],
  },
];

const track = document.getElementById("cafe-carousel-track");

cafes.forEach((cafe, cafeIndex) => {
  const card = document.createElement("div");
  card.className = "cafe-card";

  card.innerHTML = `
        <div class="cafe-images">
          <div class="cafe-image-slider" id="slider-${cafeIndex}">
            ${cafe.images
              .map(
                (img) =>
                  `<img src="${img}" alt="${cafe.name}" class="cafe-image">`
              )
              .join("")}
          </div>
          <div class="image-dots" id="dots-${cafeIndex}">
            ${cafe.images
              .map(
                (_, i) =>
                  `<div class="dot ${
                    i === 0 ? "active" : ""
                  }" data-index="${i}"></div>`
              )
              .join("")}
          </div>
        </div>
        <div class="cafe-info">
          <h3 class="cafe-name">${cafe.name}</h3>
          <p class="cafe-location"> ${cafe.location}</p>
          <p class="cafe-description">${cafe.description}</p>
          <div class="cafe-features">
            ${cafe.features
              .map((feature) => `<span class="feature-tag">${feature}</span>`)
              .join("")}
          </div>
          <a href="${cafe.mapsLink}" target="_blank" class="cafe-link">
            View on Google Maps
          </a>
        </div>
      `;

  track.appendChild(card);

  setupImageSlider(cafeIndex, cafe.images.length);
});

function setupImageSlider(cafeIndex, imageCount) {
  const slider = document.getElementById(`slider-${cafeIndex}`);
  const dots = document.querySelectorAll(`#dots-${cafeIndex} .dot`);
  let currentIndex = 0;
  let autoSlideInterval;

  function showImage(index) {
    currentIndex = index;
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  }

  function nextImage() {
    const nextIndex = (currentIndex + 1) % imageCount;
    showImage(nextIndex);
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextImage, 3000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showImage(index);
      stopAutoSlide();
      startAutoSlide();
    });
  });

  startAutoSlide();

  const card = slider.closest(".cafe-card");
  card.addEventListener("mouseenter", stopAutoSlide);
  card.addEventListener("mouseleave", startAutoSlide);
}

const leftBtn = document.getElementById("cafe-carousel-left");
const rightBtn = document.getElementById("cafe-carousel-right");

leftBtn.addEventListener("click", () => {
  track.scrollBy({
    left: -400,
    behavior: "smooth",
  });
});

rightBtn.addEventListener("click", () => {
  track.scrollBy({
    left: 400,
    behavior: "smooth",
  });
});

function updateButtons() {
  const scrollLeft = track.scrollLeft;
  const maxScroll = track.scrollWidth - track.clientWidth;

  leftBtn.style.opacity = scrollLeft <= 0 ? "0.3" : "1";
  leftBtn.style.cursor = scrollLeft <= 0 ? "default" : "pointer";

  rightBtn.style.opacity = scrollLeft >= maxScroll ? "0.3" : "1";
  rightBtn.style.cursor = scrollLeft >= maxScroll ? "default" : "pointer";
}

track.addEventListener("scroll", updateButtons);
updateButtons();


///account dropdown
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