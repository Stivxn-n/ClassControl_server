/* ============================================================
   ClassControl_theme.js
   Modo oscuro/claro compartido entre TODAS las páginas.
   Antes cada página manejaba su propio toggle sin guardar nada,
   por eso el tema se "olvidaba" al cambiar de pantalla.

   Ahora: se guarda en localStorage bajo la llave "cc-theme" y se
   aplica automáticamente ni bien carga cualquier página, antes
   de que el usuario vea nada (evita el parpadeo del contenido
   sin estilos).

   Incluir en TODAS las páginas, justo antes de </body>:
     <script src="JS/ClassControl_theme.js"></script>
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "cc-theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    var icons = document.querySelectorAll("#dark-toggle .material-symbols-outlined");
    icons.forEach(function (icon) {
      icon.textContent = theme === "dark" ? "light_mode" : "dark_mode";
    });
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-bs-theme") || "light";
    var next = current === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) { /* localStorage no disponible, igual aplicamos el cambio visual */ }
    applyTheme(next);
  }

  // Aplica el tema guardado apenas el DOM está listo para leer los botones
  document.addEventListener("DOMContentLoaded", function () {
    var stored = getStoredTheme() || "light";
    applyTheme(stored);

    var toggleBtn = document.getElementById("dark-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", toggleTheme);
    }

    // Toggle del sidebar en móvil (hamburguesa)
    var sidebarToggle = document.getElementById("sidebar-toggle");
    var sidebar = document.getElementById("cc-sidebar");
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener("click", function () {
        sidebar.classList.toggle("open");
      });
    }
  });

  // Expuesto por si alguna página necesita forzar el tema manualmente
  window.ClassControlTheme = { apply: applyTheme, toggle: toggleTheme };
})();
