package Servlet;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.text.Normalizer;
import java.util.Set;

/** Punto único de autorización del servidor. */
public final class Autorizacion {

    private static final String ADMINISTRADOR = "administrador";
    private static final String COORDINADOR = "coordinador";

    /* Entidades operativas que también puede gestionar un Coordinador. */
    private static final Set<String> GESTION_COORDINADOR = Set.of(
            "ficha", "programacion", "competencia", "resultado", "actividad", "ambiente"
    );

    private Autorizacion() { }

    public static boolean puedeGestionar(HttpServletRequest request,
            HttpServletResponse response, String tipo) throws IOException {
        String rol = rolDe(request);
        if (ADMINISTRADOR.equals(rol)
                || (COORDINADOR.equals(rol) && GESTION_COORDINADOR.contains(tipo))) {
            return true;
        }
        denegar(response);
        return false;
    }

    public static boolean puedeConsultar(HttpServletRequest request,
            HttpServletResponse response, String tipo) throws IOException {
        String rol = rolDe(request);
        if (rol == null) {
            response.sendRedirect("Inicio_de_sesion.jsp");
            return false;
        }

        // Datos personales y configuración de acceso: solo administración.
        if ("usuarios".equals(tipo) || "roles".equals(tipo)
                || "vinculacionesLaborales".equals(tipo)) {
            if (!ADMINISTRADOR.equals(rol) && !COORDINADOR.equals(rol)) {
                denegar(response);
                return false;
            }
        }
        return true;
    }

    public static boolean puedeVerProgramacion(HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        return puedeConsultar(request, response, "programacion");
    }

    private static String rolDe(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("id_usuario") == null) {
            return null;
        }
        Object rol = session.getAttribute("rol_nombre");
        return rol instanceof String ? normalizar((String) rol) : null;
    }

    private static void denegar(HttpServletResponse response) throws IOException {
        response.sendError(HttpServletResponse.SC_FORBIDDEN,
                "No tienes permiso para realizar esta accion.");
    }

    private static String normalizar(String valor) {
        return Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .toLowerCase(java.util.Locale.ROOT);
    }
}
