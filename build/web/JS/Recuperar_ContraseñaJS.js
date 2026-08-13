/**
 * ClassControl — Recuperar Contraseña
 * recuperar_contrasena.js
 *
 * Incluye:
 *  - Validación de email en tiempo real
 *  - Simulación de envío con spinner
 *  - Panel de éxito con countdown para reenvío
 *  - Toast de feedback
 *  - Botón "Reenviar" tras 30 segundos
 */

/* ============================================================
   Helpers
   ============================================================ */

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.querySelector('.t-msg').textContent = message;
  toast.querySelector('.t-icon').textContent = type === 'success' ? 'check_circle' : 'error';
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 4000);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/* ============================================================
   Field validation
   ============================================================ */

function validateEmail() {
  const input = document.getElementById('email');
  const error = document.getElementById('emailError');
  const val   = input.value.trim();

  if (!val) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    error.textContent = 'El correo es obligatorio';
    error.classList.add('visible');
    return false;
  }
  if (!isValidEmail(val)) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    error.textContent = 'Ingresa un correo electrónico válido';
    error.classList.add('visible');
    return false;
  }

  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  error.classList.remove('visible');
  return true;
}

/* ============================================================
   Success panel + resend countdown
   ============================================================ */

let countdownTimer = null;

function showSuccess(email) {
  // Hide the form
  document.getElementById('recoveryForm').style.display = 'none';

  // Update email reference in success panel
  const emailRef = document.getElementById('successEmail');
  if (emailRef) emailRef.textContent = email;

  // Show success panel
  const panel = document.getElementById('successPanel');
  panel.classList.add('visible');

  // Start countdown (30 seconds) for resend
  startResendCountdown(30);
}

function startResendCountdown(seconds) {
  const timerEl  = document.getElementById('resendTimer');
  const resendEl = document.getElementById('resendLink');
  let remaining  = seconds;

  clearInterval(countdownTimer);

  timerEl.style.display  = 'block';
  resendEl.classList.remove('visible');

  function tick() {
    timerEl.querySelector('.countdown').textContent = remaining;
    if (remaining <= 0) {
      clearInterval(countdownTimer);
      timerEl.style.display = 'none';
      resendEl.classList.add('visible');
    }
    remaining--;
  }

  tick();
  countdownTimer = setInterval(tick, 1000);
}

function handleResend() {
  const email = document.getElementById('email').value.trim();
  const resendEl = document.getElementById('resendLink');
  resendEl.classList.remove('visible');
  showToast(`Enlace reenviado a ${email}`, 'success');
  startResendCountdown(30);
}

/* ============================================================
   Form submit
   ============================================================ */

function handleSubmit(e) {
  e.preventDefault();

  if (!validateEmail()) return;

  const email = document.getElementById('email').value.trim();
  const btn   = document.getElementById('submitBtn');

  // Loading state
  btn.classList.add('loading');
  btn.disabled = true;

  // Simulate API call (1.5 s)
  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    showSuccess(email);
    showToast(`Enlace enviado a ${email}`, 'success');
  }, 1500);
}

/* ============================================================
   Init
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('recoveryForm');
  const input = document.getElementById('email');

  if (form)  form.addEventListener('submit', handleSubmit);

  if (input) {
    // Live validation
    input.addEventListener('blur',  validateEmail);
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) validateEmail();
    });
  }

  const resendLink = document.getElementById('resendLink');
  if (resendLink) resendLink.addEventListener('click', handleResend);
});
