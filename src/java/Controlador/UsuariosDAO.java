package Controlador;

import Conexion.Conexion;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import Modelo.Usuarios;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class UsuariosDAO {

    // ══════════════════════════════════════════════════════════════
    //  LISTAR — todos los usuarios (reutiliza mapearUsuario)
    // ══════════════════════════════════════════════════════════════
    public List<Usuarios> listarUsuarios() {
        List<Usuarios> lista = new ArrayList<>();
        Conexion conexion = new Conexion();
        Connection con = conexion.getConexion();
        if (con == null) {
            System.out.println("❌ No se pudo obtener conexión para listar usuarios.");
            return lista;
        }

        String sql = "SELECT id_usuarios, nombres, apellidos, identificacion, fecha_Nacimiento, correo, " +
                    "telefono, direccion, username, nivel_Educativo, profesion, clave, fecha_Creacion, " +
                    "activo, fecha_ExpiracionContraseña, Roles_id_roles, Tipo_Documento_id_tipo_Documento, " +
                    "Tipo_vinculacion_id_tipo_vinculacion " +
                    "FROM usuarios ORDER BY nombres, apellidos";

        try (PreparedStatement ps = con.prepareStatement(sql);
             java.sql.ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapearUsuario(rs));
            }
        } catch (SQLException e) {
            System.out.println("❌ Error al listar usuarios: " + e.getMessage());
            e.printStackTrace();
        } finally {
            try { con.close(); } catch (SQLException e) { System.out.println("❌ Error al cerrar conexión: " + e.getMessage()); }
        }

        return lista;
    }


    public boolean insertarUsuarios(Usuarios usuario) {
        boolean insertado = false;
        Conexion conexion = new Conexion();
        Connection con = conexion.getConexion();


        String sql = "INSERT INTO usuarios (nombres, apellidos, identificacion, fecha_Nacimiento, " +
                    "correo, telefono, direccion, username, nivel_Educativo, profesion, clave, " +
                    "fecha_Creacion, activo, fecha_ExpiracionContraseña, Roles_id_roles, " +
                    "Tipo_Documento_id_tipo_Documento, Tipo_vinculacion_id_tipo_vinculacion) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1,  usuario.getNombres());
            ps.setString(2,  usuario.getApellidos());
            ps.setString(3,  usuario.getIdentificacion());
            ps.setObject(4,  usuario.getFecha_Nacimiento());
            ps.setString(5,  usuario.getCorreo());
            ps.setString(6,  usuario.getTelefono());
            ps.setString(7,  usuario.getDireccion());
            ps.setString(8,  usuario.getUsername());
            ps.setString(9,  usuario.getNivel_Educativo());
            ps.setString(10, usuario.getProfesion());
            ps.setString(11, usuario.getClave());
            ps.setObject(12, LocalDate.now());
            ps.setBoolean(13, usuario.isActivo());
            ps.setObject(14, usuario.getFecha_ExpiracionContraseña());
            ps.setInt(15, usuario.getRoles_id_roles());
            ps.setInt(16, usuario.getTipo_Documento_id_tipo_Documento());
            ps.setInt(17, usuario.getTipo_vinculacion_id_tipo_vinculacion());

            ps.executeUpdate();
            insertado = true;
            System.out.println("✅ Usuario insertado correctamente.");
        } catch (SQLException e) {
            System.out.println("❌ Error al insertar el usuario: " + e.getMessage());
            e.printStackTrace();
        } finally {
            try { if (con != null) con.close(); }
            catch (SQLException e) { System.out.println("❌ Error al cerrar conexión: " + e.getMessage()); }
        }

        return insertado;
    }


    public Usuarios consultaUsuarios(String username) {
        Usuarios usuarioEncontrado = null;
        Conexion conexion = new Conexion();
        Connection con = conexion.getConexion();
        if (con == null) return null;

        String sql = "SELECT id_usuarios, nombres, apellidos, identificacion, fecha_Nacimiento, correo, " +
                    "telefono, direccion, username, nivel_Educativo, profesion, clave, fecha_Creacion, " +
                    "activo, fecha_ExpiracionContraseña, Roles_id_roles, Tipo_Documento_id_tipo_Documento, " +
                    "Tipo_vinculacion_id_tipo_vinculacion " +
                    "FROM usuarios WHERE username = ?";

        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, username);
            java.sql.ResultSet rs = ps.executeQuery();
            if (rs.next()) usuarioEncontrado = mapearUsuario(rs);
        } catch (SQLException e) {
            System.out.println("❌ Error al consultar el usuario: " + e.getMessage());
        } finally {
            try { con.close(); } catch (SQLException e) { System.out.println("❌ Error al cerrar conexión: " + e.getMessage()); }
        }

        return usuarioEncontrado;
    }


    public Usuarios consultaUsuarios(int id_usuarios) {
        Usuarios usuarioEncontrado = null;
        Conexion conexion = new Conexion();
        Connection con = conexion.getConexion();
        if (con == null) return null;

        String sql = "SELECT id_usuarios, nombres, apellidos, identificacion, fecha_Nacimiento, correo, " +
                    "telefono, direccion, username, nivel_Educativo, profesion, clave, fecha_Creacion, " +
                    "activo, fecha_ExpiracionContraseña, Roles_id_roles, Tipo_Documento_id_tipo_Documento, " +
                    "Tipo_vinculacion_id_tipo_vinculacion " +
                    "FROM usuarios WHERE id_usuarios = ?";

        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id_usuarios);
            java.sql.ResultSet rs = ps.executeQuery();
            if (rs.next()) usuarioEncontrado = mapearUsuario(rs);
        } catch (SQLException e) {
            System.out.println("❌ Error al consultar el usuario: " + e.getMessage());
        } finally {
            try { con.close(); } catch (SQLException e) { System.out.println("❌ Error al cerrar conexión: " + e.getMessage()); }
        }

        return usuarioEncontrado;
    }


    public boolean eliminarUsuarios(int id_usuarios) {
        String sql = "DELETE FROM usuarios WHERE id_usuarios = ?";
        Conexion conexion = new Conexion();

        try (Connection con = conexion.getConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id_usuarios);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("❌ Error al eliminar usuario: " + e.getMessage());
            return false;
        }
    }


    public boolean actualizarUsuario(Usuarios usuario) {

        String sql = "UPDATE usuarios SET nombres = ?, apellidos = ?, identificacion = ?, " +
                    "fecha_Nacimiento = ?, correo = ?, telefono = ?, direccion = ?, " +
                    "username = ?, nivel_Educativo = ?, profesion = ?, clave = ?, " +
                    "activo = ?, fecha_ExpiracionContraseña = ?, Roles_id_roles = ?, " +
                    "Tipo_Documento_id_tipo_Documento = ?, Tipo_vinculacion_id_tipo_vinculacion = ? " +
                    "WHERE id_usuarios = ?";

        Conexion conexion = new Conexion();

        try (Connection con = conexion.getConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1,  usuario.getNombres());
            ps.setString(2,  usuario.getApellidos());
            ps.setString(3,  usuario.getIdentificacion());
            ps.setObject(4,  usuario.getFecha_Nacimiento());
            ps.setString(5,  usuario.getCorreo());
            ps.setString(6,  usuario.getTelefono());
            ps.setString(7,  usuario.getDireccion());
            ps.setString(8,  usuario.getUsername());
            ps.setString(9,  usuario.getNivel_Educativo());
            ps.setString(10, usuario.getProfesion());
            ps.setString(11, usuario.getClave());
            ps.setBoolean(12, usuario.isActivo());
            ps.setObject(13, usuario.getFecha_ExpiracionContraseña());
            ps.setInt(14, usuario.getRoles_id_roles());
            ps.setInt(15, usuario.getTipo_Documento_id_tipo_Documento());
            ps.setInt(16, usuario.getTipo_vinculacion_id_tipo_vinculacion());
            ps.setInt(17, usuario.getId_usuarios());

            int filas = ps.executeUpdate();
            if (filas > 0) {
                System.out.println("✅ Usuario actualizado correctamente.");
                return true;
            }
            return false;

        } catch (SQLException e) {
            System.out.println("❌ Error al actualizar usuario: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private Usuarios mapearUsuario(java.sql.ResultSet rs) throws SQLException {
        Usuarios u = new Usuarios();
        u.setId_usuarios(rs.getInt("id_usuarios"));
        u.setNombres(rs.getString("nombres"));
        u.setApellidos(rs.getString("apellidos"));
        u.setIdentificacion(rs.getString("identificacion"));
        u.setFecha_Nacimiento(rs.getObject("fecha_Nacimiento", LocalDate.class));
        u.setCorreo(rs.getString("correo"));
        u.setTelefono(rs.getString("telefono"));
        u.setDireccion(rs.getString("direccion"));
        u.setUsername(rs.getString("username"));
        u.setNivel_Educativo(rs.getString("nivel_Educativo"));
        u.setProfesion(rs.getString("profesion"));
        u.setClave(rs.getString("clave"));
        u.setActivo(rs.getBoolean("activo"));
        u.setFecha_ExpiracionContraseña(rs.getObject("fecha_ExpiracionContraseña", LocalDate.class));
        u.setRoles_id_roles(rs.getInt("Roles_id_roles"));
        u.setTipo_Documento_id_tipo_Documento(rs.getInt("Tipo_Documento_id_tipo_Documento"));
        u.setTipo_vinculacion_id_tipo_vinculacion(rs.getInt("Tipo_vinculacion_id_tipo_vinculacion"));
        return u;
    }
}