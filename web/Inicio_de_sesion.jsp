<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%!
  /** Escapa texto para que los datos dinamicos no se interpreten como HTML. */
  public static String escaparHtml(Object valor) {
    if (valor == null) return "";
    String texto = String.valueOf(valor);
    return texto.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
  }
%>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>ClassControl – SENA | Iniciar sesión</title>

  <link rel="icon" type="image/png" href="img/logo.png" />
  <!-- ── Google Fonts (sistema de diseño ClassControl) ── -->
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>

  <!-- ── Bootstrap 5.3 ── -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"/>

  <!-- ── Estilos propios ── -->
  <link rel="stylesheet" href="CSS/ClassControl_base.css"/>
  <link rel="stylesheet" href="CSS/ClassControl_theme.css"/>
  <link rel="stylesheet" href="CSS/Inicio_de_sesionCSS.css"/>
</head>

<body class="cc-login-body">

  <%-- ══════════════════════════════════════════════════════════
       Leer atributos del Servlet (forward) y parámetros de URL

       El Servlet usa dos vías para comunicar errores:
         · request.setAttribute("mensaje", "...")       → forward
         · request.setAttribute("tipoMensaje", "...")   → "danger" | "warning"

       También se lee ?registro=exitoso desde RegistrarUsuario
  ══════════════════════════════════════════════════════════ --%>
  <%
    String mensaje      = (String) request.getAttribute("mensaje");
    String tipoMensaje  = (String) request.getAttribute("tipoMensaje");
    String registro     = request.getParameter("registro");

    // Fallback de tipo si el Servlet no lo envió
    if (tipoMensaje == null || tipoMensaje.isBlank()) tipoMensaje = "danger";
  %>

  <!-- Decoración de fondo -->
  <div class="cc-blob cc-blob--top"    aria-hidden="true"></div>
  <div class="cc-blob cc-blob--bottom" aria-hidden="true"></div>

  <main class="cc-login-wrapper">
    <div class="cc-login-card shadow-lg">

      <!-- ── Cabecera / Logo ── -->
      <div class="cc-login-header text-center">
        <div class="cc-logo-icon mb-3">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0ZM34.2 34.2H13.8V13.8H34.2V34.2Z" fill="currentColor"/>
            <path d="M24 16.8V31.2M16.8 24H31.2" stroke="white" stroke-linecap="round" stroke-width="4"/>
          </svg>
        </div>
        <h1 class="cc-app-title">ClassControl</h1>
        <p class="cc-app-subtitle">Gestión de Programación de Instructores</p>
      </div>

      <!-- ── Cuerpo del formulario ── -->
      <div class="cc-login-body-inner">
        <h2 class="cc-section-title">Iniciar sesión</h2>
        <p class="cc-section-desc">Ingresa tus credenciales para acceder</p>

        <%-- ── Alerta de registro exitoso (viene de RegistrarUsuario) ── --%>
        <% if ("exitoso".equals(registro)) { %>
          <div class="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-3" role="alert">
            <span class="material-symbols-outlined flex-shrink-0">check_circle</span>
            <span>Usuario registrado correctamente. Ya puedes iniciar sesión.</span>
          </div>
        <% } %>

        <%-- ── Alerta de error del Servlet (forward desde Inicio_Sesion) ── --%>
        <% if (mensaje != null && !mensaje.isBlank()) { %>
          <div id="login-error"
               class="alert alert-<%= escaparHtml(tipoMensaje) %> d-flex align-items-center gap-2 py-2 px-3 mb-3"
               role="alert">
            <span class="material-symbols-outlined flex-shrink-0"><%= "warning".equals(tipoMensaje) ? "warning" : "error" %></span>
            <span id="login-error-msg"><%= escaparHtml(mensaje) %></span>
          </div>
        <% } else { %>
          <%-- Contenedor oculto para que el JS lo maneje en validación cliente --%>
          <div id="login-error"
               class="alert alert-danger d-none d-flex align-items-center gap-2 py-2 px-3 mb-3"
               role="alert">
            <span class="material-symbols-outlined flex-shrink-0">error</span>
            <span id="login-error-msg">Credenciales incorrectas. Inténtalo de nuevo.</span>
          </div>
        <% } %>

        <%--
          action="Iniciar"  → URL del @WebServlet("/Iniciar")
          method="post"     → invoca doPost()
          novalidate        → el JS maneja los estilos de validación Bootstrap
        --%>
        <form id="form-login" action="Iniciar" method="post" novalidate autocomplete="on">

          <!-- Usuario -->
          <div class="mb-3">
            <label class="form-label" for="login-usuario">Correo electrónico o Usuario</label>
            <div class="input-group">
              <span class="input-group-text"><span class="material-symbols-outlined">person</span></span>
              <%-- name="username" → request.getParameter("username") en el Servlet --%>
              <input
                id="login-usuario"
                name="username"
                type="text"
                autocomplete="username"
                placeholder="ejemplo@sena.edu.co"
                class="form-control"
                required/>
              <div class="invalid-feedback">Ingresa tu correo o usuario.</div>
            </div>
          </div>

          <!-- Contraseña -->
          <div class="mb-3">
            <label class="form-label" for="login-password">Contraseña</label>
            <div class="input-group">
              <span class="input-group-text"><span class="material-symbols-outlined">lock</span></span>
              <%-- name="clave" → request.getParameter("clave") en el Servlet --%>
              <input
                id="login-password"
                name="clave"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••"
                class="form-control"
                required/>
              <button id="btn-toggle-pass" class="input-group-text cc-toggle-pass"
                      type="button" aria-label="Mostrar / ocultar contraseña">
                <span id="icon-pass" class="material-symbols-outlined">visibility</span>
              </button>
              <div class="invalid-feedback">Ingresa tu contraseña.</div>
            </div>
          </div>

          <!-- Recordarme + olvidé -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="recordarme" name="recordarme"/>
              <label class="form-check-label" for="recordarme">Recordarme</label>
            </div>
            <a class="cc-link-forgot" href="Recuperar_Contraseña.jsp">¿Olvidaste tu contraseña?</a>
          </div>

          <!-- Botón submit -->
          <button type="submit" id="btn-login" class="btn cc-btn-primary w-100 mt-2">
            <span id="btn-login-text">Iniciar sesión</span>
            <span id="btn-login-icon" class="material-symbols-outlined ms-1">login</span>
            <span id="btn-spinner" class="spinner-border spinner-border-sm d-none ms-1"
                  role="status" aria-hidden="true"></span>
          </button>

        </form>
      </div>

      <!-- ── Registro ── -->
      <div class="cc-login-footer">
        <p class="mb-0">
          ¿No tienes una cuenta?
          <a class="cc-link-register" href="Registrar_Usuario.jsp">Registrarse como nuevo usuario</a>
        </p>
      </div>

    </div><!-- /cc-login-card -->

    <!-- Footer SENA -->
    <footer class="cc-sena-footer text-center mt-4">
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCayioC48f1BBVpKq8aGuTKHgo1rON1ZYM1gZ7ul6pAk4RcBwW1ybE4XNg_ok_KaxIKjmqLL6rjfsuBQAlkvG-juVFBI-jz1n1r9PBtNkGiIC_gnzdCdBeUkeN22gHie8JosTq1Z8lgyGuQ6QJeHo1NyzEPT_QgqqmydAr7p6_ohQSN2jIMEUerrnAaWepjs4bx1RFAYcFRYxyHV9W_RjOj4mzWkLEnKbCGFdklXV0skRREavAgyiANE4L_FrhuxVei8_EkzFMyhLY"
        alt="Logo SENA"
        class="cc-sena-logo"
      />
      <p class="cc-sena-copy">© 2024 Servicio Nacional de Aprendizaje SENA.<br/>Todos los derechos reservados.</p>
    </footer>
  </main>

  <!-- ── Bootstrap JS ── -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <!-- ── Lógica de login ── -->
  <script src="JS/ClassControl_ui.js"></script>
  <script src="JS/Inicio_de_sesionJS.js"></script>
</body>
</html>
