import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Protege las vistas de cliente (catálogo, pedidos, cuenta, etc).
// Los administradores/gerentes también pueden entrar para ver la misma
// página del usuario y editarla en el modo edición (ver Catálogo).
function RutaProtegidaCliente({ children }) {

    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />
    }

    try {
        jwtDecode(token);
    } catch (error) {
        console.error('Error en RutaProtegidaCliente:', error)
        return <Navigate to="/login" replace />
    }

    return children;
}

export default RutaProtegidaCliente;
