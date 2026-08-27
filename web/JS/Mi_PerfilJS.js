/* ClassControl - Mi Perfil (Bootstrap 5) */

(() => {
  'use strict';

  const STORAGE_KEYS = {
    prefs: 'cc_profile_prefs',
    legacyProfile: 'cc_profile_data',
    notifications: 'cc_profile_notifications'
  };

  const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9RbNayg0uD8d6VrgYgLzyUvBjkd-_MJABU6ZwO_jsdoNcOQwz5eCvECVCTdXf42AMADF3cYVLr_d1HbQciAo3voDlwETXof2nAg_kFusorx-GrT8WnDhVg1C4ieO8WKAXslFS38MmKubNEgVu-zob64Q9DI9187gBtqT8q6aG66yzFaL_z1kJvgSTgoMLVf5YyL0MgTLbRNxNEv6NzjULrL5rZUoke3duGXAYyCL-c6rnVBdYqiwgH_htpIshyHpSC823tun09ys';

  // Los datos de identidad (nombre, rol, correo, cédula) SIEMPRE vienen
  // del servidor (/api/MiPerfil). En localStorage solo se guardan
  // preferencias locales del navegador (avatar y sede visualizada).
  const defaultProfile = {
    name: '',
    role: '',
    email: '',
    cedula: '',
    sede: '',
    department: '',
    avatar: DEFAULT_AVATAR
  };

  const defaultPrefs = {
    sede: '',
    avatar: DEFAULT_AVATAR
  };

  const defaultNotifications = {
    actividades: true,
    programacion: true,
    reportes: false,
    anuncios: true
  };

  const accessHistory = [
    ['2026-06-14 08:45', 'Bogotá, CO', 'Chrome / Windows', '<span class="badge text-bg-success">Correcto</span>'],
    ['2026-06-13 18:20', 'Bogotá, CO', 'Mobile / Android', '<span class="badge text-bg-success">Correcto</span>'],
    ['2026-06-12 07:58', 'Medellín, CO', 'Firefox / Linux', '<span class="badge text-bg-warning">Verificación 2FA</span>'],
    ['2026-06-10 22:14', 'IP desconocida', 'Safari / macOS', '<span class="badge text-bg-danger">Bloqueado</span>']
  ];

  let profile = { ...defaultProfile };
  let prefs = loadPrefs();
  profile.sede = prefs.sede || '';
  profile.avatar = prefs.avatar || DEFAULT_AVATAR;
  let notifications = loadJson(STORAGE_KEYS.notifications, defaultNotifications);

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.prefs);
      if (raw) return { ...defaultPrefs, ...JSON.parse(raw) };
    } catch { /* preferencias corruptas: usar defaults */ }
    // Migración: si había un perfil viejo guardado, conservar solo el
    // avatar y la sede como preferencia local y borrar el resto.
    try {
      const legacy = JSON.parse(localStorage.getItem(STORAGE_KEYS.legacyProfile) || 'null');
      if (legacy) {
        const migrado = {
          sede: typeof legacy.sede === 'string' ? legacy.sede : '',
          avatar: typeof legacy.avatar === 'string' ? legacy.avatar : DEFAULT_AVATAR
        };
        localStorage.removeItem(STORAGE_KEYS.legacyProfile);
        return migrado;
      }
    } catch { /* sin datos legados */ }
    return { ...defaultPrefs };
  }

  let accessTable = null;

  const toastEl = document.getElementById('appToast');
  const toastBody = document.getElementById('appToastBody');
  const appToast = new bootstrap.Toast(toastEl, { delay: 2600 });

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return { ...fallback };
      return { ...fallback, ...JSON.parse(raw) };
    } catch {
      return { ...fallback };
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function showToast(message, type = 'success') {
    toastEl.classList.remove('toast-success', 'toast-info', 'toast-error');
    if (type === 'error') toastEl.classList.add('toast-error');
    else if (type === 'info') toastEl.classList.add('toast-info');
    else toastEl.classList.add('toast-success');

    toastBody.textContent = message;
    appToast.show();
  }

  function renderProfileCards() {
    document.getElementById('displayName').textContent = profile.name;
    document.getElementById('displayRole').textContent = profile.role;
    document.getElementById('displayEmail').textContent = profile.email;
    document.getElementById('displaySede').textContent = profile.sede;
    document.getElementById('displayDepartment').textContent = profile.department;
    document.getElementById('displayCedula').textContent = profile.cedula;
    document.getElementById('avatarPreview').src = profile.avatar;
  }

  function fillProfileForm() {
    document.getElementById('fieldName').value = profile.name;
    document.getElementById('fieldRole').value = profile.role;
    document.getElementById('fieldEmail').value = profile.email;
    document.getElementById('fieldCedula').value = profile.cedula;
    document.getElementById('fieldSede').value = profile.sede;
    document.getElementById('fieldDepartment').value = profile.department;
  }

  function resetFormValidation(form) {
    form.classList.remove('was-validated');
    [...form.elements].forEach((el) => {
      if (el.classList) el.classList.remove('is-invalid');
    });
  }

  function validateProfileForm() {
    const form = document.getElementById('profileForm');
    resetFormValidation(form);

    const name = document.getElementById('fieldName').value.trim();
    const role = document.getElementById('fieldRole').value.trim();
    const email = document.getElementById('fieldEmail').value.trim();
    const cedula = document.getElementById('fieldCedula').value.trim();
    const sede = document.getElementById('fieldSede').value.trim();
    const department = document.getElementById('fieldDepartment').value.trim();

    let valid = true;

    if (name.length < 3) {
      document.getElementById('fieldName').classList.add('is-invalid');
      valid = false;
    }

    if (role.length < 3) {
      document.getElementById('fieldRole').classList.add('is-invalid');
      valid = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      document.getElementById('fieldEmail').classList.add('is-invalid');
      valid = false;
    }

    if (!cedula) {
      document.getElementById('fieldCedula').classList.add('is-invalid');
      valid = false;
    }

    if (!sede) {
      document.getElementById('fieldSede').classList.add('is-invalid');
      valid = false;
    }

    if (!department) {
      document.getElementById('fieldDepartment').classList.add('is-invalid');
      valid = false;
    }

    if (!valid) form.classList.add('was-validated');
    return valid;
  }

  function passwordStrength(password) {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const levels = [
      { label: 'Seguridad: muy débil', width: '10%', color: '#dc3545' },
      { label: 'Seguridad: débil', width: '25%', color: '#dc3545' },
      { label: 'Seguridad: regular', width: '50%', color: '#fd7e14' },
      { label: 'Seguridad: buena', width: '75%', color: '#ffc107' },
      { label: 'Seguridad: fuerte', width: '100%', color: '#38a800' }
    ];

    return levels[score];
  }

  function updatePasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const bar = document.getElementById('passwordStrengthBar');
    const text = document.getElementById('passwordStrengthText');
    const current = passwordStrength(password);

    bar.style.width = current.width;
    bar.style.backgroundColor = current.color;
    text.textContent = password ? current.label : 'Seguridad: —';
    text.style.color = password ? current.color : '#64748b';
  }

  function clearPasswordErrors() {
    ['currentPassword', 'newPassword', 'confirmPassword'].forEach((id) => {
      document.getElementById(id).classList.remove('is-invalid');
    });
    ['currentPasswordError', 'newPasswordError', 'confirmPasswordError'].forEach((id) => {
      document.getElementById(id).textContent = '';
    });
  }

  function validatePasswordForm() {
    clearPasswordErrors();

    const current = document.getElementById('currentPassword').value;
    const next = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    let valid = true;

    if (!current) {
      document.getElementById('currentPassword').classList.add('is-invalid');
      document.getElementById('currentPasswordError').textContent = 'Ingresa tu contraseña actual.';
      valid = false;
    }

    const policyRe = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!policyRe.test(next)) {
      document.getElementById('newPassword').classList.add('is-invalid');
      document.getElementById('newPasswordError').textContent = 'Debe incluir mínimo 8 caracteres, una mayúscula, un número y un símbolo.';
      valid = false;
    }

    if (next !== confirm) {
      document.getElementById('confirmPassword').classList.add('is-invalid');
      document.getElementById('confirmPasswordError').textContent = 'La confirmación no coincide.';
      valid = false;
    }

    if (current && next && current === next) {
      document.getElementById('newPassword').classList.add('is-invalid');
      document.getElementById('newPasswordError').textContent = 'La nueva contraseña debe ser diferente a la actual.';
      valid = false;
    }

    return valid;
  }

  function buildNotifications() {
    const items = [
      { key: 'actividades', label: 'Actividades', hint: 'Avisos de tareas y cambios de estado.' },
      { key: 'programacion', label: 'Programación', hint: 'Cambios de horario y asignaciones.' },
      { key: 'reportes', label: 'Reportes', hint: 'Nuevos reportes o reportes pendientes.' },
      { key: 'anuncios', label: 'Anuncios', hint: 'Comunicados institucionales.' }
    ];

    const container = document.getElementById('notificationPrefs');
    container.innerHTML = items.map((item) => {
      const checked = notifications[item.key] ? 'checked' : '';
      return `
        <div class="col-12 col-md-6">
          <div class="border rounded-3 p-3 h-100 bg-light-subtle">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                <p class="fw-semibold mb-1 text-brand-blue">${item.label}</p>
                <p class="text-muted small mb-0">${item.hint}</p>
              </div>
              <div class="form-check form-switch m-0">
                <input class="form-check-input notif-switch" type="checkbox" role="switch" data-key="${item.key}" ${checked}>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    document.querySelectorAll('.notif-switch').forEach((input) => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.key;
        notifications[key] = e.target.checked;
        saveJson(STORAGE_KEYS.notifications, notifications);
        showToast(`Preferencia de "${key}" actualizada.`, 'info');
      });
    });
  }

  function initAccessTable() {
    accessTable = $('#accessTable').DataTable({
      data: accessHistory,
      columns: [
        { title: 'Fecha' },
        { title: 'Ubicación' },
        { title: 'Dispositivo' },
        { title: 'Estado' }
      ],
      pageLength: 5,
      lengthMenu: [5, 10, 25],
      order: [[0, 'desc']],
      language: {
        search: 'Buscar:',
        lengthMenu: 'Mostrar _MENU_ registros',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ accesos',
        infoEmpty: 'Mostrando 0 a 0 de 0 accesos',
        zeroRecords: 'No se encontraron accesos',
        paginate: { first: 'Primero', last: 'Último', next: 'Siguiente', previous: 'Anterior' }
      }
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
      accessTable.search(e.target.value).draw();
    });
  }

  function bindEvents() {
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');

    document.getElementById('btnUploadAvatar').addEventListener('click', () => {
      document.getElementById('avatarInput').click();
    });

    document.getElementById('avatarInput').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Archivo no válido. Debe ser una imagen.', 'error');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        showToast('La imagen supera 2MB. Selecciona una más liviana.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        profile.avatar = ev.target.result;
        prefs.avatar = ev.target.result;
        saveJson(STORAGE_KEYS.prefs, prefs);
        renderProfileCards();
        showToast('Foto de perfil actualizada.', 'success');
      };
      reader.readAsDataURL(file);
    });

    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateProfileForm()) return;

      const email = document.getElementById('fieldEmail').value.trim();
      const department = document.getElementById('fieldDepartment').value.trim();
      const sede = document.getElementById('fieldSede').value.trim();

      try {
        // El servidor solo actualiza correo y profesión (datos de
        // contacto); nombre, rol y cédula los gestiona el administrador.
        const resp = await fetch('api/MiPerfil', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: new URLSearchParams({ correo: email, profesion: department })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'No fue posible guardar el perfil.');

        profile.email = data.correo || email;
        profile.department = data.profesion || department;
        profile.sede = sede;
        prefs.sede = sede;
        saveJson(STORAGE_KEYS.prefs, prefs);

        renderProfileCards();
        showToast(data.mensaje || 'Perfil actualizado correctamente.', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    document.getElementById('btnQuickSave').addEventListener('click', () => {
      profileForm.requestSubmit();
    });

    document.getElementById('btnCancelProfile').addEventListener('click', () => {
      fillProfileForm();
      resetFormValidation(profileForm);
      showToast('Cambios de perfil descartados.', 'info');
    });

    document.getElementById('btnResetProfile').addEventListener('click', () => {
      profile = { ...defaultProfile };
      prefs = { ...defaultPrefs };
      notifications = { ...defaultNotifications };
      saveJson(STORAGE_KEYS.prefs, prefs);
      saveJson(STORAGE_KEYS.notifications, notifications);
      fillProfileForm();
      renderProfileCards();
      buildNotifications();
      resetFormValidation(profileForm);
      showToast('Preferencias restablecidas. Cargando tus datos...', 'info');
      cargarPerfilServidor();
    });

    document.getElementById('newPassword').addEventListener('input', updatePasswordStrength);

    document.querySelectorAll('.toggle-password').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        const icon = btn.querySelector('.material-symbols-outlined');
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        icon.textContent = show ? 'visibility' : 'visibility_off';
      });
    });

    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validatePasswordForm()) return;

      passwordForm.reset();
      clearPasswordErrors();
      updatePasswordStrength();
      showToast('Contraseña actualizada correctamente.', 'success');
    });

    document.getElementById('btnCancelPassword').addEventListener('click', () => {
      passwordForm.reset();
      clearPasswordErrors();
      updatePasswordStrength();
      showToast('Cambio de contraseña cancelado.', 'info');
    });
  }

  async function cargarPerfilServidor() {
    try {
      const resp = await fetch('api/MiPerfil', { headers: { Accept: 'application/json' } });
      if (resp.status === 401) {
        window.location.href = 'Inicio_de_sesion.jsp';
        return;
      }
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'No fue posible cargar tu perfil.');

      const nombreCompleto = [data.nombres, data.apellidos]
        .filter(Boolean).join(' ').trim();

      profile = {
        ...profile,
        name: nombreCompleto || data.username || profile.name,
        role: data.rolNombre || profile.role,
        email: data.correo || '',
        cedula: data.identificacion || '',
        department: data.profesion || ''
      };

      renderProfileCards();
      fillProfileForm();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderProfileCards();
    fillProfileForm();
    buildNotifications();
    initAccessTable();
    bindEvents();
    updatePasswordStrength();
    cargarPerfilServidor();
  });
})();