/* ============================================================
   ClassControl — Programación de Instructores
   Programacion_instructoresJS.js
   Bootstrap 5 + DataTables 1.13
   Lee datos desde el bloque <script type="application/json">
   inyectado por el Servlet (ProgramacionInstructoresServlet)
   a través del JSP. No usa datos hardcodeados.
   ============================================================ */

"use strict";

/* ── Constantes de dominio ───────────────────────────────── */

// Mapa de días del ENUM de MySQL → índice columna del calendario
const DAY_INDEX = {
  "LUN": 0,
  "MAR": 1,
  "MIE": 2,
  "JUE": 3,
  "VIE": 4,
  "SAB": 5,
};
const DAYS = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

// Código del ENUM → nombre legible (solo para mostrar en la tabla de lista)
const DAY_LABEL = {
  "LUN": "Lunes",
  "MAR": "Martes",
  "MIE": "Miércoles",
  "JUE": "Jueves",
  "VIE": "Viernes",
  "SAB": "Sábado",
};

function formatDiasSemana(codigos) {
  return (codigos || "")
    .split(",")
    .map(c => c.trim())
    .filter(Boolean)
    .map(c => DAY_LABEL[c] || c)
    .join(", ");
}

// Franjas horarias del calendario semanal (hora inicio de cada bloque)
const SLOT_LABELS = ["07:00", "10:00", "14:00"];

// Colores por estado — clave = valor en minúsculas que venga de la BD
const STATE_COLOR = {
  "activo":     "green",
  "en curso":   "orange",
  "finalizado": "blue",
  "inactivo":   "gray",
};

/* ── Leer datos desde el JSON embebido por el JSP ────────── */
let schedule = [];
let opcionesFiltrosCargadas = false;

/* ── Estado de UI ────────────────────────────────────────── */
let editingId        = null;
let filteredSchedule = [...schedule];

/* ── Bootstrap instances ─────────────────────────────────── */
let bsModal, bsToast, dtInstance;

/* ── DOM refs ────────────────────────────────────────────── */
const calendarBody     = document.getElementById("calendar-body");
const calendarView     = document.getElementById("calendar-view");
const listView         = document.getElementById("list-view");
const btnViewCal       = document.getElementById("btn-view-calendar");
const btnViewList      = document.getElementById("btn-view-list");
const btnNew           = document.getElementById("btn-new");
const btnDelete        = document.getElementById("btn-delete");
const form             = document.getElementById("scheduling-form");
const modalTitle       = document.getElementById("modal-title");
const searchInput      = document.getElementById("search-input");
const filterInstructor = document.getElementById("filter-instructor");
const filterFicha      = document.getElementById("filter-ficha");
const filterTrimestre  = document.getElementById("filter-trimestre");
const btnClearFilters  = document.getElementById("btn-clear-filters");
const btnDark          = document.getElementById("btn-dark-toggle");
const btnSidebarToggle = document.getElementById("btn-sidebar-toggle");
const sidebar          = document.getElementById("sidebar");
const toastEl          = document.getElementById("toast");
const toastBody        = document.getElementById("toast-body");

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
  bsModal = new bootstrap.Modal(document.getElementById("schedulingModal"));
  bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });

  await cargarProgramaciones();
  // Los controles principales no dependen de que DataTables cargue bien.
  bindEvents();
  initDataTable();
  applyFilters();
});

/* ══════════════════════════════════════════════════════════
   FILTROS
══════════════════════════════════════════════════════════ */
function applyFilters() {
  const query    = (searchInput?.value ?? "").toLowerCase().trim();

  filteredSchedule = schedule.filter(e => {
    const matchSearch =
      !query ||
      (e.instructor   || "").toLowerCase().includes(query) ||
      (e.ficha        || "").toLowerCase().includes(query) ||
      (e.fichaPrograma|| "").toLowerCase().includes(query) ||
      (e.trimestre    || "").toLowerCase().includes(query) ||
      (e.ambiente     || "").toLowerCase().includes(query);

    return matchSearch;
  });

  renderCalendar(filteredSchedule);
  reloadDataTable(filteredSchedule);
}

async function cargarProgramaciones() {
  const params = new URLSearchParams();
  if (filterInstructor?.value) params.set("instructorId", filterInstructor.value);
  if (filterFicha?.value) params.set("fichaId", filterFicha.value);
  if (filterTrimestre?.value) params.set("trimestreId", filterTrimestre.value);

  const url = `ConsultarProgramaciones${params.size ? `?${params.toString()}` : ""}`;
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    schedule = await response.json();
    if (!opcionesFiltrosCargadas) {
      llenarOpcionesFiltros(schedule);
      opcionesFiltrosCargadas = true;
    }
  } catch (error) {
    console.error("No fue posible cargar las programaciones", error);
    schedule = [];
    if (bsToast) showToast("No fue posible cargar la programación.", "error");
  }
}

function llenarOpcionesFiltros(datos) {
  agregarOpciones(filterInstructor, datos, "instructorId", "instructor");
  agregarOpciones(filterFicha, datos, "fichaId", "ficha", entry =>
    entry.fichaPrograma ? `${entry.ficha} - ${entry.fichaPrograma}` : entry.ficha);
  agregarOpciones(filterTrimestre, datos, "trimestreId", "trimestre");
}

function agregarOpciones(select, datos, idKey, labelKey, labelFn) {
  if (!select) return;
  const vistos = new Set();
  datos.forEach(entry => {
    const id = entry[idKey];
    if (id == null || vistos.has(String(id))) return;
    vistos.add(String(id));
    const option = document.createElement("option");
    option.value = id;
    option.textContent = labelFn ? labelFn(entry) : entry[labelKey];
    select.appendChild(option);
  });
}

async function cambiarFiltrosServidor() {
  await cargarProgramaciones();
  applyFilters();
}

/* ══════════════════════════════════════════════════════════
   CALENDARIO SEMANAL
══════════════════════════════════════════════════════════ */
function renderCalendar(data) {
  calendarBody.innerHTML = "";

  SLOT_LABELS.forEach((slotStart, slotIdx) => {
    const row = document.createElement("div");
    row.className = "cc-slot-row";

    // Etiqueta de hora
    const timeCell = document.createElement("div");
    timeCell.className = "cc-time-label";
    timeCell.textContent = slotStart;
    row.appendChild(timeCell);

    // Columnas por día
    DAYS.forEach(dayName => {
      const cell = document.createElement("div");
      cell.className = "cc-slot-cell";

      const matches = data.filter(e => {
        const hora = (e.horaInicio || "").slice(0, 5); // "HH:MM"
        const dias = (e.diasSemana || "").split(",").map(d => d.trim());
        return dias.includes(dayName) && hora === slotStart;
      });

      matches.forEach(entry => {
        const cardEl = document.createElement("div");
        cardEl.innerHTML = buildCardHTML(entry);
        const card = cardEl.firstElementChild;
        card.addEventListener("click", () => openEditModal(entry.id));
        cell.appendChild(card);
      });

      row.appendChild(cell);
    });

    calendarBody.appendChild(row);

    // Receso visual entre slot 0 y 1
    if (slotIdx === 0) calendarBody.appendChild(buildRecesoRow());
  });
}

function buildCardHTML(entry) {
  const color = resolveColor(entry);
  return `
    <div class="schedule-card schedule-card--${color}" data-id="${entry.id}">
      <h4 title="${escapeHtml(entry.fichaPrograma)}">${escapeHtml(entry.fichaPrograma)}</h4>
      <p>
        <span class="material-symbols-outlined" style="font-size:.7rem">person</span>
        ${escapeHtml(entry.instructor)}
      </p>
      <div class="sc-meta">
        <span>
          <span class="material-symbols-outlined">description</span>
          Ficha ${escapeHtml(entry.ficha)}
          <em style="font-size:.55rem;opacity:.7"> ${escapeHtml(entry.fichaPrograma)}</em>
        </span>
        <span>
          <span class="material-symbols-outlined">room</span>
          ${escapeHtml(entry.ambiente)}
        </span>
        <span>
          <span class="material-symbols-outlined">calendar_today</span>
          ${escapeHtml(entry.trimestre)}
        </span>
        <span>
          <span class="material-symbols-outlined">schedule</span>
          ${escapeHtml(entry.horaInicio)} – ${escapeHtml(entry.horaFin)}
        </span>
        <span class="cc-estado-pill cc-estado--${color}">
          ${escapeHtml(entry.estado)}
        </span>
      </div>
    </div>`;
}

function buildRecesoRow() {
  const row = document.createElement("div");
  row.className = "cc-receso-row";
  row.innerHTML = `
    <div class="cc-receso-label">Receso</div>
    <div class="cc-receso-line"></div>`;
  return row;
}

/* ══════════════════════════════════════════════════════════
   DATATABLE — Vista lista
══════════════════════════════════════════════════════════ */
function initDataTable() {
  dtInstance = $("#schedule-table").DataTable({
    data:    toTableData(schedule),
    columns: [
      { data: "actividad"   },
      { data: "instructor"  },
      { data: "ficha"       },
      { data: "trimestre"   },
      { data: "ambiente"    },
      { data: "diasSemana"  },
      { data: "horario"     },
      { data: "estadoBadge", orderable: false },
      { data: "vigencia"    },
      { data: "actions",    orderable: false  },
    ],
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json",
    },
    pageLength: 10,
    dom:
      "<'row mb-3'<'col-sm-6'l><'col-sm-6 d-flex justify-content-end'f>>" +
      "<'row'<'col-12'tr>>" +
      "<'row mt-3'<'col-sm-5'i><'col-sm-7 d-flex justify-content-end'p>>",
    drawCallback: bindEditButtons,
  });
}

function toTableData(data) {
  return data.map(e => {
    const color = resolveColor(e);
    return {
      actividad:   `${escapeHtml(e.actividad)}<small class="d-block text-muted">${escapeHtml(e.competencia)}</small>`,
      instructor:  escapeHtml(e.instructor),
      ficha:       `${escapeHtml(e.ficha)} <small class="text-muted">${escapeHtml(e.fichaPrograma)}</small>`,
      trimestre:   escapeHtml(e.trimestre),
      ambiente:    escapeHtml(e.ambiente),
      diasSemana:  escapeHtml(formatDiasSemana(e.diasSemana)),
      horario:     `${escapeHtml(e.horaInicio)} – ${escapeHtml(e.horaFin)}`,
      estadoBadge: `<span class="cc-pill cc-pill--${color}">${escapeHtml(e.estado)}</span>`,
      vigencia:    `${escapeHtml(e.fechaInicio)} <span class="text-muted">a</span> ${escapeHtml(e.fechaFin)}`,
      actions:     `<button class="btn btn-sm btn-outline-secondary py-0 px-2 btn-edit-row"
                            data-id="${e.id}" title="Editar">
                      <span class="material-symbols-outlined cc-icon-sm">edit</span>
                    </button>`,
      _id: e.id,
    };
  });
}

function reloadDataTable(data) {
  if (!dtInstance) return;
  dtInstance.clear();
  dtInstance.rows.add(toTableData(data));
  dtInstance.draw();
}

function bindEditButtons() {
  document.querySelectorAll(".btn-edit-row").forEach(btn => {
    btn.addEventListener("click", () => openEditModal(Number(btn.dataset.id)));
  });
}

/* ══════════════════════════════════════════════════════════
   MODAL — NUEVO / EDITAR
══════════════════════════════════════════════════════════ */
function openNewModal() {
  editingId = null;
  modalTitle.textContent = "Nueva Programación";
  form.reset();
  form.action = "RegistrarProgramacion";
  const fieldSlot = document.getElementById("field-slot");
  if (fieldSlot) fieldSlot.dispatchEvent(new Event("change"));
  const fieldId = document.getElementById("field-id");
  if (fieldId) fieldId.value = "";
  form.classList.remove("was-validated");
  btnDelete.classList.add("d-none");
  bsModal.show();
}

function openEditModal(id) {
  const entry = schedule.find(e => e.id === id);
  if (!entry) return;

  editingId = id;
  modalTitle.textContent = "Editar Programación";
  form.action = `ActualizarProgramacion?id=${id}`;
  form.classList.remove("was-validated");
  btnDelete.classList.remove("d-none");

  // Rellenar campos
  const fieldId = document.getElementById("field-id");
  if (fieldId) fieldId.value = entry.id;
  setSelectValue("field-trimestre",   entry.trimestreId);
  setSelectValue("field-instructor",  entry.instructorId);
  setSelectValue("field-ficha",       entry.fichaId);
  setSelectValue("field-ambiente",    entry.ambienteId);
  setSelectValue("field-estado",      entry.estadoId);
  setSelectValue("field-subject",     entry.actividadId);
  const fieldDay = document.getElementById("field-day");
  if (fieldDay) fieldDay.value = entry.diasSemana;
  const fieldHoraInicio = document.getElementById("field-hora-inicio");
  if (fieldHoraInicio) fieldHoraInicio.value = entry.horaInicio;
  const fieldHoraFin = document.getElementById("field-hora-fin");
  if (fieldHoraFin) fieldHoraFin.value = entry.horaFin;
  const fieldFechaInicio = document.getElementById("field-fecha-inicio");
  if (fieldFechaInicio) fieldFechaInicio.value = entry.fechaInicio;
  const fieldFechaFin = document.getElementById("field-fecha-fin");
  if (fieldFechaFin) fieldFechaFin.value = entry.fechaFin;
  const fieldObs = document.getElementById("field-obs");
  if (fieldObs) fieldObs.value = entry.observaciones ?? "";

  bsModal.show();
}

/* Helper: setea <select> por value (acepta número o string) */
function setSelectValue(elId, val) {
  const sel = document.getElementById(elId);
  if (!sel) return;
  const strVal = String(val);
  for (const opt of sel.options) {
    if (opt.value === strVal) { opt.selected = true; break; }
  }
}

/* ── Envío del formulario ────────────────────────────────── */
form.addEventListener("submit", e => {
  form.classList.add("was-validated");
  const fechaInicio = document.getElementById("field-fecha-inicio")?.value;
  const fechaFin = document.getElementById("field-fecha-fin")?.value;
  const horaInicio = document.getElementById("field-hora-inicio")?.value;
  const horaFin = document.getElementById("field-hora-fin")?.value;
  const rangoInvalido = (fechaInicio && fechaFin && fechaFin < fechaInicio)
    || (horaInicio && horaFin && horaFin <= horaInicio);
  if (!form.checkValidity() || rangoInvalido) {
    e.preventDefault();
    showToast(rangoInvalido ? "Verifica las fechas y horas." : "Completa todos los campos requeridos.", "error");
  }
  // Si es válido deja que el POST viaje al servlet
});

/* ── Eliminar ────────────────────────────────────────────── */
btnDelete.addEventListener("click", () => {
  if (editingId === null) return;
  if (!confirm("¿Eliminar esta programación? Esta acción no se puede deshacer.")) return;

  const f     = document.createElement("form");
  f.method    = "POST";
  f.action    = "EliminarProgramacion";
  const input = document.createElement("input");
  input.type  = "hidden";
  input.name  = "id";
  input.value = editingId;
  f.appendChild(input);
  document.body.appendChild(f);
  f.submit();
});

/* ══════════════════════════════════════════════════════════
   TOGGLE DE VISTAS
══════════════════════════════════════════════════════════ */
function activateView(view) {
  if (view === "calendar") {
    calendarView.classList.remove("d-none");
    listView.classList.add("d-none");
    btnViewCal.classList.add("active");
    btnViewList.classList.remove("active");
  } else {
    listView.classList.remove("d-none");
    calendarView.classList.add("d-none");
    btnViewList.classList.add("active");
    btnViewCal.classList.remove("active");
    if (dtInstance) dtInstance.columns.adjust().draw(false);
  }
}

/* ══════════════════════════════════════════════════════════
   DARK MODE
══════════════════════════════════════════════════════════ */
function toggleDarkMode() {
  const html = document.documentElement;
  html.setAttribute("data-bs-theme",
    html.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
}

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
function showToast(msg, type = "success") {
  toastBody.textContent = msg;
  toastEl.classList.remove("bg-success", "bg-danger", "bg-warning");
  const cls = type === "error" ? "bg-danger"
            : type === "warning" ? "bg-warning"
            : "bg-success";
  toastEl.classList.add(cls);
  bsToast.show();
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR MÓVIL
══════════════════════════════════════════════════════════ */
function toggleSidebar() {
  sidebar.classList.toggle("is-open");
}

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
function resolveColor(entry) {
  const key = (entry.estado ?? "").toLowerCase().trim();
  return STATE_COLOR[key] ?? "green";
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ── Bind de todos los eventos ───────────────────────────── */
function bindEvents() {
  btnNew.addEventListener("click", openNewModal);

  btnViewCal.addEventListener("click",  () => activateView("calendar"));
  btnViewList.addEventListener("click", () => activateView("list"));

  document.getElementById("field-slot")?.addEventListener("change", event => {
    const franjas = {
      "0": ["07:00", "10:00"],
      "1": ["10:00", "13:00"],
      "2": ["14:00", "17:00"],
    };
    const franja = franjas[event.target.value];
    if (!franja) return;
    document.getElementById("field-hora-inicio").value = franja[0];
    document.getElementById("field-hora-fin").value = franja[1];
  });

  searchInput?.addEventListener("input",  applyFilters);
  filterInstructor?.addEventListener("change", cambiarFiltrosServidor);
  filterFicha?.addEventListener("change", cambiarFiltrosServidor);
  filterTrimestre?.addEventListener("change", cambiarFiltrosServidor);
  btnClearFilters?.addEventListener("click", async () => {
    if (filterInstructor) filterInstructor.value = "";
    if (filterFicha) filterFicha.value = "";
    if (filterTrimestre) filterTrimestre.value = "";
    await cambiarFiltrosServidor();
  });

  if (btnDark)          btnDark.addEventListener("click", toggleDarkMode);
  if (btnSidebarToggle) btnSidebarToggle.addEventListener("click", toggleSidebar);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") bsModal?.hide();
  });
}
