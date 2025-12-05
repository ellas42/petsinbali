//edit profile
document.getElementById('edit-profile-btn')?.addEventListener('click', async (e) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return window.location.href = 'login.html';
  }

  const hasUnsaved = false; // replace with your real check
  if (hasUnsaved && !confirm('You have unsaved changes. Continue?')) return;

  const profile = {
    name: document.getElementById('user-name-header')?.textContent,
    email: document.getElementById('user-email')?.textContent,
    location: document.getElementById('user-location')?.textContent,
  };
  localStorage.setItem('editProfileDraft', JSON.stringify(profile));

  window.location.href = 'profile-edit-profile.html';
});