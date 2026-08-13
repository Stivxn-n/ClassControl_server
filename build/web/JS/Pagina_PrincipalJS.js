/* ═══════════════════════════════════════════════════════════════
   ClassControl — Bloque de catálogos (reemplaza el script inline
   al final de Pagina_Principal.jsp)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Mapa: data-catalogo → Servlet ── */
  const SERVLET_MAP = {
    programa           : "RegistrarPrograma",
    sede               : "RegistrarSede",
    jornada            : "RegistrarJornada",
    modalidad          : "RegistrarModalidad",
    nivel              : "RegistrarNivel",
    etapa              : "RegistrarEtapa",
    estado             : "RegistrarEstado",
    tipoDocumento      : "RegistrarTipoDocumento",
    tipoVinculacion    : "RegistrarTipoVinculacion",
    rol                : "RegistrarRol",
    trimestre          : "RegistrarTrimestre",
    competencia        : "RegistrarCompetencia",
    resultado          : "RegistrarResultado",
    vinculacionLaboral : "RegistrarVinculacionLaboral",
    programacion       : "RegistrarProgramacion",
  };

  /* ── Mapa: data-catalogo → campos HTML del form ──
     Los `name` coinciden exactamente con lo que lee cada Servlet.
  ── */
  const FIELDS_MAP = {

    /* RegistrarRol → texto(request, "descripcion_Roles") */
    rol: `
      <div class="col-12">
        <label class="form-label">Descripción del rol *</label>
        <input name="descripcion_Roles" class="form-control"
               placeholder="ej. Instructor" required />
        <div class="invalid-feedback">Ingresa la descripción</div>
      </div>`,

    /* RegistrarSede → texto(request, "nombre_sede") */
    sede: `
      <div class="col-12">
        <label class="form-label">Nombre de la sede *</label>
        <input name="nombre_sede" class="form-control"
               placeholder="ej. Sede Centro" required />
        <div class="invalid-feedback">Ingresa el nombre de la sede</div>
      </div>`,

    /* RegistrarPrograma → entero("codigo_programa") + texto("nombre_programa") */
    programa: `
      <div class="col-5">
        <label class="form-label">Código *</label>
        <input name="codigo_programa" type="number" class="form-control"
               placeholder="ej. 228122" required />
        <div class="invalid-feedback">Ingresa el código</div>
      </div>
      <div class="col-7">
        <label class="form-label">Nombre del programa *</label>
        <input name="nombre_programa" class="form-control"
               placeholder="ej. Análisis y Desarrollo de Software" required />
        <div class="invalid-feedback">Ingresa el nombre</div>
      </div>`,

    /* RegistrarJornada → texto("descripcion_Jornada") */
    jornada: `
      <div class="col-12">
        <label class="form-label">Descripción de la jornada *</label>
        <input name="descripcion_Jornada" class="form-control"
               placeholder="ej. Diurna, Nocturna, Madrugada" required />
        <div class="invalid-feedback">Ingresa la descripción</div>
      </div>`,

    /* RegistrarModalidad → texto("descripcion_Modalidad") */
    modalidad: `
      <div class="col-12">
        <label class="form-label">Descripción de la modalidad *</label>
        <input name="descripcion_Modalidad" class="form-control"
               placeholder="ej. Presencial, Virtual, A distancia" required />
        <div class="invalid-feedback">Ingresa la descripción</div>
      </div>`,

    /* RegistrarNivel → texto("descripcion_Nivel_Formacion") */
    nivel: `
      <div class="col-12">
        <label class="form-label">Descripción del nivel *</label>
        <input name="descripcion_Nivel_Formacion" class="form-control"
               placeholder="ej. Técnico, Tecnólogo, Especialización" required />
        <div class="invalid-feedback">Ingresa la descripción</div>
      </div>`,

    /* RegistrarEtapa → texto("descripcion_Etapa") */
    etapa: `
      <div class="col-12">
        <label class="form-label">Descripción de la etapa *</label>
        <input name="descripcion_Etapa" class="form-control"
               placeholder="ej. Lectiva, Productiva" required />
        <div class="invalid-feedback">Ingresa la descripción</div>
      </div>`,

    /* RegistrarEstado → texto("descripcion_Estado") */
    estado: `
      <div class="col-12">
        <label class="form-label">Descripción del estado *</label>
        <input name="descripcion_Estado" class="form-control"
               placeholder="ej. Activo, Inactivo, En proceso" required />
        <div class="invalid-feedback">Ingresa la descripción</div>
      </div>`,

    /* RegistrarTipoDocumento → texto("descripcion_TipoDoc") */
    tipoDocumento: `
      <div class="col-12">
        <label class="form-label">Descripción del tipo de documento *</label>
        <input name="descripcion_TipoDoc" class="form-control"
               placeholder="ej. Cédula de ciudadanía, Tarjeta de identidad" required />
        <div class="invalid-feedback">Ingresa la descripción</div>
      </div>`,

    /* RegistrarTipoVinculacion → texto("descripcion_vinculacion") */
    tipoVinculacion: `
      <div class="col-12">
        <label class="form-label">Descripción del tipo de vinculación *</label>
        <input name="descripcion_vinculacion" class="form-control"
               placeholder="ej. Planta, Contratista, Hora cátedra" required />
        <div class="invalid-feedback">Ingresa la descripción</div>
      </div>`,

    /* RegistrarTrimestre → entero("num_trimestre") + texto("descripcion")
                           + fecha("fecha_inicio") + fecha("fecha_fin") */
    trimestre: `
      <div class="col-4">
        <label class="form-label">Número *</label>
        <input name="num_trimestre" type="number" min="1" max="6"
               class="form-control" placeholder="ej. 1" required />
        <div class="invalid-feedback">Ingresa el número</div>
      </div>
      <div class="col-8">
        <label class="form-label">Descripción *</label>
        <input name="descripcion" class="form-control"
               placeholder="ej. Trimestre 1 - 2025" required />
        <div class="invalid-feedback">Ingresa la descripción</div>
      </div>
      <div class="col-6">
        <label class="form-label">Fecha inicio *</label>
        <input name="fecha_inicio" type="date" class="form-control" required />
        <div class="invalid-feedback">Selecciona la fecha de inicio</div>
      </div>
      <div class="col-6">
        <label class="form-label">Fecha fin *</label>
        <input name="fecha_fin" type="date" class="form-control" required />
        <div class="invalid-feedback">Selecciona la fecha de fin</div>
      </div>`,

    /* RegistrarCompetencia → entero("codigoCompetencias")
                             + texto("descripcionCompetencias")
                             + entero("Programas_idProgramas") */
    competencia: `
      <div class="col-5">
        <label class="form-label">Código *</label>
        <input name="codigoCompetencias" type="number" class="form-control"
               placeholder="ej. 210201501" required />
        <div class="invalid-feedback">Ingresa el código</div>
      </div>
      <div class="col-7">
        <label class="form-label">Descripción *</label>
        <input name="descripcionCompetencias" class="form-control"
               placeholder="ej. Construir soluciones de software" required />
        <div class="invalid-feedback">Ingresa la descripción</div>
      </div>
      <div class="col-12">
        <label class="form-label">ID Programa *</label>
        <input name="Programas_idProgramas"
               type="number" class="form-control"
               placeholder="ID del programa asociado" required />
        <div class="invalid-feedback">Ingresa el ID del programa</div>
      </div>`,

    /* RegistrarResultado → entero("codigoResultadoAp")
                           + texto("descripcionResul")
                           + entero("Competencias_id_competencias") */
    resultado: `
      <div class="col-5">
        <label class="form-label">Código *</label>
        <input name="codigoResultadoAp" type="number" class="form-control"
               placeholder="ej. 2102015010101" required />
        <div class="invalid-feedback">Ingresa el código</div>
      </div>
      <div class="col-7">
        <label class="form-label">Descripción *</label>
        <input name="descripcionResul" class="form-control"
               placeholder="ej. Identificar requerimientos del sistema" required />
        <div class="invalid-feedback">Ingresa la descripción</div>
      </div>
      <div class="col-12">
        <label class="form-label">ID Competencia *</label>
        <input name="Competencias_id_competencias" type="number"
               class="form-control" placeholder="ID de la competencia asociada" required />
        <div class="invalid-feedback">Ingresa el ID de la competencia</div>
      </div>`,

    /* RegistrarVinculacionLaboral → texto("descripcion") + texto("numeroContrato")
                                    + fecha("fechaInicio") + fecha("fechaFin")
                                    + entero("Usuarios_id_usuarios")
       NOTA: el Servlet usa "fechaInicio"/"fechaFin" pero el INSERT usa
             "fechaInIcio"/"fechafin" — los names aquí deben coincidir con
             lo que el Servlet lee en request.getParameter().                */
    vinculacionLaboral: `
      <div class="col-12">
        <label class="form-label">Descripción *</label>
        <input name="descripcion" class="form-control"
               placeholder="ej. Contrato prestación de servicios" required />
        <div class="invalid-feedback">Ingresa la descripción</div>
      </div>
      <div class="col-12">
        <label class="form-label">Número de contrato *</label>
        <input name="numeroContrato" class="form-control"
               placeholder="ej. 2025-0342" required />
        <div class="invalid-feedback">Ingresa el número de contrato</div>
      </div>
      <div class="col-6">
        <label class="form-label">Fecha inicio *</label>
        <input name="fechaInicio" type="date" class="form-control" required />
        <div class="invalid-feedback">Selecciona la fecha de inicio</div>
      </div>
      <div class="col-6">
        <label class="form-label">Fecha fin *</label>
        <input name="fechaFin" type="date" class="form-control" required />
        <div class="invalid-feedback">Selecciona la fecha de fin</div>
      </div>
      <div class="col-12">
        <label class="form-label">ID Usuario *</label>
        <input name="Usuarios_id_usuarios" type="number" class="form-control"
               placeholder="ID del instructor o usuario" required />
        <div class="invalid-feedback">Ingresa el ID del usuario</div>
      </div>`,

    /* RegistrarProgramacion → textoOpcional("Observaciones")
                              + fecha("fecha_inicial_Prog") + fecha("fecha_fin_Prog")
                              + texto("diasSemana")
                              + hora("hora_inicio") + hora("hora_fin")
                              + entero("Ficha_id_ficha")
                              + entero("Usuarios_id_usuarios")
                              + entero("Ambientes_id_ambientes")
                              + entero("Actividades_id_actividades")
                              + entero("Trimestre_id_trimestre")
                              + entero("Estado_id_estado")  */
    programacion: `
      <div class="col-6">
        <label class="form-label">Fecha inicio *</label>
        <input name="fecha_inicial_Prog" type="date" class="form-control" required />
        <div class="invalid-feedback">Selecciona la fecha de inicio</div>
      </div>
      <div class="col-6">
        <label class="form-label">Fecha fin *</label>
        <input name="fecha_fin_Prog" type="date" class="form-control" required />
        <div class="invalid-feedback">Selecciona la fecha de fin</div>
      </div>
      <div class="col-6">
        <label class="form-label">Hora inicio *</label>
        <input name="hora_inicio" type="time" class="form-control" required />
        <div class="invalid-feedback">Ingresa la hora de inicio</div>
      </div>
      <div class="col-6">
        <label class="form-label">Hora fin *</label>
        <input name="hora_fin" type="time" class="form-control" required />
        <div class="invalid-feedback">Ingresa la hora de fin</div>
      </div>
      <div class="col-12">
        <label class="form-label">Días de la semana *</label>
        <input name="diasSemana" class="form-control"
               placeholder="ej. LUNES,MIERCOLES,VIERNES" required />
        <div class="invalid-feedback">Ingresa los días</div>
      </div>
      <div class="col-6">
        <label class="form-label">ID Ficha *</label>
        <input name="Ficha_id_ficha" type="number" class="form-control"
               placeholder="ID de la ficha" required />
        <div class="invalid-feedback">Ingresa el ID de la ficha</div>
      </div>
      <div class="col-6">
        <label class="form-label">ID Instructor *</label>
        <input name="Usuarios_id_usuarios" type="number" class="form-control"
               placeholder="ID del instructor" required />
        <div class="invalid-feedback">Ingresa el ID del instructor</div>
      </div>
      <div class="col-6">
        <label class="form-label">ID Ambiente *</label>
        <input name="Ambientes_id_ambientes" type="number" class="form-control"
               placeholder="ID del ambiente" required />
        <div class="invalid-feedback">Ingresa el ID del ambiente</div>
      </div>
      <div class="col-6">
        <label class="form-label">ID Actividad *</label>
        <input name="Actividades_id_actividades" type="number" class="form-control"
               placeholder="ID de la actividad" required />
        <div class="invalid-feedback">Ingresa el ID de la actividad</div>
      </div>
      <div class="col-6">
        <label class="form-label">ID Trimestre *</label>
        <input name="Trimestre_id_trimestre" type="number" class="form-control"
               placeholder="ID del trimestre" required />
        <div class="invalid-feedback">Ingresa el ID del trimestre</div>
      </div>
      <div class="col-6">
        <label class="form-label">ID Estado *</label>
        <input name="Estado_id_estado" type="number" class="form-control"
               value="1" required />
        <div class="invalid-feedback">Ingresa el ID del estado</div>
      </div>
      <div class="col-12">
        <label class="form-label">Observaciones</label>
        <textarea name="Observaciones" class="form-control" rows="2"
                  placeholder="Observaciones opcionales…"></textarea>
      </div>`,
  };

  /* ── Nodos del modal de catálogo ── */
  const form   = document.getElementById("form-crear-catalogo");
  const modal  = document.getElementById("modal-crear-catalogo");
  const title  = document.getElementById("title-crear-catalogo");
  const fields = document.getElementById("catalogo-fields");

  /* ── Listener en cada botón con data-catalogo ── */
  document.querySelectorAll("[data-catalogo]").forEach(btn => {
    btn.addEventListener("click", function () {
      const tipo    = this.dataset.catalogo;
      const servlet = SERVLET_MAP[tipo];
      const html    = FIELDS_MAP[tipo];

      if (!servlet || !html) {
        console.warn("ClassControl: tipo de catálogo no definido →", tipo);
        return;
      }

      /* 1. Actualizar action y título */
      form.action      = servlet;
      form.classList.remove("was-validated"); // limpiar validación anterior
      title.textContent = this.querySelector("strong")?.textContent ?? tipo;

      /* 2. Inyectar los campos */
      fields.innerHTML = html;

      /* 3. Cerrar el modal padre (selector de tabla) */
      bootstrap.Modal.getInstance(
        document.getElementById("modal-crear-registro")
      )?.hide();

      /* 4. Abrir el modal de catálogo */
      bootstrap.Modal.getOrCreateInstance(modal).show();
    });
  });

  /* ── Listener en botones Ficha / Actividad / Ambiente
        (usan data-bs-target pero no tienen toggle automático
         porque están dentro de otro modal) ── */
  document.querySelectorAll(".cc-create-item[data-bs-target]").forEach(btn => {
    btn.addEventListener("click", function () {
      const targetId = this.dataset.bsTarget;

      /* Cerrar el modal padre primero */
      bootstrap.Modal.getInstance(
        document.getElementById("modal-crear-registro")
      )?.hide();

      /* Pequeño delay para que Bootstrap termine el hide antes del show */
      setTimeout(() => {
        bootstrap.Modal.getOrCreateInstance(
          document.querySelector(targetId)
        ).show();
      }, 200);
    });
  });

  /* ═══════════════════════════════════════════════════════════════
     DASHBOARD — contadores, próximas actividades y estado de programas
     Antes venían pre-calculados por un scriptlet SQL en el JSP;
     ahora se piden por fetch() a ConsultarDashboard.
     ═══════════════════════════════════════════════════════════════ */
  async function fetchJSON(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`${url} respondió ${resp.status}`);
    return resp.json();
  }

  function escapeHtml(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  const PROG_COLORS = ["cc-prog-green", "cc-prog-blue", "cc-prog-orange", "cc-prog-green", "cc-prog-blue"];
  const BADGE_COLORS = ["blue", "purple", "orange", "green"];

  function actividadRowHTML(act, index) {
    const bc = BADGE_COLORS[index % BADGE_COLORS.length];
    return `
      <tr>
        <td>
          <p class="cc-ficha-num mb-0">${escapeHtml(act.codigoFicha)}</p>
          <p class="cc-ficha-prog mb-0">${escapeHtml(act.programa)} – ${escapeHtml(act.jornada)}</p>
        </td>
        <td>${escapeHtml(act.actividad)}</td>
        <td><span class="cc-amb-badge ${bc}">${escapeHtml(act.ambiente)}</span></td>
        <td>${escapeHtml(act.horario)}</td>
        <td>${escapeHtml(act.instructor)}</td>
        <td class="text-end">
          <div class="dropdown">
            <button class="btn cc-icon-btn" data-bs-toggle="dropdown" aria-expanded="false">
              <span class="material-symbols-outlined">more_vert</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#">
                <span class="material-symbols-outlined me-2" style="font-size:.9rem">edit</span>Editar</a></li>
              <li><a class="dropdown-item text-danger" href="#">
                <span class="material-symbols-outlined me-2" style="font-size:.9rem">delete</span>Eliminar</a></li>
            </ul>
          </div>
        </td>
      </tr>`;
  }

  function renderEstadoProgramas(estadoProgramas) {
    const cont = document.getElementById("estado-programas-container");
    const tpl  = document.getElementById("tpl-estado-programa");
    if (!cont || !tpl) return;

    cont.querySelectorAll(":scope > *:not(template)").forEach(n => n.remove());

    if (!estadoProgramas.length) {
      const vacio = document.createElement("p");
      vacio.className = "text-muted";
      vacio.style.fontSize = ".8rem";
      vacio.textContent = "Sin datos de programas.";
      cont.appendChild(vacio);
      return;
    }

    estadoProgramas.forEach((prog, i) => {
      const nodo = tpl.content.cloneNode(true);
      nodo.querySelector('[data-field="nombre"]').textContent = prog.nombre;
      nodo.querySelector('[data-field="pct-label"]').textContent = `${prog.pct}%`;
      const barra = nodo.querySelector('[data-field="barra"]');
      barra.classList.add(PROG_COLORS[i % PROG_COLORS.length]);
      barra.style.width = `${prog.pct}%`;
      cont.appendChild(nodo);
    });
  }

  let actividadesDataTable = null;

  function renderActividades(actividades) {
    const tbody = document.getElementById("tbody-actividades");
    if (!tbody) return;
    tbody.innerHTML = actividades.map(actividadRowHTML).join("");

    if (actividadesDataTable) {
      actividadesDataTable.destroy();
    }
    actividadesDataTable = $("#actividades-table").DataTable({
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json",
        emptyTable: "No hay actividades programadas próximamente."
      },
      pageLength: 5,
      lengthMenu: [5, 10, 25],
      order: [[3, "asc"]]
    });
  }

  function setStat(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  }

  async function cargarDashboard() {
    try {
      const data = await fetchJSON("ConsultarDashboard");
      setStat("stat-fichas-activas",   data.totalFichasActivas);
      setStat("stat-ambientes-hoy",    data.totalAmbientesHoy);
      setStat("stat-actividades-curso", data.totalActividadesEnCurso);
      setStat("stat-instructores",     data.totalInstructores);
      renderEstadoProgramas(data.estadoProgramas || []);
      renderActividades(data.proximasActividades || []);
    } catch (err) {
      console.error("ClassControl: no se pudo cargar el dashboard", err);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     CATÁLOGOS — opciones de los <select> del formulario "Crear registro"
     y de los selects fuente que usa catalogo-modal.js.
     Antes venían de SELECTs SQL directos en el JSP; ahora cada uno
     se pide a su propio servlet Consultar*, igual que en el resto
     de las vistas del proyecto.
     ═══════════════════════════════════════════════════════════════ */
  function fillSelect(id, items, buildLabel) {
    const select = document.getElementById(id) ||
                   document.querySelector(`#catalogo-option-sources select[data-options="${id}"]`);
    if (!select) return;
    const placeholder = select.querySelector('option[value=""]');
    select.innerHTML = "";
    if (placeholder) select.appendChild(placeholder);
    items.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = buildLabel(item);
      select.appendChild(opt);
    });
  }

  async function cargarCatalogos() {
    try {
      const [
        programas, jornadas, modalidades, niveles, sedes, etapas,
        resultados, competencias, usuarios, ambientes,
        actividades, trimestres, estados, fichas, tiposEstado
      ] = await Promise.all([
        fetchJSON("ConsultarProgramas"),
        fetchJSON("ConsultarJornadas"),
        fetchJSON("ConsultarModalidades"),
        fetchJSON("ConsultarNiveles"),
        fetchJSON("ConsultarSedes"),
        fetchJSON("ConsultarEtapas"),
        fetchJSON("ConsultarResultados"),
        fetchJSON("ConsultarCompetencias"),
        fetchJSON("ConsultarUsuarios"),
        fetchJSON("ConsultarAmbientes"),
        fetchJSON("ConsultarActividades"),
        fetchJSON("ConsultarTrimestres"),
        fetchJSON("ConsultarEstados"),
        fetchJSON("ConsultarFichas"),
        fetchJSON("ConsultarTiposEstado"),
      ]);

      const nombrePrograma = new Map(programas.map(p => [p.id, p.nombre]));

      /* Selects de los formularios "Nueva ficha / actividad / ambiente" */
      fillSelect("ficha-programa",  programas,   p => p.nombre);
      fillSelect("ficha-jornada",   jornadas,    j => j.descripcion);
      fillSelect("ficha-modalidad", modalidades, m => m.descripcion);
      fillSelect("ficha-nivel",     niveles,     n => n.descripcion);
      fillSelect("ficha-sede",      sedes,       s => s.nombre);
      fillSelect("ficha-etapa",     etapas,      e => e.descripcion);
      fillSelect("act-resultado",   resultados,  r => `${r.codigo} - ${r.descripcion}`);
      fillSelect("amb-sede",        sedes,       s => s.nombre);

      /* Selects fuente que lee catalogo-modal.js (data-options="...") */
      fillSelect("programas",      programas,      p => `${p.codigo} - ${p.nombre}`);
      fillSelect("competencias",   competencias,   c => `${c.codigo} - ${c.descripcion}`);
      fillSelect("usuarios",       usuarios,       u => `${u.nombres} ${u.apellidos} - ${u.identificacion}`);
      fillSelect("fichas",         fichas,         f => `${f.codigo} - ${nombrePrograma.get(f.programaId) ?? ""}`);
      fillSelect("ambientes",      ambientes,      a => a.descripcion);
      fillSelect("actividades",    actividades,    a => `${a.codigoActividad} - ${a.nombre}`);
      fillSelect("trimestres",     trimestres,     t => `${t.numTrimestre} - ${t.descripcion}`);
      fillSelect("estados",        estados,        e => e.descripcion);
      fillSelect("tipoEstado",     tiposEstado,    t => t.descripcion);
    } catch (err) {
      console.error("ClassControl: no se pudieron cargar los catálogos", err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    cargarDashboard();
    cargarCatalogos();
  });

})();
