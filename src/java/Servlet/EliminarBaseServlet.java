package Servlet;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Clase base para los servlets de eliminación (DELETE) de cada entidad.
 * Toma el parámetro "id" del request, valida sesión y delega la
 * eliminación en la subclase (que a su vez llama al DAO correspondiente).
 */
public abstract class EliminarBaseServlet extends HttpServlet {

    protected abstract String getTipo();

    /** Llama al método eliminarX(id) del DAO correspondiente. */
    protected abstract boolean eliminar(int id) throws Exception;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        if (!Autorizacion.puedeGestionar(request, response, getTipo())) {
            return;
        }

        try {
            int id = Integer.parseInt(texto(request, "id"));
            boolean ok = eliminar(id);
            String tipo = getTipo();
            response.sendRedirect("Pagina_Principal.jsp?" + (ok ? "eliminado=" + tipo : "error=" + tipo));
        } catch (NumberFormatException e) {
            System.out.println(getClass().getSimpleName() + " - error en parametros numericos: " + e.getMessage());
            response.sendRedirect("Pagina_Principal.jsp?error=formato");
        } catch (Exception e) {
            System.out.println(getClass().getSimpleName() + " - error general: " + e.getMessage());
            e.printStackTrace();
            response.sendRedirect("Pagina_Principal.jsp?error=1");
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    }

    private String texto(HttpServletRequest request, String nombre) {
        String valor = request.getParameter(nombre);
        if (valor == null || valor.trim().isEmpty()) {
            throw new NumberFormatException("Campo requerido vacio: " + nombre);
        }
        return valor.trim();
    }
}
