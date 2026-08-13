<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%-- ══════════════════════ PROTECCIÓN DE SESIÓN ══════════════════════ --%>
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
%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt"%>
<fmt:setLocale value="es_CO"/>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ClassControl – Mi Perfil</title>

  <link rel="icon" type="image/png" href="img/logo.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.datatables.net/1.13.8/css/dataTables.bootstrap5.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">

  <link rel="stylesheet" href="CSS/ClassControl_base.css"/>
  <link rel="stylesheet" href="CSS/ClassControl_theme.css" />
  <link rel="stylesheet" href="CSS/ClassControl_sidebar.css" />
  <link rel="stylesheet" href="CSS/Mi_PerfilCSS.css" />
</head>
<body data-user-id="<%= sesIdUser %>">
  <div class="cc-wrapper">
    <!-- Sidebar desktop -->
    <%   String ccActivePage = "perfil"; %>
<%@ include file="_Sidebar.jspf" %>

    <!-- Main -->
    <div class="cc-main">
      <header class="border-bottom bg-white sticky-top z-2">
        <div class="container-fluid py-2 d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2 flex-grow-1">
            <button class="btn btn-outline-secondary d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileSidebar" aria-controls="mobileSidebar">
              <span class="material-symbols-outlined align-middle">menu</span>
            </button>
            <div class="input-group" style="max-width: 420px;">
              <span class="input-group-text bg-white"><span class="material-symbols-outlined">search</span></span>
              <input id="searchInput" type="search" class="form-control" placeholder="Buscar sesión, ubicación o dispositivo...">
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary" id="btnResetProfile" type="button">Restablecer</button>
            <button class="btn btn-sm btn-brand" id="btnQuickSave" type="button">Guardar Perfil</button>
          </div>
        </div>
      </header>

      <main class="container-fluid py-4">
        <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <h2 class="h4 fw-bold text-brand-blue mb-1">Mi Perfil</h2>
            <p class="text-muted mb-0">Actualiza tus datos personales y la seguridad de tu cuenta institucional.</p>
          </div>
        </div>

        <section class="row g-3 mb-4">
          <div class="col-12 col-xl-4">
            <div class="card border-0 shadow-sm h-100 profile-summary-card">
              <div class="card-body">
                <div class="d-flex flex-column align-items-center text-center">
                  <div class="profile-avatar-wrap mb-3">
                    <img id="avatarPreview" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9RbNayg0uD8d6VrgYgLzyUvBjkd-_MJABU6ZwO_jsdoNcOQwz5eCvECVCTdXf42AMADF3cYVLr_d1HbQciAo3voDlwETXof2nAg_kFusorx-GrT8WnDhVg1C4ieO8WKAXslFS38MmKubNEgVu-zob64Q9DI9187gBtqT8q6aG66yzFaL_z1kJvgSTgoMLVf5YyL0MgTLbRNxNEv6NzjULrL5rZUoke3duGXAYyCL-c6rnVBdYqiwgH_htpIshyHpSC823tun09ys" alt="Avatar" class="profile-avatar">
                    <button class="btn btn-brand btn-sm profile-avatar-btn" id="btnUploadAvatar" type="button">
                    <span class="material-symbols-outlined">photo_camera</span>
                    </button>
                    <input id="avatarInput" type="file" class="d-none" accept="image/png,image/jpeg,image/webp" />
                  </div>

                  <h3 id="displayName" class="h5 fw-bold text-brand-blue mb-1">${usuario.nombre}</h3>
                  <p id="displayRole" class="text-muted mb-2">${usuario.rol}</p>
                  <p id="displayEmail" class="small text-muted mb-3">${usuario.correo}</p>

                  <div class="d-flex gap-2 flex-wrap justify-content-center mb-3">
                    <span class="badge rounded-pill text-bg-success">Staff Activo</span>
                    <span class="badge rounded-pill text-bg-primary">Nivel 4</span>
                  </div>

                  <div class="w-100 border-top pt-3 mt-2">
                    <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted small">Sede</span>
                    <span id="displaySede" class="fw-semibold small">${usuario.sede}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted small">Departamento</span>
                    <span id="displayDepartment" class="fw-semibold small">${usuario.departamento}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                    <span class="text-muted small">ID</span>
                    <span id="displayCedula" class="fw-semibold small">${usuario.identificacion}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-xl-8">
            <div class="card border-0 shadow-sm mb-3">
              <div class="card-header bg-white border-0 pb-0">
                <h4 class="h6 fw-bold text-brand-blue mb-0">Datos Personales</h4>
              </div>
              <div class="card-body">
                <form id="profileForm" class="row g-3 needs-validation" novalidate>
                  <div class="col-md-6">
                    <label for="fieldName" class="form-label">Nombre completo *</label>
                    <input type="text" class="form-control" id="fieldName" minlength="3" value="${usuario.nombre}" required>
                    <div class="invalid-feedback">Ingresa un nombre válido (mínimo 3 caracteres).</div>
                  </div>
                  <div class="col-md-6">
                    <label for="fieldRole" class="form-label">Cargo / Rol *</label>
                    <input type="text" class="form-control" id="fieldRole" value="${usuario.rol}" required>
                    <div class="invalid-feedback">Ingresa el cargo o rol.</div>
                  </div>
                  <div class="col-md-6">
                    <label for="fieldEmail" class="form-label">Correo institucional *</label>
                    <input type="email" class="form-control" id="fieldEmail" value="${usuario.correo}" required>
                    <div class="invalid-feedback">Ingresa un correo válido.</div>
                  </div>
                  <div class="col-md-6">
                    <label for="fieldCedula" class="form-label">Número de identificación *</label>
                    <input type="text" class="form-control" id="fieldCedula" value="${usuario.identificacion}" required>
                    <div class="invalid-feedback">Ingresa un número de identificación.</div>
                  </div>
                  <div class="col-md-6">
                    <label for="fieldSede" class="form-label">Sede *</label>
                    <input type="text" class="form-control" id="fieldSede" value="${usuario.sede}" required>
                    <div class="invalid-feedback">Ingresa una sede.</div>
                  </div>
                  <div class="col-md-6">
                    <label for="fieldDepartment" class="form-label">Departamento *</label>
                    <input type="text" class="form-control" id="fieldDepartment" value="${usuario.departamento}" required>
                    <div class="invalid-feedback">Ingresa un departamento.</div>
                  </div>
                  <div class="col-12 d-flex justify-content-end gap-2 pt-2">
                    <button class="btn btn-outline-secondary" type="button" id="btnCancelProfile">Cancelar</button>
                    <button class="btn btn-brand" type="submit" id="btnSaveProfile">Guardar Datos</button>
                  </div>
                </form>
              </div>
            </div>

            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0 pb-0">
                <h4 class="h6 fw-bold text-brand-blue mb-0">Seguridad y Acceso</h4>
              </div>
              <div class="card-body">
                <form id="passwordForm" class="row g-3 needs-validation" novalidate>
                  <div class="col-md-4">
                    <label for="currentPassword" class="form-label">Contraseña actual *</label>
                    <div class="input-group">
                    <input type="password" class="form-control" id="currentPassword" required>
                    <button class="btn btn-outline-secondary toggle-password" type="button" data-target="currentPassword">
                    <span class="material-symbols-outlined">visibility_off</span>
                    </button>
                    </div>
                    <div class="invalid-feedback d-block" id="currentPasswordError"></div>
                  </div>
                  <div class="col-md-4">
                    <label for="newPassword" class="form-label">Nueva contraseña *</label>
                    <div class="input-group">
                    <input type="password" class="form-control" id="newPassword" required>
                    <button class="btn btn-outline-secondary toggle-password" type="button" data-target="newPassword">
                    <span class="material-symbols-outlined">visibility_off</span>
                    </button>
                    </div>
                    <div class="password-strength mt-2">
                    <div id="passwordStrengthBar"></div>
                    </div>
                    <small class="text-muted" id="passwordStrengthText">Seguridad: —</small>
                    <div class="invalid-feedback d-block" id="newPasswordError"></div>
                  </div>
                  <div class="col-md-4">
                    <label for="confirmPassword" class="form-label">Confirmar contraseña *</label>
                    <div class="input-group">
                    <input type="password" class="form-control" id="confirmPassword" required>
                    <button class="btn btn-outline-secondary toggle-password" type="button" data-target="confirmPassword">
                    <span class="material-symbols-outlined">visibility_off</span>
                    </button>
                    </div>
                    <div class="invalid-feedback d-block" id="confirmPasswordError"></div>
                  </div>

                  <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2">
                    <small class="text-muted">La contraseña debe contener mínimo 8 caracteres, mayúscula, número y símbolo.</small>
                    <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary" type="button" id="btnCancelPassword">Cancelar</button>
                    <button class="btn btn-brand" type="submit" id="btnSavePassword">Actualizar Contraseña</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white border-0 pb-0 d-flex justify-content-between align-items-center">
            <h4 class="h6 fw-bold text-brand-blue mb-0">Preferencias de Notificación</h4>
          </div>
          <div class="card-body">
            <div class="row g-3" id="notificationPrefs"></div>
          </div>
        </section>

        <section class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white border-0 pb-0">
            <h4 class="h6 fw-bold text-brand-blue mb-0">Historial de Accesos</h4>
          </div>
          <div class="card-body table-responsive">
            <table id="accessTable" class="table table-hover align-middle w-100">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ubicación</th>
                  <th>Dispositivo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <%-- Ejemplo de iteración con JSTL --%>
                <%--
                <c:forEach var="acceso" items="${historialAccesos}">
                  <tr>
                    <td><fmt:formatDate value="${acceso.fecha}" pattern="yyyy-MM-dd HH:mm"/></td>
                    <td>${acceso.ubicacion}</td>
                    <td>${acceso.dispositivo}</td>
                    <td>
                      <c:choose>
                        <c:when test="${acceso.estado == 'Exitoso'}">
                          <span class="badge bg-success">Exitoso</span>
                        </c:when>
                        <c:otherwise>
                          <span class="badge bg-danger">Fallido</span>
                        </c:otherwise>
                      </c:choose>
                    </td>
                  </tr>
                </c:forEach>
                --%>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </div>

  <!-- Sidebar móvil -->
  <div class="offcanvas offcanvas-start cc-offcanvas-sidebar" tabindex="-1" id="mobileSidebar" aria-labelledby="mobileSidebarLabel">
    <div class="offcanvas-header border-bottom">
      <div class="cc-sidebar-logo py-0 px-0">
        <div class="cc-logo-box">
          <img src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png" alt="Logo SENA" />
        </div>
        <div>
          <h5 class="offcanvas-title cc-brand-name mb-0" id="mobileSidebarLabel">ClassControl</h5>
          <p class="cc-brand-sub mb-0">Gestión Educativa</p>
        </div>
      </div>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <nav class="cc-nav px-0">
        <a class="cc-nav-link" href="${pageContext.request.contextPath}/Pagina Principal.jsp"><span class="material-symbols-outlined">dashboard</span><span>Inicio</span></a>
        <a class="cc-nav-link" href="${pageContext.request.contextPath}/Fichas.jsp"><span class="material-symbols-outlined">description</span><span>Fichas</span></a>
        <a class="cc-nav-link" href="${pageContext.request.contextPath}/Instructores.jsp"><span class="material-symbols-outlined">groups</span><span>Instructores</span></a>
        <a class="cc-nav-link" href="${pageContext.request.contextPath}/Programas.jsp"><span class="material-symbols-outlined">school</span><span>Programas</span></a>
        <a class="cc-nav-link" href="${pageContext.request.contextPath}/Ambientes.jsp"><span class="material-symbols-outlined">meeting_room</span><span>Ambientes</span></a>
        <a class="cc-nav-link" href="${pageContext.request.contextPath}/Competencias.jsp"><span class="material-symbols-outlined">target</span><span>Competencias</span></a>
        <a class="cc-nav-link" href="${pageContext.request.contextPath}/Actividades.jsp"><span class="material-symbols-outlined">assignment_turned_in</span><span>Actividades</span></a>
        <a class="cc-nav-link" href="${pageContext.request.contextPath}/Programacion instructores.jsp"><span class="material-symbols-outlined">calendar_month</span><span>Programación</span></a>
        <div class="cc-nav-separator"></div>
        <a class="cc-nav-link" href="${pageContext.request.contextPath}/Reportes_Y_Consultas.jsp"><span class="material-symbols-outlined">analytics</span><span>Reportes</span></a>
        <a class="cc-nav-link" href="${pageContext.request.contextPath}/Gestion_Usuarios.jsp"><span class="material-symbols-outlined">manage_accounts</span><span>Usuarios</span></a>
        <a class="cc-nav-link active" href="${pageContext.request.contextPath}/Mi_Perfil.jsp"><span class="material-symbols-outlined">person</span><span>Mi Perfil</span></a>
      </nav>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div id="appToast" class="toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body" id="appToastBody"></div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  </div>

  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.datatables.net/1.13.8/js/jquery.dataTables.min.js"></script>
  <script src="https://cdn.datatables.net/1.13.8/js/dataTables.bootstrap5.min.js"></script>
  <script src="JS/ClassControl_ui.js"></script>
  <script src="JS/Mi_PerfilJS.js"></script>
  <script src="JS/ClassControl_theme.js"></script>
</body>
</html>
