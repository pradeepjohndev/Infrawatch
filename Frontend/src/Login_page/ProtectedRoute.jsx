import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../Components/Loading";

export default function ProtectedRoute({ children }) {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        axios
            .get(`http://${window.location.host}/api/auth-check`, { withCredentials: true })
            .then(() => setAuth(true))
            .catch(() => setAuth(false));
    }, []);

    if (auth === null) return <Loading message="Checking session..." />;

    return auth ? children : <Navigate to="/" />;
}
