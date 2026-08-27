'use strict';

/* -- SELECTORES -- */
const formLogin     = document.getElementById('form-login');
const inputUsuario  = document.getElementById('login-usuario');
const inputPassword = document.getElementById('login-password');
const checkRecordar = document.getElementById('recordarme');
const btnTogglePass = document.getElementById('btn-toggle-pass');
const iconPass      = document.getElementById('icon-pass');
const btnLogin      = document.getElementById('btn-login');
const btnLoginText  = document.getElementById('btn-login-text');
const btnLoginIcon  = document.getElementById('btn-login-icon');
const btnSpinner    = document.getElementById('btn-spinner');

/* -- RECORDARME - restaurar usuario -- */
(function restaurarUsuario() {
  const guardado = localStorage.getItem('cc_usuario');
  if (guardado) {
    inputUsuario.value    = guardado;
    checkRecordar.checked = true;
  }
})();

/* -- TOGGLE CONTRASEÑA -- */
btnTogglePass.addEventListener('click', () => {
  const visible = inputPassword.type === 'password';
  inputPassword.type = visible ? 'text' : 'password';
  iconPass.className = 'material-symbols-outlined';
  iconPass.textContent = visible ? 'visibility_off' : 'visibility';
  inputPassword.focus();
});

/* -- LIMPIAR ERRORES AL ESCRIBIR -- */
[inputUsuario, inputPassword].forEach(campo => {
  campo.addEventListener('input', () => {
    campo.classList.remove('is-invalid');
  });
});

/* -- VALIDACIÓN -- */
function validarCampos() {
  let valido = true;

  if (!inputUsuario.value.trim()) {
    inputUsuario.classList.add('is-invalid');
    valido = false;
  } else {
    inputUsuario.classList.remove('is-invalid');
  }

  if (!inputPassword.value) {
    inputPassword.classList.add('is-invalid');
    valido = false;
  } else {
    inputPassword.classList.remove('is-invalid');
  }

  return valido;
}

/* -- SUBMIT -> envía al servlet real /Iniciar -- */
formLogin.addEventListener('submit', (e) => {
  if (!validarCampos()) {
    e.preventDefault(); // Solo cancela si hay campos vacíos
    return;
  }

  // Guardar preferencia recordarme ANTES de enviar
  checkRecordar.checked
    ? localStorage.setItem('cc_usuario', inputUsuario.value.trim())
    : localStorage.removeItem('cc_usuario');

  // Mostrar spinner
  btnLogin.disabled        = true;
  btnLoginText.textContent = 'Verificando…';
  btnLoginIcon.classList.add('d-none');
  btnSpinner.classList.remove('d-none');

  // ? El formulario se envía normalmente al servlet /Iniciar
});

/* -- ENTER DESDE CUALQUIER CAMPO -- */
[inputUsuario, inputPassword].forEach(campo => {
  campo.addEventListener('keydown', e => {
    if (e.key === 'Enter') formLogin.requestSubmit();
  });
});
