<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%-- Protección de sesión: todos los roles pueden consultar juicios --%>
<%
  String sesNombres   = (String)  session.getAttribute("nombres");
  String sesApellidos = (String)  session.getAttribute("apellidos");
  String sesUsername  = (String)  session.getAttribute("username");
  Integer sesRol      = (Integer) session.getAttribute("rol");
  Integer sesIdUser   = (Integer) session.getAttribute("id_usuario");

  if (sesNombres == null) {
    response.sendRedirect("Inicio_de_sesion.jsp");
    return;
  }
  // Instructor(1) y Coordinador(4) gestionan; Aprendiz(2) solo ve los suyos;
  // Administrador(3) además elimina.
  boolean esStaffWeb    = (sesRol != null && (sesRol == 1 || sesRol == 3 || sesRol == 4));
  boolean esAdminWebJ   = (sesRol != null && sesRol == 3);
  boolean esAprendizWeb = (sesRol != null && sesRol == 2);
%>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Juicios evaluativos - ClassControl</title>
  <link rel="icon" type="image/png" href="img/logo.png" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
  <link rel="stylesheet" href="CSS/ClassControl_base.css"/>
  <link rel="stylesheet" href="CSS/ClassControl_theme.css" />
  <link rel="stylesheet" href="CSS/ClassControl_sidebar.css" />
</head>
<body>
<div class="cc-layout">

<% String ccActivePage = "juicios"; %>
<%@ include file="_Sidebar.jspf" %>

<main class="cc-main cc-catalog-main">

  <!-- Toggle sidebar (móvil) -->
  <button class="cc-sidebar-toggle d-lg-none" id="sidebar-toggle" aria-label="Abrir menú">
    <span class="material-symbols-outlined">menu</span>
  </button>

  <!-- Page header -->
  <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
    <div>
      <h1 class="cc-page-title"><%= esAprendizWeb ? "Mis juicios evaluativos" : "Juicios evaluativos" %></h1>
      <p class="text-muted mb-0">
        <%= esAprendizWeb
              ? "Consulta aquí tus notas finales por resultado de aprendizaje."
              : "Registra y actualiza si el aprendiz aprobó o está en proceso." %>
      </p>
    </div>
    <div class="d-flex flex-wrap gap-2">
      <button id="dark-toggle" class="btn cc-icon-btn" title="Cambiar tema">
        <span class="material-symbols-outlined">dark_mode</span>
      </button>
      <% if (esStaffWeb) { %>
      <button type="button" class="btn cc-btn-primary" id="btnNuevo">
        <span class="material-symbols-outlined">add_circle</span>
        Nuevo juicio
      </button>
      <% } %>
    </div>
  </div>

  <div class="card cc-card mb-4">
    <div class="card-body">
      <div class="table-responsive">
        <table class="table cc-table align-middle mb-0">
          <thead>
            <tr>
              <th>Resultado de aprendizaje</th>
              <% if (!esAprendizWeb) { %><th>Aprendiz</th><% } %>
              <th>Trimestre</th>
              <th>Valoración</th>
              <th>Observación</th>
              <th>Fecha</th>
              <% if (esStaffWeb) { %><th class="text-end">Acciones</th><% } %>
            </tr>
          </thead>
          <tbody id="cuerpoTabla">
            <tr><td colspan="7" class="text-center text-muted py-4">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</main>
</div><!-- /.cc-layout -->

<!-- Modal crear / editar juicio -->
<div class="modal fade" id="modalJuicio" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="tituloModal">Nuevo juicio evaluativo</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label" for="selAprendiz">Aprendiz *</label>
          <select id="selAprendiz" class="form-select"></select>
        </div>
        <div class="mb-3">
          <label class="form-label" for="selValoracion">Valoración *</label>
          <select id="selValoracion" class="form-select">
            <option>Aprobado</option>
            <option>En proceso</option>
            <option>Por evaluar</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label" for="selResultado">Resultado de aprendizaje</label>
          <select id="selResultado" class="form-select"></select>
        </div>
        <div class="mb-3">
          <label class="form-label" for="selTrimestre">Trimestre</label>
          <select id="selTrimestre" class="form-select"></select>
        </div>
        <div class="mb-2">
          <label class="form-label" for="txtObservacion">Observación</label>
          <textarea id="txtObservacion" class="form-control" rows="2"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn cc-btn-outline" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn cc-btn-primary" id="btnGuardar">Guardar</button>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="JS/ClassControl_ui.js"></script>
<script src="JS/ClassControl_theme.js"></script>
<script>
(() => {
  'use strict';
  const ES_STAFF   = <%= esStaffWeb %>;
  const ES_ADMIN   = <%= esAdminWebJ %>;
  const ES_APRENDIZ = <%= esAprendizWeb %>;

  let juicios = [], aprendices = [], resultados = [], trimestres = [];
  let idEditando = null;

  const $id = i => document.getElementById(i);
  const esc = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  function toast(msg, tipo = 'ok') {
    if (window.ClassControl?.ui?.toast) { window.ClassControl.ui.toast(msg, tipo); return; }
    alert(msg);
  }

  async function pedir(url) {
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error('No se pudo cargar ' + url);
    return r.json();
  }

  async function cargar() {
    const cuerpo = $id('cuerpoTabla');
    try {
      const peticiones = [pedir('/ConsultarJuicios'.replace('/',''))];
      if (ES_STAFF) {
        peticiones.push(pedir('ConsultarUsuarios'), pedir('ConsultarResultados'), pedir('ConsultarTrimestres'));
      }
      const res = await Promise.all(peticiones);
      juicios = Array.isArray(res[0]) ? res[0] : [];
      if (ES_STAFF) {
        aprendices = (res[1] || []).filter(u => Number(u.rolId) === 2);
        resultados = res[2] || [];
        trimestres = res[3] || [];
      }
      render();
    } catch (err) {
      console.error(err);
      cuerpo.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">' +
        esc(err.message) + '</td></tr>';
    }
  }

  function badge(valoracion) {
    const v = String(valoracion || '').toLowerCase();
    if (v.includes('aprob')) return '<span class="badge text-bg-success">' + esc(valoracion) + '</span>';
    if (v.includes('proceso')) return '<span class="badge text-bg-warning">' + esc(valoracion) + '</span>';
    return '<span class="badge text-bg-secondary">' + esc(valoracion || '-') + '</span>';
  }

  function render() {
    const cuerpo = $id('cuerpoTabla');
    if (!juicios.length) {
      const cols = ES_APRENDIZ ? 5 : 6 + (ES_STAFF ? 1 : 0);
      cuerpo.innerHTML = '<tr><td colspan="' + cols +
        '" class="text-center text-muted py-4">No hay juicios registrados todavía.</td></tr>';
      return;
    }
    cuerpo.innerHTML = juicios.map(j => {
      let acciones = '';
      if (ES_STAFF) {
        acciones = '<td class="text-end">' +
          '<button class="cc-btn-icon cc-btn-icon--edit" data-editar="' + j.id + '" title="Editar">' +
            '<span class="material-symbols-outlined">edit</span></button> ' +
          (ES_ADMIN ? '<button class="cc-btn-icon cc-btn-icon--delete" data-eliminar="' + j.id + '" title="Eliminar">' +
            '<span class="material-symbols-outlined">delete</span></button>' : '') +
          '</td>';
      }
      return '<tr>' +
        '<td>' + esc(j.resultado || 'Sin resultado asignado') + '</td>' +
        (ES_APRENDIZ ? '' : '<td>' + esc(j.aprendiz || '-') + '</td>') +
        '<td>' + esc(j.trimestre || '-') + '</td>' +
        '<td>' + badge(j.valoracion) + '</td>' +
        '<td>' + esc(j.observacion || '-') + '</td>' +
        '<td>' + esc(String(j.fechaRegistro || '').substring(0, 16)) + '</td>' +
        acciones +
      '</tr>';
    }).join('');
  }

  function llenarSelect(sel, lista, conTodos) {
    sel.innerHTML = '';
    if (conTodos) {
      const op = document.createElement('option');
      op.value = ''; op.textContent = conTodos;
      sel.appendChild(op);
    }
    lista.forEach(x => {
      const op = document.createElement('option');
      op.value = x.id;
      op.textContent = x.texto;
      sel.appendChild(op);
    });
  }

  function abrirModal(j) {
    idEditando = j ? j.id : null;
    $id('tituloModal').textContent = j ? 'Editar juicio' : 'Nuevo juicio';

    llenarSelect($id('selAprendiz'),
      aprendices.map(a => ({ id: a.id, texto: (a.nombres || '') + ' ' + (a.apellidos || '') })),
      'Seleccionar...');
    llenarSelect($id('selResultado'),
      resultados.map(r => ({ id: r.id, texto: (r.codigo ? r.codigo + ' — ' : '') + (r.descripcion || '') })),
      'Ninguno');
    llenarSelect($id('selTrimestre'),
      trimestres.map(t => ({ id: t.id, texto: 'Trimestre ' + (t.numTrimestre ?? t.id) })),
      'Ninguno');

    $id('selValoracion').value = j ? (j.valoracion || 'Aprobado') : 'Aprobado';
    $id('selAprendiz').value = j && j.aprendizId ? String(j.aprendizId) : '';
    $id('selAprendiz').disabled = !!j;
    $id('selResultado').value = j && j.resultadoId ? String(j.resultadoId) : '';
    $id('selTrimestre').value = j && j.trimestreId ? String(j.trimestreId) : '';
    $id('txtObservacion').value = j ? (j.observacion || '') : '';

    bootstrap.Modal.getOrCreateInstance($id('modalJuicio')).show();
  }

  async function guardar() {
    const params = { valoracion: $id('selValoracion').value,
                     observacion: $id('txtObservacion').value.trim() };
    let url;
    if (idEditando) {
      url = 'ActualizarJuicio';
      params.id = String(idEditando);
      if ($id('selResultado').value) params.resultadoId = $id('selResultado').value;
      if ($id('selTrimestre').value) params.trimestreId = $id('selTrimestre').value;
    } else {
      if (!$id('selAprendiz').value) { toast('Selecciona un aprendiz.', 'error'); return; }
      url = 'GuardarJuicio';
      params.idAprendiz = $id('selAprendiz').value;
      if ($id('selResultado').value) params.resultadoId = $id('selResultado').value;
      if ($id('selTrimestre').value) params.trimestreId = $id('selTrimestre').value;
    }
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params)
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || 'No se pudo guardar el juicio');
      bootstrap.Modal.getInstance($id('modalJuicio'))?.hide();
      toast(idEditando ? 'Juicio actualizado.' : 'Juicio guardado.', 'ok');
      cargar();
    } catch (err) {
      toast(err.message || 'Error al guardar.', 'error');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este juicio evaluativo? No se puede deshacer.')) return;
    try {
      const resp = await fetch('EliminarJuicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: String(id) })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || 'No se pudo eliminar');
      toast('Juicio eliminado.', 'ok');
      cargar();
    } catch (err) {
      toast(err.message || 'Error al eliminar.', 'error');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    cargar();
    $id('btnNuevo')?.addEventListener('click', () => abrirModal(null));
    $id('btnGuardar')?.addEventListener('click', guardar);
    $id('cuerpoTabla')?.addEventListener('click', e => {
      const bEd = e.target.closest('[data-editar]');
      const bEl = e.target.closest('[data-eliminar]');
      if (bEd) abrirModal(juicios.find(j => String(j.id) === bEd.dataset.editar));
      if (bEl) eliminar(bEl.dataset.eliminar);
    });
  });
})();
</script>
</body>
</html>
