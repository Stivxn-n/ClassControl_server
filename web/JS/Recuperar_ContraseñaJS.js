/**
 * ClassControl - Recuperar Contraseña (flujo real)
 *
 * Verifica identidad (correo/usuario + documento) contra el endpoint
 * /RecuperarPassword y muestra UNA VEZ la contraseña temporal que
 * devuelve el servidor.
 */

/* ============================================================
   Helpers
   ============================================================ */

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.querySelector('.t-msg').textContent = message;
  toast.querySelector('.t-icon').textContent =
      type === 'success' ? 'check_circle' : 'error';
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

function marcar(input, errorEl, invalido, mensaje) {
  input.classList.toggle('is-invalid', invalido);
  input.classList.toggle('is-valid', !invalido && input.value.trim() !== '');
  if (invalido) {
    errorEl.querySelector('span:last-child').textContent = mensaje;
    errorEl.classList.add('visible');
  } else {
    errorEl.classList.remove('visible');
  }
  return !invalido;
}

function validateEmail() {
  const input = document.getElementById('email');
  const errorEl = document.getElementById('emailError');
  const val = input.value.trim();

  if (!val) return marcar(input, errorEl, true, 'El correo es obligatorio');
  if (!isValidEmail(val))
    return marcar(input, errorEl, true, 'Ingresa un correo electrónico válido');
  // El campo también acepta username; el formato de correo no es
  // obligatorio para todos los usuarios, así que solo exigimos texto.
  return marcar(input, errorEl, false, '');
}

function validateDocumento() {
  const input = document.getElementById('documento');
  const errorEl = document.getElementById('documentoError');
  const val = input.value.trim();

  if (!val) return marcar(input, errorEl, true, 'El documento es obligatorio');
  return marcar(input, errorEl, false, '');
}

/* ============================================================
   Success panel
   ============================================================ */

function showClave(clave) {
  document.getElementById('recoveryForm').style.display = 'none';

  const box = document.getElementById('claveTemporalBox');
  if (box) box.textContent = clave;

  const panel = document.getElementById('successPanel');
  panel.classList.add('visible');
}

/* ============================================================
   Form submit (llamada real al backend)
   ============================================================ */

async function handleSubmit(e) {
  e.preventDefault();

  if (!validateEmail()) return;
  if (!validateDocumento()) return;

  const correo = document.getElementById('email').value.trim();
  const documento = document.getElementById('documento').value.trim();
  const btn = document.getElementById('submitBtn');

  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const res = await fetch('/RecuperarPassword', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new URLSearchParams({
        correo: correo,
        identificacion: documento
      })
    });

    let data = {};
    try { data = await res.json(); } catch (_) {}

    if (res.ok && data.claveTemporal) {
      showClave(data.claveTemporal);
      showToast('Contraseña temporal generada.', 'success');
    } else {
      showToast(data.error || 'No se pudo recuperar la contraseña.', 'error');
    }
  } catch (err) {
    showToast('Error de conexión con el servidor.', 'error');
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

/* ============================================================
   Init
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recoveryForm');
  const email = document.getElementById('email');
  const documento = document.getElementById('documento');

  if (form) form.addEventListener('submit', handleSubmit);

  if (email) {
    email.addEventListener('blur', validateEmail);
    email.addEventListener('input', () => {
      if (email.classList.contains('is-invalid')) validateEmail();
    });
  }

  if (documento) {
    documento.addEventListener('blur', validateDocumento);
    documento.addEventListener('input', () => {
      if (documento.classList.contains('is-invalid')) validateDocumento();
    });
  }
});
