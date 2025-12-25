const API_URL = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");
const getCurrentUser = () => JSON.parse(localStorage.getItem("user") || "{}");
let selectedPhotos = [];

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "../pages/login.html";
}

// Check if user is logged in and is a Finder
const user = getCurrentUser();
if (!getToken() || user.role !== "Finder") {
  alert("Only Finders can post animals for adoption");
  window.location.href = "../pages/index.html";
}

function showError(message) {
  const errorEl = document.getElementById("error-message");
  errorEl.textContent = message;
  errorEl.style.display = "block";
  setTimeout(() => (errorEl.style.display = "none"), 5000);
}

function showSuccess(message) {
  const successEl = document.getElementById("success-message");
  successEl.textContent = message;
  successEl.style.display = "block";
}

const photosInput = document.getElementById("photos");
const photosPreview = document.getElementById("photo-preview");

photosInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);

  if (selectedPhotos.length + files.length > 5) {
    showError("Maksimal 5 foto ya bro!");
    return;
  }

  files.forEach((file) => {
    if (file.size > 5 * 1024 * 1024) {
      showError(`File ${file.name} kegedean (Max 5MB)`);
    } else {
      selectedPhotos.push(file);
    }
  });

  updatePreview();
  photosInput.value = "";
});

function updatePreview() {
  photosPreview.innerHTML = "";

  selectedPhotos.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement("div");
      div.className = "photo-item";
      div.style.position = "relative";
      div.style.display = "inline-block";
      div.style.margin = "0.5rem";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = "100px";
      img.style.height = "100px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "8px";

      // Tombol Hapus 
      const removeBtn = document.createElement("button");
      removeBtn.innerHTML = "&times;";
      removeBtn.style.position = "absolute";
      removeBtn.style.top = "-5px";
      removeBtn.style.right = "-5px";
      removeBtn.style.background = "red";
      removeBtn.style.color = "white";
      removeBtn.style.border = "none";
      removeBtn.style.borderRadius = "50%";
      removeBtn.style.cursor = "pointer";

      removeBtn.onclick = () => {
        selectedPhotos.splice(index, 1); 
        updatePreview(); 
      };

      div.appendChild(img);
      div.appendChild(removeBtn);
      photosPreview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

document
  .getElementById("listing-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("submit-btn");

    const requiredFields = [
      { id: "name", label: "Animal Name" },
      { id: "type", label: "Animal Type" },
      { id: "location", label: "Location" },
      { id: "description", label: "Description" },
    ];

    for (const field of requiredFields) {
      const value = document.getElementById(field.id).value.trim();
      if (!value) {
        showError(`${field.label} is required`);
        return;
      }
    }

    if (selectedPhotos.length === 0) {
      //change language
      showError("Minimal upload 1 foto dong bro!");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Posting...";

    try {
      const formData = new FormData();

      formData.append("name", document.getElementById("name").value.trim());
      formData.append("type", document.getElementById("type").value);
      formData.append("breed", document.getElementById("breed").value.trim());
      formData.append("age", document.getElementById("age").value.trim());
      formData.append("gender", document.getElementById("gender").value);
      formData.append(
        "location",
        document.getElementById("location").value.trim()
      );
      formData.append(
        "description",
        document.getElementById("description").value.trim()
      );
      formData.append(
        "healthStatus",
        document.getElementById("healthStatus").value.trim()
      );

      formData.append(
        "vaccinated",
        document.getElementById("vaccinated").checked
      );

      selectedPhotos.forEach((file) => {
        formData.append("photos", file);
      });

      console.log("debugging formdata");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]); //kdoawkodkaowkdoaowkdokawokdoakwodkaowkodkaowkdokawokdowakokdowk debugging
      }

      const response = await fetch(`${API_URL}/listings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData, 
      });

      const data = await response.json();

      if (!response.ok) {
        //change
        throw new Error(data.error || "Gagal posting hewan");
      }

      //change
      showSuccess("hewan berhasil di posting");

      selectedPhotos = [];
      updatePreview();
      e.target.reset();

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000);
    } catch (error) {
      console.error("Error submit:", error);
      showError(error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Post Animal";
    }
  });
