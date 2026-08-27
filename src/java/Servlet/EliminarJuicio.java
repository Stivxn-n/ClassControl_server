package Servlet;

import Controlador.JuiciosDAO;
import jakarta.servlet.annotation.WebServlet;

/** Elimina un juicio evaluativo (solo Administrador). */
@WebServlet("/EliminarJuicio")
public class EliminarJuicio extends EliminarBaseServlet {

    @Override
    protected String getTipo() { return "juicio"; }

    @Override
    protected boolean eliminar(int id) {
        return new JuiciosDAO().eliminar(id);
    }
}
