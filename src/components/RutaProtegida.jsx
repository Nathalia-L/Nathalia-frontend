import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function RutaProtegida({ children }) {

    const token = localStorage.getItem("token");


    if (!token) {
        return <Navigate to="/" replace />
    }

    try {

        const decodificado = jwtDecode(token);

        // El panel administrativo lo usan admin y gerente
        // (el backend ya valida estos roles al hacer login-admin).
        if(decodificado.rol !== "admin" && decodificado.rol !== "gerente") {
            return <Navigate to="/" replace />
        }


    }
    catch (error) {
        console.error('Error en RutaProtegida:', error)
        return <Navigate to="/control-interno" replace />
    }

    return children;
}


export default RutaProtegida;