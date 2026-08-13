package Servlet;

import Controlador.Programacion_InstructoresDAO;
import Modelo.ProgramacionInstructoresDTO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * Este es el servlet que le falta a Programacion_instructoresJS.js:
 * expone en JSON exactamente lo que el JS espera encontrar en
 * "data-programaciones" (instructor, ficha, ambiente,
 * trimestre, horaInicio, horaFin, diasSemana, estado...).
 */
@WebServlet("/ConsultarProgramaciones")
public class ConsultarProgramaciones extends ConsultarBaseServlet<ProgramacionInstructoresDTO> {

    @Override
    protected String getTipo() { return "programaciones"; }

    @Override
    protected List<ProgramacionInstructoresDTO> obtenerLista() {
        return new Programacion_InstructoresDAO().listarProgramaciones();
    }

    @Override
    protected List<ProgramacionInstructoresDTO> obtenerLista(HttpServletRequest request) {
        return new Programacion_InstructoresDAO().listarProgramaciones(
                enteroOpcional(request, "instructorId"),
                enteroOpcional(request, "fichaId"),
                enteroOpcional(request, "trimestreId"));
    }

    private Integer enteroOpcional(HttpServletRequest request, String nombre) {
        String valor = request.getParameter(nombre);
        if (valor == null || valor.isBlank()) {
            return null;
        }
        int numero = Integer.parseInt(valor);
        if (numero <= 0) {
            throw new NumberFormatException("El filtro " + nombre + " debe ser positivo");
        }
        return numero;
    }

    @Override
    protected String camposJson(ProgramacionInstructoresDTO p) {
        return campoNum("id", p.getId()) + ","
             + campoStr("observaciones", p.getObservaciones()) + ","
             + campoFecha("fechaInicio", p.getFechaInicialProg()) + ","
             + campoFecha("fechaFin", p.getFechaFinProg()) + ","
             + campoStr("diasSemana", p.getDiasSemana()) + ","
             + campoStr("horaInicio", p.getHoraInicio() == null ? null : p.getHoraInicio().toString()) + ","
             + campoStr("horaFin", p.getHoraFin() == null ? null : p.getHoraFin().toString()) + ","
             + campoNum("fichaId", p.getFichaId()) + ","
             + campoStr("ficha", p.getFichaNumero()) + ","
             + campoStr("fichaPrograma", p.getFichaPrograma()) + ","
             + campoNum("instructorId", p.getInstructorId()) + ","
             + campoStr("instructor", p.getInstructorNombre()) + ","
             + campoNum("ambienteId", p.getAmbienteId()) + ","
             + campoStr("ambiente", p.getAmbienteNombre()) + ","
             + campoNum("trimestreId", p.getTrimestreId()) + ","
             + campoStr("trimestre", p.getTrimestreNombre()) + ","
             + campoNum("estadoId", p.getEstadoId()) + ","
             + campoStr("estado", p.getEstadoNombre()) + ","
             + campoNum("actividadId", p.getActividadId()) + ","
             + campoStr("actividad", p.getActividadNombre()) + ","
             + campoStr("competencia", p.getCompetenciaNombre());
    }
}
