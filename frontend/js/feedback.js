// Toggle anonymous form and handle submissions via event delegation

document.addEventListener('DOMContentLoaded', () => {
  const anonBtn = document.getElementById('anonymous-btn');
  const formContainer = document.querySelector('.right-side .form-container');
  const anonSection = document.querySelector('.anonymous-form-section');
  if (!formContainer || !anonBtn || !anonSection) return;

  const originalHTML = formContainer.innerHTML;
  const anonHTML = anonSection.innerHTML;
  let showingAnon = false;

  anonBtn.addEventListener('click', () => {
    showingAnon = !showingAnon;
    if (showingAnon) {
      formContainer.innerHTML = anonHTML;
      anonBtn.textContent = 'Use Named Feedback';
    } else {
      formContainer.innerHTML = originalHTML;
      anonBtn.textContent = 'Or Submit Anonymously';
    }
  });

  // Handle submit for either form using event delegation
  document.querySelector('.right-side').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    // response element inside the current form container
    let responseEl = form.querySelector('.response-message');
    // fallback: try global ids used in HTML
    responseEl = responseEl || document.getElementById('response-message') || document.getElementById('anonymous-response-message');

    if (responseEl) {
      responseEl.textContent = 'Sending...';
      responseEl.classList.remove('error');
    }

    try {
      // replace endpoint with your real API if needed
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (responseEl) {
          responseEl.textContent = 'Thanks — feedback submitted.';
          responseEl.classList.remove('error');
        }
        form.reset();
      } else {
        const body = await res.json().catch(() => ({}));
        if (responseEl) {
          responseEl.textContent = body.error || 'Submission failed.';
          responseEl.classList.add('error');
        }
      }
    } catch (err) {
      if (responseEl) {
        responseEl.textContent = 'Could not connect to server.';
        responseEl.classList.add('error');
      }
      console.error('Feedback submit error:', err);
    }
  });
});