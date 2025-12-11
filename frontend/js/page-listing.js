const listingImage = document.querySelector('.listing-image');
const noImageIcon = document.getElementById('no-image-icon');

listingImage.addEventListener('error', () => {
    listingImage.style.display = 'none';
    noImageIcon.style.display = 'flex';
});

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