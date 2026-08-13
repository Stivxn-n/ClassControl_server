package Servlet;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Clase base para los servlets de actualización (UPDATE) de cada entidad.
 * Replica el patrón de RegistroBaseServlet: valida sesión, delega el
 * mapeo de campos a la subclase y centraliza el manejo de errores y
 * las redirecciones.
 */
public abstract class ActualizarBaseServlet extends HttpServlet {

    protected abstract String getTipo();

    protected String getUrlRedireccion() { return "Pagina_Principal.jsp"; }

    /** Lee los parámetros del request, arma el objeto y llama al DAO. */
    protected abstract boolean actualizar(HttpServletRequest request) throws Exception;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        if (!Autorizacion.puedeGestionar(request, response, getTipo())) {
            return;
        }

        try {
            boolean ok = actualizar(request);
            String tipo = getTipo();
            response.sendRedirect(getUrlRedireccion() + "?" + (ok ? "actualizado=" + tipo : "error=" + tipo));
        } catch (NumberFormatException e) {
            System.out.println(getClass().getSimpleName() + " - error en parametros numericos: " + e.getMessage());
            response.sendRedirect(getUrlRedireccion() + "?error=formato");
        } catch (Controlador.ConflictoHorarioException e) {
            System.out.println(getClass().getSimpleName() + " - conflicto de horario: " + e.getMessage());
            response.sendRedirect(getUrlRedireccion() + "?error=conflicto");
        } catch (Exception e) {
            System.out.println(getClass().getSimpleName() + " - error general: " + e.getMessage());
            e.printStackTrace();
            response.sendRedirect(getUrlRedireccion() + "?error=1");
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    }

    protected String texto(HttpServletRequest request, String nombre) {
        String valor = request.getParameter(nombre);
        if (valor == null || valor.trim().isEmpty()) {
            throw new NumberFormatException("Campo requerido vacio: " + nombre);
        }
        return valor.trim();
    }

    protected String textoOpcional(HttpServletRequest request, String nombre) {
        String valor = request.getParameter(nombre);
        return valor == null ? "" : valor.trim();
    }

    protected int entero(HttpServletRequest request, String nombre) {
        return Integer.parseInt(texto(request, nombre));
    }

    protected int enteroOpcional(HttpServletRequest request, String nombre, int valorDefecto) {
        String valor = request.getParameter(nombre);
        return (valor == null || valor.trim().isEmpty()) ? valorDefecto : Integer.parseInt(valor.trim());
    }

    protected LocalDate fecha(HttpServletRequest request, String nombre) {
        return LocalDate.parse(texto(request, nombre));
    }

    protected LocalDate fechaOpcional(HttpServletRequest request, String nombre) {
        String valor = request.getParameter(nombre);
        return (valor == null || valor.trim().isEmpty()) ? null : LocalDate.parse(valor.trim());
    }

    protected LocalTime hora(HttpServletRequest request, String nombre) {
        return LocalTime.parse(texto(request, nombre));
    }
}
