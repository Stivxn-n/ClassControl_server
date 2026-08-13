package Servlet;

import Controlador.UsuariosDAO;
import Modelo.Usuarios;
import java.io.IOException;
import java.time.LocalDate;
import org.mindrot.jbcrypt.BCrypt;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/RegistrarUsuario")
public class RegistrarUsuario extends HttpServlet {

    private static final int ROL_INSTRUCTOR = 1;
    private static final int ROL_APRENDIZ = 2;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        try {
            Usuarios usuario = new Usuarios();
            usuario.setNombres(texto(request, "nombres"));
            usuario.setApellidos(texto(request, "apellidos"));
            usuario.setIdentificacion(texto(request, "identificacion"));
            usuario.setCorreo(texto(request, "correo"));
            usuario.setTelefono(texto(request, "telefono"));
            usuario.setDireccion(textoOpcional(request, "direccion"));
            usuario.setUsername(texto(request, "username"));

            // Hasheamos la clave ANTES de guardarla. Nunca se persiste en texto plano.
            String claveEnTextoPlano = texto(request, "clave");
            String claveHasheada = BCrypt.hashpw(claveEnTextoPlano, BCrypt.gensalt(12));
            usuario.setClave(claveHasheada);
            usuario.setNivel_Educativo(textoOpcional(request, "nivel_Educativo"));
            usuario.setProfesion(textoOpcional(request, "profesion"));
            usuario.setActivo(true);
            // No confiamos en el valor enviado por el formulario: el registro
            // público nunca puede asignar el rol de administrador.
            usuario.setRoles_id_roles(rolPermitidoParaRegistro(request));
            usuario.setTipo_Documento_id_tipo_Documento(entero(request, "tipoDoc"));
            usuario.setTipo_vinculacion_id_tipo_vinculacion(enteroOpcional(request, "tipoVinculacion", 1));

            String fechaNacStr = request.getParameter("fecha_Nacimiento");
            if (fechaNacStr != null && !fechaNacStr.trim().isEmpty()) {
                usuario.setFecha_Nacimiento(LocalDate.parse(fechaNacStr.trim()));
            }

            boolean ok = new UsuariosDAO().insertarUsuarios(usuario);
            response.sendRedirect(ok ? "Inicio_de_sesion.jsp?registro=exitoso" : "Registrar_Usuario.jsp?error=1");
        } catch (NumberFormatException e) {
            System.out.println("RegistrarUsuario - error en parametros numericos: " + e.getMessage());
            response.sendRedirect("Registrar_Usuario.jsp?error=formato");
        } catch (Exception e) {
            System.out.println("RegistrarUsuario - error general: " + e.getMessage());
            e.printStackTrace();
            response.sendRedirect("Registrar_Usuario.jsp?error=1");
        }
    }

    private String texto(HttpServletRequest request, String nombre) {
        String valor = request.getParameter(nombre);
        if (valor == null || valor.trim().isEmpty()) {
            throw new NumberFormatException("Campo requerido vacio: " + nombre);
        }
        return valor.trim();
    }

    private String textoOpcional(HttpServletRequest request, String nombre) {
        String valor = request.getParameter(nombre);
        return valor == null ? "" : valor.trim();
    }

    private int entero(HttpServletRequest request, String nombre) {
        return Integer.parseInt(texto(request, nombre));
    }

    private int rolPermitidoParaRegistro(HttpServletRequest request) {
        int rol = entero(request, "rol");
        if (rol != ROL_INSTRUCTOR && rol != ROL_APRENDIZ) {
            throw new NumberFormatException("Rol no permitido para registro publico");
        }
        return rol;
    }

    private int enteroOpcional(HttpServletRequest request, String nombre, int valorDefecto) {
        String valor = request.getParameter(nombre);
        return (valor == null || valor.trim().isEmpty()) ? valorDefecto : Integer.parseInt(valor.trim());
    }
}
