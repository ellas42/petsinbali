const userNameHeader = document.getElementById("user-name-header");
const userLocation = document.getElementById("user-location");
const userEmail = document.getElementById("user-email");
const profileImg = document.getElementById("profile-img");
const uploadBtn = document.getElementById("upload-btn");
const changePicBtn = document.getElementById("change-pic-btn");
const listingContainer = document.querySelector(".listing-containers");
const noListingText = document.querySelector(".no-listing");
const editProfileBtn = document.getElementById("edit-profile-btn");


//edit profile
document.getElementById("edit-profile-btn")?.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  if (!token) return window.location.href = "login.html";

  try {
    const res = await fetch("https://your-api.com/api/user/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const user = await res.json();

    localStorage.setItem("editProfileDraft", JSON.stringify({
      name: user.name,
      email: user.email,
      location: user.location,
      phone: user.phone || "",
    }));

    window.location.href = "profile-edit-profile.html";
  } catch (err) {
    console.error("Failed to load profile:", err);
  }
});


async function loadProfile() {
    try {
        const res = await fetch("http://localhost:5000/api/users/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) {
            console.error(data.message);
            return;
        }

        userNameHeader.textContent = data.name;
        userLocation.textContent = `📍 ${data.location}`;
        userEmail.textContent = data.email;

        if (data.profilePic) {
            profileImg.src = data.profilePic;
        }

    } catch (err) {
        console.error("Error loading profile:", err);
    }
}

//load user listings
async function loadListings() {
    try {
        const res = await fetch("http://localhost:5000/api/listings/my-listings", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const listings = await res.json();

        listingContainer.innerHTML = "";

        if (!listings.length) {
            noListingText.style.display = "block";
            return;
        }

        noListingText.style.display = "none";

        listings.forEach(listing => {
            const div = document.createElement("div");
            div.classList.add("listing-card");

            div.innerHTML = `
                <img src="${listing.photos?.[0] || '../images/no-image.jpg'}" class="listing-img">
                <h3>${listing.name}</h3>
                <p>${listing.type} • ${listing.location}</p>
                <button onclick="editListing('${listing._id}')">Edit</button>
            `;

            listingContainer.appendChild(div);
        });

    } catch (err) {
        console.error("Error loading listings:", err);
    }
}


//redirect edit listing
function editListing(id) {
    window.location.href = `edit-listing.html?id=${id}`;
}

//redirect edit profile
changePicBtn.addEventListener("click", () => {
    uploadBtn.click();
});

uploadBtn.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    profileImg.src = URL.createObjectURL(file);

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
        const res = await fetch("http://localhost:5000/api/users/update-picture", {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        const data = await res.json();
        console.log(data.message);

    } catch (err) {
        console.error("Upload error:", err);
    }
});



editProfileBtn.addEventListener("click", () => {
    window.location.href = "edit-profile.html";
});


//logout
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}
window.logout = logout;

loadProfile();
loadListings();
