package Servlet;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

public abstract class RegistroBaseServlet extends HttpServlet {

    protected abstract String getTipo();

    protected String getUrlRedireccion() { return "Pagina_Principal.jsp"; }

    protected abstract boolean guardar(HttpServletRequest request) throws Exception;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        if (!Autorizacion.puedeGestionar(request, response, getTipo())) {
            return;
        }

        try {
            boolean ok = guardar(request);
            String tipo = getTipo();
            response.sendRedirect(getUrlRedireccion() + "?" + (ok ? "ok=" + tipo : "error=" + tipo));
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
