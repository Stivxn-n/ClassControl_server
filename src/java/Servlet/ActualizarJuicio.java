package Servlet;

import Controlador.JuiciosDAO;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Actualiza la valoracion, resultado, trimestre u observacion de un
 * juicio evaluativo existente.
 * Permitido para Instructor, Coordinador y Administrador.
 * Parametros: id (req), valoracion (req), resultadoId, trimestreId,
 * observacion (opcionales).
 */
@WebServlet("/ActualizarJuicio")
public class ActualizarJuicio extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        if (Autorizacion.idUsuarioDe(request) == null) {
            responder(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "No hay una sesión activa.");
            return;
        }
        if (!Autorizacion.esAdministrador(request)
                && !Autorizacion.esInstructor(request)
                && !Autorizacion.esCoordinador(request)) {
            responder(response, HttpServletResponse.SC_FORBIDDEN,
                    "No tienes permiso para editar juicios.");
            return;
        }

        Integer id = entero(request.getParameter("id"));
        String valoracion = texto(request.getParameter("valoracion"));

        if (id == null) {
            responder(response, HttpServletResponse.SC_BAD_REQUEST,
                    "Falta el identificador del juicio.");
            return;
        }
        if (valoracion == null) {
            responder(response, HttpServletResponse.SC_BAD_REQUEST,
                    "Falta la valoración del juicio.");
            return;
        }

        boolean ok = new JuiciosDAO().actualizar(
                id,
                entero(request.getParameter("resultadoId")),
                entero(request.getParameter("trimestreId")),
                valoracion,
                texto(request.getParameter("observacion")));

        if (ok) {
            try (PrintWriter out = response.getWriter()) {
                out.print("{\"ok\":true}");
            }
        } else {
            responder(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "No se pudo actualizar el juicio. Intenta de nuevo.");
        }
    }

    private Integer entero(String valor) {
        if (valor == null || valor.trim().isEmpty()) return null;
        try {
            return Integer.parseInt(valor.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String texto(String valor) {
        if (valor == null || valor.trim().isEmpty()) return null;
        return valor.trim();
    }

    private void responder(HttpServletResponse response, int status, String mensaje)
            throws IOException {
        response.setStatus(status);
        try (PrintWriter out = response.getWriter()) {
            out.print("{\"error\":\"" + escapar(mensaje) + "\"}");
        }
    }

    private String escapar(String valor) {
        return valor.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
