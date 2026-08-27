package Servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.mindrot.jbcrypt.BCrypt;

/**
 * Recuperacion de contraseña SIN servidor de correo.
 *
 * El usuario ingresa su correo (o username) y su numero de documento.
 * Si ambos coinciden con un mismo usuario activo, se genera una
 * contraseña temporal que se muestra UNA vez en pantalla y queda
 * guardada en la base de datos con hash BCrypt.
 */
@WebServlet("/RecuperarPassword")
public class RecuperarPassword extends HttpServlet {

    private static final String CARACTERES =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        String correo = texto(request, "correo");
        String identificacion = texto(request, "identificacion");

        if (correo == null || identificacion == null) {
            responder(response, HttpServletResponse.SC_BAD_REQUEST,
                    "Ingresa tu correo/usuario y tu número de documento.");
            return;
        }

        Integer idUsuario = null;
        Boolean activo = null;

        try (Connection con = new Conexion.Conexion().getConexion()) {
            if (con == null) {
                responder(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                        "El servicio no está disponible en este momento.");
                return;
            }

            PreparedStatement ps = con.prepareStatement(
                    "SELECT id_usuarios, activo FROM usuarios "
                    + "WHERE (username = ? OR correo = ?) "
                    + "AND identificacion = ? LIMIT 1");
            ps.setString(1, correo);
            ps.setString(2, correo);
            ps.setString(3, identificacion);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                idUsuario = rs.getInt("id_usuarios");
                activo = rs.getBoolean("activo");
            }
            rs.close();
            ps.close();

            if (idUsuario == null) {
                responder(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Los datos no coinciden con ningún usuario registrado.");
                return;
            }
            if (!activo) {
                responder(response, HttpServletResponse.SC_FORBIDDEN,
                        "La cuenta está inactiva. Contacta al administrador.");
                return;
            }

            String claveTemporal = generarClave(8);
            PreparedStatement up = con.prepareStatement(
                    "UPDATE usuarios SET clave = ? WHERE id_usuarios = ?");
            up.setString(1, BCrypt.hashpw(claveTemporal, BCrypt.gensalt(10)));
            up.setInt(2, idUsuario);
            up.executeUpdate();
            up.close();

            responderClave(response, claveTemporal);

        } catch (Exception e) {
            System.out.println("RecuperarPassword - error: " + e.getMessage());
            e.printStackTrace();
            responder(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "No se pudo procesar la recuperación. Intenta de nuevo.");
        }
    }

    /** Genera una contraseña temporal legible sin caracteres ambiguos. */
    private String generarClave(int longitud) {
        SecureRandom azar = new SecureRandom();
        StringBuilder sb = new StringBuilder(longitud);
        for (int i = 0; i < longitud; i++) {
            sb.append(CARACTERES.charAt(azar.nextInt(CARACTERES.length())));
        }
        return sb.toString();
    }

    private void responderClave(HttpServletResponse response, String clave)
            throws IOException {
        try (PrintWriter out = response.getWriter()) {
            out.print("{\"ok\":true,\"claveTemporal\":\""
                    + escapar(clave) + "\"}");
        }
    }

    private void responder(HttpServletResponse response, int status,
            String mensaje) throws IOException {
        response.setStatus(status);
        try (PrintWriter out = response.getWriter()) {
            out.print("{\"error\":\"" + escapar(mensaje) + "\"}");
        }
    }

    private String escapar(String valor) {
        return valor.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String texto(HttpServletRequest request, String nombre) {
        String valor = request.getParameter(nombre);
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }
        return valor.trim();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    }
}
