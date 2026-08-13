package Servlet;

import Modelo.Usuarios;
import Modelo.Roles;
import Controlador.UsuariosDAO;
import Controlador.RolesDAO;
import java.io.IOException;
import org.mindrot.jbcrypt.BCrypt;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/Iniciar")
public class Inicio_Sesion extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String username = request.getParameter("username");
        String clave    = request.getParameter("clave");

        UsuariosDAO midao = new UsuariosDAO();
        Usuarios usuariosBD = midao.consultaUsuarios(username);

        if (usuariosBD == null) {
            request.setAttribute("mensaje", "❌ El usuario no existe.");
            request.getRequestDispatcher("Inicio_de_sesion.jsp").forward(request, response);

        } else if (!coincideClave(clave, usuariosBD.getClave())) {
            request.setAttribute("mensaje", "❌ Contraseña incorrecta.");
            request.getRequestDispatcher("Inicio_de_sesion.jsp").forward(request, response);

        } else if (!usuariosBD.isActivo()) {
            request.setAttribute("mensaje", "❌ Usuario inactivo. Contacte al administrador.");
            request.getRequestDispatcher("Inicio_de_sesion.jsp").forward(request, response);

        } else {
            // Guardar datos en sesión
            Roles rolBD = new RolesDAO().consultaRoles(usuariosBD.getRoles_id_roles());
            if (rolBD == null || rolBD.getDescripcion_Roles() == null) {
                request.setAttribute("mensaje", "No fue posible validar los permisos del usuario.");
                request.getRequestDispatcher("Inicio_de_sesion.jsp").forward(request, response);
                return;
            }

            HttpSession session = request.getSession(true);
            request.changeSessionId();
            session.setAttribute("id_usuario",  usuariosBD.getId_usuarios());
            session.setAttribute("nombres",      usuariosBD.getNombres());
            session.setAttribute("apellidos",    usuariosBD.getApellidos());
            session.setAttribute("username",     usuariosBD.getUsername());
            session.setAttribute("rol",          usuariosBD.getRoles_id_roles());
            session.setAttribute("rol_nombre",   rolBD.getDescripcion_Roles());

            // Redirigir a página principal
            response.sendRedirect("Pagina_Principal.jsp");
        }
    }

    /**
     * A malformed or legacy BCrypt hash must reject authentication without
     * leaking an HTTP 500 error to the user.
     */
    private boolean coincideClave(String claveIngresada, String hashAlmacenado) {
        if (claveIngresada == null || hashAlmacenado == null) {
            return false;
        }

        try {
            return BCrypt.checkpw(claveIngresada, hashAlmacenado);
        } catch (IllegalArgumentException e) {
            System.out.println("Inicio_Sesion - hash BCrypt invalido.");
            return false;
        }
    }
}
