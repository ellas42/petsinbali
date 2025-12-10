const API_URL = 'http://localhost:5000/api';

const userNameHeader = document.getElementById("user-name-header");
const userLocation = document.getElementById("user-location");
const userEmail = document.getElementById("user-email");
const userPhone = document.getElementById("user-phone");
const userBio = document.getElementById("user-bio");
const profileImg = document.getElementById("profile-img");
const uploadBtn = document.getElementById("upload-btn");
const changePicBtn = document.getElementById("change-pic-btn");
const listingContainer = document.querySelector(".listing-containers");
const noListingText = document.querySelector(".no-listing");
const editProfileBtn = document.getElementById("edit-profile-btn");

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

async function loadProfile() {
    try {
        //FIX use /auth/me endpoint 
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            throw new Error('Failed to load profile');
        }

        const data = await res.json();

        userNameHeader.textContent = data.name;
        userLocation.textContent = data.location;
        userPhone.textContent = data.phone;
        userEmail.textContent = data.email;
        userBio.textContent = data.bio;

        if (data.profilePic) {
            profileImg.src = data.profilePic;
        }

    } catch (err) {
        console.error("Error loading profile:", err);
        if (err.message.includes('401')) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    }
}

async function loadListings() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // FIXXXXXXXXXXXXX 
        const res = await fetch(`${API_URL}/listings?finder=${user.id}`, {
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            throw new Error('Failed to load listings');
        }

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
                <img src="${listing.photos?.[0] || '../images/no-image.jpg'}" alt="${listing.name}">
                <h3>${listing.name}</h3>
                <p>${listing.type} • ${listing.location}</p>
                <div class="listing-actions">
                    <button class="edit-btn" onclick="editListing('${listing._id}')">
                        <i class="fa-solid fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deleteListing('${listing._id}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            `;

            listingContainer.appendChild(div);
        });

    } catch (err) {
        console.error("Error loading listings:", err);
    }
}

function editListing(id) {
    window.location.href = `edit-listing.html?id=${id}`;
}

async function deleteListing(id) {
    if (!confirm('Are you sure you want to delete this listing?')) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/listings/${id}`, {
            method: 'DELETE',
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (res.ok) {
            alert('Listing deleted successfully!');
            loadListings();
        } else {
            alert('Failed to delete listing');
        }
    } catch (err) {
        console.error('Delete error:', err);
        alert('Error deleting listing');
    }
}

window.editListing = editListing;
window.deleteListing = deleteListing;

//change profile pic
if (changePicBtn) {
    changePicBtn.addEventListener("click", () => {
        uploadBtn.click();
    });
}

if (uploadBtn) {
    uploadBtn.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        profileImg.src = URL.createObjectURL(file);

        const formData = new FormData();
        formData.append("profilePic", file);

        try {
            //make cloudinary for this and upload in backend pls thx
            const res = await fetch(`${API_URL}/auth/update-picture`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token}`
                    // DO NOTTTTTTT set ContentType for FormData 🖕
                },
                body: formData
            });

            const data = await res.json();
            
            if (res.ok) {
                alert('Profile picture updated!');
            } else {
                alert('Failed to update picture');
                loadProfile();
            }

        } catch (err) {
            console.error("Upload error:", err);
            alert('Error uploading picture');
            loadProfile();
        }
    });
}

if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
        const editModal = document.querySelector('.edit-profile-page');
        editModal.classList.add('active');
        
        const user = JSON.parse(localStorage.getItem('user'));
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('bio').value = user.bio || '';
    });
}

const cancelBtn = document.getElementById('cancel-btn');
if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        const editModal = document.querySelector('.edit-profile-page');
        editModal.classList.remove('active');
    });
}

const editForm = document.getElementById('edit');
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            bio: document.getElementById('bio').value
        };

        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            });

            if (res.ok) {
                const data = await res.json();
                
                localStorage.setItem('user', JSON.stringify(data.user));
                
                alert('Profile updated successfully!');
                
                document.querySelector('.edit-profile-page').classList.remove('active');
                loadProfile();
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Update error:', err);
            alert('Error updating profile');
        }
    });
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}
window.logout = logout;

loadProfile();
loadListings();