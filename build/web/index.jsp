<%-- 
    Document   : index.jsp
    Created on : 26/03/2026, 9:51:59 a. m.
    Author     : Aprendiz
--%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<HTML>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta http-equiv="refresh" content="0; url=Inicio_de_sesion.jsp">
        <title>JSP Page</title>
    </head>
    <BODY>
        <DIV class="Formularios">
            <h2>Iniciar Sesion</h2>
            
            <%
                // Captura el mensaje enviado desde el servlet
                String mensaje = (String) request.getAttribute("mensaje");
                if (mensaje != null) {
            %>
                <p class="mensaje"><%= mensaje == null ? "" : mensaje.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;") %></p>
            <% } %>
            <FORM action="Iniciar" method="post">
                <LABEL>Usuario</LABEL><INPUT type= "text" name= "usuario" >
                <LABEL>Password</LABEL><INPUT type= "password" name= "pass">
                <INPUT type= "submit" value= "Iniciar Sesion">
            </FORM>
        </DIV>
    </BODY>
</HTML>
