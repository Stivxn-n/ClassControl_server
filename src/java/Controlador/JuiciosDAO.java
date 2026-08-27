package Controlador;

import Conexion.Conexion;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * DAO de juicios evaluativos del aprendiz.
 * Devuelve mapas listos para serializar a JSON en los servlets.
 */
public class JuiciosDAO {

    private static final String SELECT_BASE =
            "SELECT j.id_juicio, j.valoracion, j.observacion, j.fecha_registro, "
            + "j.Usuarios_id_usuarios AS aprendizId, "
            + "CONCAT(u.nombres, ' ', u.apellidos) AS aprendizNombre, "
            + "j.Resultado_aprendizaje_id_resultado_aprendizaje AS resultadoId, "
            + "r.descripcion_Resul AS resultadoNombre, "
            + "r.codigo_ResultadoAp AS resultadoCodigo, "
            + "j.Trimestre_id_trimestre AS trimestreId, "
            + "t.num_trimestre AS trimestreNumero "
            + "FROM juicios_evaluativos j "
            + "INNER JOIN usuarios u ON u.id_usuarios = j.Usuarios_id_usuarios "
            + "LEFT JOIN resultado_aprendizaje r ON r.id_resultado_aprendizaje = j.Resultado_aprendizaje_id_resultado_aprendizaje "
            + "LEFT JOIN trimestre t ON t.id_trimestre = j.Trimestre_id_trimestre ";

    /** Lista juicios de un aprendiz; si idAprendiz es null lista todos. */
    public List<Map<String, Object>> listar(Integer idAprendiz) {
        List<Map<String, Object>> lista = new ArrayList<>();
        String sql = SELECT_BASE
                + (idAprendiz == null ? "" : "WHERE j.Usuarios_id_usuarios = ? ")
                + "ORDER BY j.fecha_registro DESC, j.id_juicio DESC";

        try (Connection con = new Conexion().getConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            if (idAprendiz != null) {
                ps.setInt(1, idAprendiz);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        } catch (SQLException e) {
            System.out.println("JuiciosDAO - error al listar: " + e.getMessage());
        }
        return lista;
    }

    public boolean insertar(int idAprendiz, Integer resultadoId,
                            Integer trimestreId, String valoracion,
                            String observacion) {
        String sql = "INSERT INTO juicios_evaluativos (Usuarios_id_usuarios, "
                + "Resultado_aprendizaje_id_resultado_aprendizaje, Trimestre_id_trimestre, "
                + "valoracion, observacion) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = new Conexion().getConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idAprendiz);
            setNulo(ps, 2, resultadoId);
            setNulo(ps, 3, trimestreId);
            ps.setString(4, valoracion);
            ps.setString(5, (observacion == null || observacion.isBlank()) ? null : observacion);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("JuiciosDAO - error al insertar: " + e.getMessage());
            return false;
        }
    }

    /** Actualiza valoracion, resultado, trimestre y observacion. */
    public boolean actualizar(int idJuicio, Integer resultadoId,
                              Integer trimestreId, String valoracion,
                              String observacion) {
        String sql = "UPDATE juicios_evaluativos SET "
                + "Resultado_aprendizaje_id_resultado_aprendizaje = ?, "
                + "Trimestre_id_trimestre = ?, valoracion = ?, observacion = ? "
                + "WHERE id_juicio = ?";
        try (Connection con = new Conexion().getConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            setNulo(ps, 1, resultadoId);
            setNulo(ps, 2, trimestreId);
            ps.setString(3, valoracion);
            ps.setString(4, (observacion == null || observacion.isBlank()) ? null : observacion);
            ps.setInt(5, idJuicio);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("JuiciosDAO - error al actualizar: " + e.getMessage());
            return false;
        }
    }

    public boolean eliminar(int idJuicio) {
        String sql = "DELETE FROM juicios_evaluativos WHERE id_juicio = ?";
        try (Connection con = new Conexion().getConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idJuicio);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("JuiciosDAO - error al eliminar: " + e.getMessage());
            return false;
        }
    }

    private void setNulo(PreparedStatement ps, int indice, Integer valor)
            throws SQLException {
        if (valor == null) {
            ps.setNull(indice, java.sql.Types.INTEGER);
        } else {
            ps.setInt(indice, valor);
        }
    }

    private Map<String, Object> mapear(ResultSet rs) throws SQLException {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", rs.getInt("id_juicio"));
        m.put("valoracion", rs.getString("valoracion"));
        m.put("observacion", rs.getString("observacion"));
        Timestamp fecha = rs.getTimestamp("fecha_registro");
        m.put("fechaRegistro", fecha == null ? null : fecha.toString());
        int aprendizId = rs.getInt("aprendizId");
        m.put("aprendizId", rs.wasNull() ? null : aprendizId);
        m.put("aprendiz", rs.getString("aprendizNombre"));
        int resultadoId = rs.getInt("resultadoId");
        m.put("resultadoId", rs.wasNull() ? null : resultadoId);
        String resultado = rs.getString("resultadoNombre");
        int codigo = rs.getInt("resultadoCodigo");
        if (!rs.wasNull()) resultado = codigo + " — " + resultado;
        m.put("resultado", resultado);
        int trimestreId = rs.getInt("trimestreId");
        m.put("trimestreId", rs.wasNull() ? null : trimestreId);
        int trimestreNum = rs.getInt("trimestreNumero");
        m.put("trimestre", rs.wasNull() ? null : "Trimestre " + trimestreNum);
        return m;
    }
}
