package Servlet;

import Controlador.CompetenciasDAO;
import Modelo.Competencias;
import jakarta.servlet.annotation.WebServlet;
import java.util.List;

@WebServlet("/ConsultarCompetencias")
public class ConsultarCompetencias extends ConsultarBaseServlet<Competencias> {

    @Override
    protected String getTipo() { return "competencias"; }

    @Override
    protected List<Competencias> obtenerLista() {
        return new CompetenciasDAO().listarCompetencias();
    }

    @Override
    protected String camposJson(Competencias c) {
        return campoNum("id", c.getId_competencias()) + ","
             + campoNum("codigo", c.getCodigo_Competencias()) + ","
             + campoStr("descripcion", c.getDescripcion_Competencias()) + ","
             + campoNum("programacionInstructoresId",
                        c.getProgramas_idProgramas());
    }
}
