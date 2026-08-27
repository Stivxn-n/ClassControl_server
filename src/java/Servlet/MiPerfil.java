package Servlet;

import Controlador.RolesDAO;
import Controlador.UsuariosDAO;
import Modelo.Roles;
import Modelo.Usuarios;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/api/MiPerfil")
public class MiPerfil extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        response.setContentType("application/json;charset=UTF-8");

        Integer idUsuario = idDeSesion(request);
        if (idUsuario == null) {
            responderNoAuth(response);
            return;
        }

        Usuarios u = new UsuariosDAO().consultaUsuarios(idUsuario);
        if (u == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            try (PrintWriter out = response.getWriter()) {
                out.print("{\"error\":\"No se encontró el usuario de la sesión.\"}");
            }
            return;
        }

        Roles rol = new RolesDAO().consultaRoles(u.getRoles_id_roles());
        String rolNombre = (rol != null && rol.getDescripcion_Roles() != null)
                ? rol.getDescripcion_Roles() : "";

        try (PrintWriter out = response.getWriter()) {
            out.print("{");
            out.print("\"idUsuario\":" + u.getId_usuarios() + ",");
            out.print("\"nombres\":" + jsonStr(u.getNombres()) + ",");
            out.print("\"apellidos\":" + jsonStr(u.getApellidos()) + ",");
            out.print("\"username\":" + jsonStr(u.getUsername()) + ",");
            out.print("\"correo\":" + jsonStr(u.getCorreo()) + ",");
            out.print("\"identificacion\":" + jsonStr(u.getIdentificacion()) + ",");
            out.print("\"telefono\":" + jsonStr(u.getTelefono()) + ",");
            out.print("\"profesion\":" + jsonStr(u.getProfesion()) + ",");
            out.print("\"rolId\":" + u.getRoles_id_roles() + ",");
            out.print("\"rolNombre\":" + jsonStr(rolNombre));
            out.print("}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");

        Integer idUsuario = idDeSesion(request);
        if (idUsuario == null) {
            responderNoAuth(response);
            return;
        }

        UsuariosDAO dao = new UsuariosDAO();
        Usuarios u = dao.consultaUsuarios(idUsuario);
        if (u == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            try (PrintWriter out = response.getWriter()) {
                out.print("{\"error\":\"No se encontró el usuario de la sesión.\"}");
            }
            return;
        }

        String correo = request.getParameter("correo");
        String profesion = request.getParameter("profesion");

        // El usuario solo puede editar sus datos de contacto; identidad y
        // rol se administran desde Gestión de Usuarios.
        if (correo != null) {
            correo = correo.trim();
            if (!correo.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                try (PrintWriter out = response.getWriter()) {
                    out.print("{\"error\":\"El correo no es válido.\"}");
                }
                return;
            }
            u.setCorreo(correo);
        }
        if (profesion != null) {
            u.setProfesion(profesion.trim());
        }

        boolean actualizado = dao.actualizarUsuario(u);
        if (!actualizado) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            try (PrintWriter out = response.getWriter()) {
                out.print("{\"error\":\"No fue posible actualizar el perfil.\"}");
            }
            return;
        }

        try (PrintWriter out = response.getWriter()) {
            out.print("{");
            out.print("\"ok\":true,");
            out.print("\"mensaje\":\"Perfil actualizado correctamente.\",");
            out.print("\"correo\":" + jsonStr(u.getCorreo()) + ",");
            out.print("\"profesion\":" + jsonStr(u.getProfesion()));
            out.print("}");
        }
    }

    private Integer idDeSesion(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("id_usuario") == null) return null;
        return (Integer) session.getAttribute("id_usuario");
    }

    private void responderNoAuth(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        try (PrintWriter out = response.getWriter()) {
            out.print("{\"error\":\"No hay una sesión activa.\"}");
        }
    }

    private String jsonStr(String valor) {
        if (valor == null) return "null";
        return "\"" + valor.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "")
                .replace("\n", "\\n") + "\"";
    }
}
