package Servlet;

import Controlador.JuiciosDAO;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Consulta de juicios evaluativos.
 *  - Aprendiz: solo los suyos (ignora cualquier idAprendiz pedido).
 *  - Instructor/Coordinador/Administrador: todos, o filtrados por
 *    ?idAprendiz=N.
 */
@WebServlet("/ConsultarJuicios")
public class ConsultarJuicios extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        doPost(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        response.setContentType("application/json;charset=UTF-8");

        Integer idSesion = Autorizacion.idUsuarioDe(request);
        if (idSesion == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            try (PrintWriter out = response.getWriter()) {
                out.print("{\"error\":\"No hay una sesión activa.\"}");
            }
            return;
        }

        Integer filtro;
        if (Autorizacion.esAprendiz(request)) {
            filtro = idSesion; // un aprendiz solo ve lo suyo, siempre.
        } else {
            filtro = entero(request.getParameter("idAprendiz"));
        }

        List<Map<String, Object>> juicios = new JuiciosDAO().listar(filtro);

        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < juicios.size(); i++) {
            Map<String, Object> j = juicios.get(i);
            if (i > 0) json.append(",");
            json.append("{")
                .append("\"id\":").append(j.get("id")).append(",")
                .append("\"valoracion\":").append(jsonStr(j.get("valoracion"))).append(",")
                .append("\"observacion\":").append(jsonStr(j.get("observacion"))).append(",")
                .append("\"fechaRegistro\":").append(jsonStr(j.get("fechaRegistro"))).append(",")
                .append("\"aprendizId\":").append(numOpcional(j.get("aprendizId"))).append(",")
                .append("\"aprendiz\":").append(jsonStr(j.get("aprendiz"))).append(",")
                .append("\"resultadoId\":").append(numOpcional(j.get("resultadoId"))).append(",")
                .append("\"resultado\":").append(jsonStr(j.get("resultado"))).append(",")
                .append("\"trimestreId\":").append(numOpcional(j.get("trimestreId"))).append(",")
                .append("\"trimestre\":").append(jsonStr(j.get("trimestre")))
                .append("}");
        }
        json.append("]");

        try (PrintWriter out = response.getWriter()) {
            out.print(json.toString());
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

    private String numOpcional(Object valor) {
        return valor == null ? "null" : String.valueOf(valor);
    }

    private String jsonStr(Object valor) {
        if (valor == null) return "null";
        String s = String.valueOf(valor)
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "")
                .replace("\n", "\\n");
        return "\"" + s + "\"";
    }
}
