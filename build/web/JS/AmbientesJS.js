/* ============================================================
   AmbientesJS.js — ClassControl
   CRUD + DataTables + Chart.js + Filtro por sede
   Datos reales desde el backend:
   - GET  ConsultarAmbientes -> lista de ambientes (JSON)
   - GET  ConsultarSedes     -> catálogo de sedes
   - POST RegistrarAmbiente  -> crear ambiente
   - POST ActualizarAmbiente -> editar ambiente
   - POST EliminarAmbiente   -> eliminar ambiente
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────
   1. ESTADO EN MEMORIA (poblado desde el backend)
────────────────────────────────────────── */
let ambientes = [];
let sedes = [];

let tablaAmbientes;
let chartAmbientes;
let deleteTargetId = null;

/* ──────────────────────────────────────────
   2. UTILIDADES
────────────────────────────────────────── */
const $id = id => document.getElementById(id);

function escapeHtml(value) {
  return ClassControl.escapeHtml(value);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sedeNombre(id) {
  const sede = sedes.find(s => s.id === id);
  return sede ? sede.nombre : '—';
}

function llenarSelectSedes(select, placeholder) {
  if (!select) return;
  const actual = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>` +
    sedes.map(s => `<option value="${s.id}">${escapeHtml(s.nombre)}</option>`).join('');
  if (actual) select.value = actual;
}

/* ──────────────────────────────────────────
   3. CARGA DE DATOS DESDE EL BACKEND
────────────────────────────────────────── */
async function cargarSedes() {
  const resp = await fetch('ConsultarSedes');
  sedes = resp.ok ? await resp.json() : [];
  llenarSelectSedes($id('filter-sede'), 'Todas');
  llenarSelectSedes($id('amb-sede'), 'Seleccionar…');
}

async function cargarAmbientes() {
  const resp = await fetch('ConsultarAmbientes');
  if (!resp.ok) throw new Error('No se pudo cargar la lista de ambientes');
  ambientes = await resp.json();
  reloadTable();
  applyExternalFilters();
  updateStats();
  updateChart();
}

async function inicializarDatos() {
  try {
    await cargarSedes();
    await cargarAmbientes();
  } catch (err) {
    console.error(err);
    showToast('No se pudieron cargar los datos desde el servidor.', 'danger');
  }
}

/* ──────────────────────────────────────────
   4. RENDERERS DATATABLES
────────────────────────────────────────── */
function renderAmbiente(data, type, row) {
  if (type === 'filter' || type === 'sort') return row.descripcion;
  return `
    <div class="ambiente-cell">
      <span class="ambiente-icon">
        <span class="material-symbols-outlined">meeting_room</span>
      </span>
      <span>
        <span class="ambiente-name">${escapeHtml(row.descripcion)}</span>
      </span>
    </div>`;
}

function renderSede(data, type, row) {
  const nombre = sedeNombre(row.sedeId);
  if (type === 'filter' || type === 'sort') return nombre;
  return escapeHtml(nombre);
}

function renderAcciones(id) {
  return `
    <span class="row-actions">
      <button class="btn btn-edit btn-edit-row" type="button" data-id="${id}"
              title="Editar" aria-label="Editar ambiente">
        <span class="material-symbols-outlined">edit</span>
      </button>
      <button class="btn btn-delete btn-delete-row" type="button" data-id="${id}"
              title="Eliminar" aria-label="Eliminar ambiente">
        <span class="material-symbols-outlined">delete</span>
      </button>
    </span>`;
}

/* ──────────────────────────────────────────
   5. DATATABLES
────────────────────────────────────────── */
function initDataTable() {
  tablaAmbientes = $('#tabla-ambientes').DataTable({
    data: ambientes,
    responsive: true,
    pageLength: 5,
    lengthMenu: [5, 10, 25],
    language: {
      emptyTable:    'No hay ambientes registrados',
      info:          'Mostrando _START_ a _END_ de _TOTAL_ ambientes',
      infoEmpty:     'Mostrando 0 ambientes',
      infoFiltered:  '(filtrado de _MAX_ ambientes)',
      lengthMenu:    'Ver _MENU_',
      loadingRecords:'Cargando...',
      processing:    'Procesando...',
      search:        'Buscar:',
      zeroRecords:   'No se encontraron ambientes',
      paginate: {
        first: 'Primero', last: 'Último',
        next: 'Siguiente', previous: 'Anterior',
      },
    },
    columns: [
      { data: null,       render: renderAmbiente },
      { data: null,       render: renderSede },
      { data: 'capacidad', className: 'text-center',
        render: data => `${data} <span class="text-muted" style="font-size:.75rem">personas</span>` },
      { data: 'id', orderable: false, searchable: false,
        className: 'text-end', render: renderAcciones },
    ],
  });
}

function reloadTable() {
  if (!tablaAmbientes) return;
  tablaAmbientes.clear();
  tablaAmbientes.rows.add(ambientes);
  tablaAmbientes.draw();
}

function applyExternalFilters() {
  if (!tablaAmbientes) return;
  const sede = $id('filter-sede').value;
  tablaAmbientes
    .column(1).search(sede ? `^${escapeRegex(sedeNombre(Number(sede)))}$` : '', true, false)
    .draw();
}

/* ──────────────────────────────────────────
   6. ESTADÍSTICAS
────────────────────────────────────────── */
function updateStats() {
  const totalCapacidad = ambientes.reduce((s, a) => s + Number(a.capacidad), 0);
  const sedesConAmbientes = new Set(ambientes.map(a => a.sedeId)).size;
  const promedio = ambientes.length ? Math.round(totalCapacidad / ambientes.length) : 0;

  $id('stat-total').textContent    = ambientes.length;
  $id('stat-capacidad').textContent = totalCapacidad;
  $id('stat-sedes').textContent    = sedesConAmbientes;
  $id('stat-promedio').textContent = promedio;
}

/* ──────────────────────────────────────────
   7. GRÁFICA CHART.JS (donut por sede)
────────────────────────────────────────── */
function getChartData() {
  return sedes.map(s => ambientes.filter(a => a.sedeId === s.id).length);
}

function initChart() {
  const ctx = $id('ambientesChart');
  if (!ctx) return;

  chartAmbientes = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sedes.map(s => s.nombre),
      datasets: [{
        data: getChartData(),
        backgroundColor: [ClassControl.colors.primary, ClassControl.colors.warning, ClassControl.colors.muted, ClassControl.colors.danger, ClassControl.colors.info],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '64%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: { family: 'DM Sans', size: 12, weight: '600' },
          },
        },
      },
    },
  });
}

function updateChart() {
  if (!chartAmbientes) return;
  chartAmbientes.data.labels = sedes.map(s => s.nombre);
  chartAmbientes.data.datasets[0].data = getChartData();
  chartAmbientes.update();
}

/* ──────────────────────────────────────────
   8. TOAST (CSS puro)
────────────────────────────────────────── */
let toastTimer = null;

const TOAST_VARIANTS = {
  success: { icon: 'check_circle',  color: 'var(--cc-primary)' },
  danger:  { icon: 'cancel',        color: ClassControl.colors.danger  },
  info:    { icon: 'info',          color: ClassControl.colors.info    },
  warning: { icon: 'warning',       color: ClassControl.colors.warning },
};

function showToast(message, variant = 'success') {
  const toastEl  = $id('toast');
  const msgEl    = $id('toast-msg');
  const iconEl   = $id('toast-icon');
  if (!toastEl || !msgEl || !iconEl) return;

  const v = TOAST_VARIANTS[variant] ?? TOAST_VARIANTS.success;
  msgEl.textContent  = message;
  iconEl.textContent = v.icon;
  iconEl.style.color = v.color;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
}

/* ──────────────────────────────────────────
   9. FORMULARIO HELPERS
────────────────────────────────────────── */
function resetForm() {
  const form = $id('form-ambiente');
  form.reset();
  form.classList.remove('was-validated');
  form.action = 'RegistrarAmbiente';
  $id('amb-id').value = '';
  $id('ambienteModalLabel').textContent = 'Nuevo Ambiente';
}

function setFormData(ambiente) {
  $id('amb-id').value        = ambiente.id;
  $id('amb-nombre').value    = ambiente.descripcion;
  $id('amb-sede').value      = ambiente.sedeId;
  $id('amb-capacidad').value = ambiente.capacidad;
}

/* ──────────────────────────────────────────
   10. GUARDAR (crear / editar) vía fetch
────────────────────────────────────────── */
async function saveAmbiente(event) {
  event.preventDefault();
  const form = event.currentTarget;
  form.classList.add('was-validated');

  if (!form.checkValidity()) {
    showToast('Revise los campos requeridos.', 'danger');
    return;
  }

  const id = Number($id('amb-id').value) || null;
  const params = new URLSearchParams({
    descripcion_Ambiente: $id('amb-nombre').value.trim(),
    Sede_id_sede: $id('amb-sede').value,
    capacidad: $id('amb-capacidad').value,
  });
  if (id) params.set('id', String(id));

  const url = id ? 'ActualizarAmbiente' : 'RegistrarAmbiente';

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    if (!resp.ok) throw new Error('Respuesta no exitosa del servidor');

    await cargarAmbientes();
    showToast(id ? 'Ambiente actualizado correctamente.' : 'Ambiente registrado correctamente.', 'success');
    bootstrap.Modal.getInstance($id('ambienteModal')).hide();
  } catch (err) {
    console.error(err);
    showToast('No se pudo guardar el ambiente. Verifica los datos e intenta de nuevo.', 'danger');
  }
}

/* ──────────────────────────────────────────
   11. MODALES EDITAR / ELIMINAR
────────────────────────────────────────── */
function openEditModal(id) {
  const ambiente = ambientes.find(a => a.id === id);
  if (!ambiente) return;
  resetForm();
  setFormData(ambiente);
  $id('ambienteModalLabel').textContent = 'Editar Ambiente';
  bootstrap.Modal.getOrCreateInstance($id('ambienteModal')).show();
}

function openDeleteModal(id) {
  const ambiente = ambientes.find(a => a.id === id);
  if (!ambiente) return;
  deleteTargetId = id;
  $id('delete-msg').textContent =
    `¿Seguro que desea eliminar "${ambiente.descripcion}"? Esta acción no se puede deshacer.`;
  bootstrap.Modal.getOrCreateInstance($id('deleteModal')).show();
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const ambiente = ambientes.find(a => a.id === deleteTargetId);
  const nombre = ambiente?.descripcion ?? 'Ambiente';

  try {
    const resp = await fetch('EliminarAmbiente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id: String(deleteTargetId) }),
    });
    if (!resp.ok) throw new Error('Respuesta no exitosa del servidor');

    deleteTargetId = null;
    await cargarAmbientes();
    bootstrap.Modal.getInstance($id('deleteModal')).hide();
    showToast(`"${nombre}" eliminado.`, 'info');
  } catch (err) {
    console.error(err);
    showToast('No se pudo eliminar el ambiente.', 'danger');
  }
}

/* ──────────────────────────────────────────
   12. EVENTOS
────────────────────────────────────────── */
function wireEvents() {
  /* Filtro externo */
  $id('filter-sede').addEventListener('change', applyExternalFilters);

  /* Nuevo ambiente */
  $id('btn-nuevo').addEventListener('click', resetForm);

  /* Formulario submit */
  $id('form-ambiente').addEventListener('submit', saveAmbiente);

  /* Confirmar eliminar */
  $id('btn-confirmar-delete').addEventListener('click', confirmDelete);

  /* Delegación en tabla */
  $id('tabla-ambientes').addEventListener('click', event => {
    const editBtn   = event.target.closest('.btn-edit-row');
    const deleteBtn = event.target.closest('.btn-delete-row');
    if (editBtn)   openEditModal(Number(editBtn.dataset.id));
    if (deleteBtn) openDeleteModal(Number(deleteBtn.dataset.id));
  });

  /* Sidebar toggle (móvil) */
  $id('btnSidebarToggle')?.addEventListener('click', () => {
    $id('sidebar').classList.toggle('open');
  });

  /* Atajo Alt+N → nuevo ambiente */
  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'n') {
      e.preventDefault();
      resetForm();
      bootstrap.Modal.getOrCreateInstance($id('ambienteModal')).show();
    }
  });
}

/* ──────────────────────────────────────────
   13. INICIALIZACIÓN
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initDataTable();
  initChart();
  wireEvents();
  inicializarDatos();
});
