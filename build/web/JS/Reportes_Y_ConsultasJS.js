"use strict";

(() => {
  let programaciones = [];

  const byId = id => document.getElementById(id);

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function durationHours(item) {
    const start = (item.horaInicio || "").slice(0, 5).split(":");
    const end = (item.horaFin || "").slice(0, 5).split(":");
    if (start.length !== 2 || end.length !== 2) return 0;
    return Math.max(0, (Number(end[0]) * 60 + Number(end[1])
      - Number(start[0]) * 60 - Number(start[1])) / 60);
  }

  function filteredProgramaciones() {
    const programa = byId("selectPrograma")?.value || "";
    const search = (byId("inputBuscarReporte")?.value || "").trim().toLowerCase();
    return programaciones.filter(item => {
      const matchesProgram = !programa || item.fichaPrograma === programa;
      const text = [item.actividad, item.competencia, item.instructor, item.ambiente,
        item.fichaPrograma, item.estado].join(" ").toLowerCase();
      return matchesProgram && (!search || text.includes(search));
    });
  }

  function populateProgramas() {
    const select = byId("selectPrograma");
    if (!select) return;
    const current = select.value;
    const programas = [...new Set(programaciones.map(item => item.fichaPrograma).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "es"));
    select.innerHTML = '<option value="">Todos los programas</option>'
      + programas.map(programa => `<option value="${escapeHtml(programa)}">${escapeHtml(programa)}</option>`).join("");
    select.value = programas.includes(current) ? current : "";
  }

  function renderMetrics(rows) {
    const instructores = new Set(rows.map(item => item.instructorId)).size;
    const ambientes = new Set(rows.map(item => item.ambienteId)).size;
    const actividades = new Set(rows.map(item => item.actividadId)).size;
    const horas = rows.reduce((total, item) => total + durationHours(item), 0);

    byId("metricInstructores").textContent = instructores;
    byId("metricHoras").textContent = `${horas.toLocaleString("es-CO", { maximumFractionDigits: 1 })} h`;
    byId("metricOcupacion").textContent = ambientes;
    byId("metricCumplimiento").textContent = actividades;
  }

  function renderProgramas(rows) {
    const totals = new Map();
    rows.forEach(item => {
      const name = item.fichaPrograma || "Sin programa";
      totals.set(name, (totals.get(name) || 0) + durationHours(item));
    });
    const max = Math.max(...totals.values(), 1);
    const bars = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const container = byId("programaBars");
    if (!container) return;
    container.innerHTML = bars.length ? bars.map(([name, hours]) => `
      <div class="mb-3">
        <div class="d-flex justify-content-between gap-3 small mb-1">
          <span>${escapeHtml(name)}</span><strong>${hours.toLocaleString("es-CO", { maximumFractionDigits: 1 })} h</strong>
        </div>
        <div class="progress" style="height:8px"><div class="progress-bar bg-success" style="width:${Math.round(hours * 100 / max)}%"></div></div>
      </div>`).join("") : '<p class="text-muted mb-0">No hay programaciones registradas.</p>';
  }

  function renderTendencia(rows) {
    const byDate = new Map();
    rows.forEach(item => {
      const date = item.fechaInicio || "Sin fecha";
      byDate.set(date, (byDate.get(date) || 0) + durationHours(item));
    });
    const values = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-5);
    const max = Math.max(...values.map(([, hours]) => hours), 1);
    const chart = byId("tendenciaChart");
    const labels = byId("tendenciaLabels");
    if (chart) chart.innerHTML = values.map(([, hours]) => `<div class="cc-bar" style="height:${Math.max(8, Math.round(hours * 100 / max))}%" title="${hours} horas"></div>`).join("");
    if (labels) labels.innerHTML = values.map(([date]) => `<span>${escapeHtml(date.slice(5))}</span>`).join("");
  }

  function renderTable(rows) {
    const tbody = byId("tablaReportesBody");
    if (!tbody) return;
    tbody.innerHTML = rows.length ? rows.map(item => `
      <tr>
        <td><div class="d-flex align-items-center gap-2"><span class="material-symbols-outlined text-muted">assignment</span><span class="fw-medium">${escapeHtml(item.actividad)}</span></div></td>
        <td>${escapeHtml(item.fechaInicio)} - ${escapeHtml(item.fechaFin)}</td>
        <td><span class="badge bg-light text-dark border">${escapeHtml(item.fichaPrograma)}</span></td>
        <td class="text-end"><span class="text-muted small">${escapeHtml(item.instructor)} · ${escapeHtml(item.ambiente)}</span></td>
      </tr>`).join("") : '<tr><td colspan="4" class="text-center text-muted py-4">No hay datos para los filtros seleccionados.</td></tr>';
    const total = byId("btnVerTodos");
    if (total) total.textContent = `Programaciones encontradas (${rows.length})`;
  }

  function render() {
    const rows = filteredProgramaciones();
    renderMetrics(rows);
    renderProgramas(rows);
    renderTendencia(rows);
    renderTable(rows);
  }

  async function loadProgramaciones() {
    const response = await fetch("ConsultarProgramaciones", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    programaciones = await response.json();
    populateProgramas();
    render();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    byId("formFiltroPrograma")?.addEventListener("submit", event => {
      event.preventDefault();
      render();
    });
    byId("selectPrograma")?.addEventListener("change", render);
    byId("inputBuscarReporte")?.addEventListener("input", render);

    try {
      await loadProgramaciones();
    } catch (error) {
      console.error("No fue posible cargar los reportes", error);
      const tbody = byId("tablaReportesBody");
      if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">No fue posible cargar los datos.</td></tr>';
    }
  });
})();
