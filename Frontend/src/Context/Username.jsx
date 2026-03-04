import { useEffect, useState } from "react";
import axios from "axios";

export default function Username() {
    const [user, setUser] = useState(null);
    useEffect(() => {
        axios
            .get(`http://${window.location.host}/api/auth-check`, { withCredentials: true })
            .then((res) => setUser(res.data.user))
            .catch(() => setUser(null));
    }, []);
    return (
        <>
            {user?.username || "There..."}
        </>
    )
}