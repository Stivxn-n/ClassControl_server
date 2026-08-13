package Servlet;

import Controlador.FichaDAO;
import Modelo.Ficha;
import jakarta.servlet.annotation.WebServlet;
import java.util.List;

@WebServlet("/ConsultarFichas")
public class ConsultarFichas extends ConsultarBaseServlet<Ficha> {

    @Override
    protected String getTipo() { return "fichas"; }

    @Override
    protected List<Ficha> obtenerLista() {
        return new FichaDAO().listarFichas();
    }

    @Override
    protected String camposJson(Ficha f) {
        return campoNum("id", f.getId_ficha()) + ","
             + campoNum("codigo", f.getCodigo_ficha()) + ","
             + campoFecha("fechaInicio", f.getFecha_inicio()) + ","
             + campoFecha("fechaFin", f.getFecha_fin()) + ","
             + campoNum("cantidadAprendices", f.getCantidad_aprendices()) + ","
             + campoNum("programaId", f.getProgramas_idProgramas()) + ","
             + campoNum("jornadaId", f.getJornada_id_jornada()) + ","
             + campoNum("modalidadId", f.getModalidad_id_modalidad()) + ","
             + campoNum("nivelFormacionId", f.getNivel_formacion_id_nivel_formacion()) + ","
             + campoNum("sedeId", f.getSede_id_sede()) + ","
             + campoNum("estadoId", f.getEstado_id_estado()) + ","
             + campoNum("etapaId", f.getEtapa_id_etapa());
    }
}
