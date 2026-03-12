import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../Components/Loading.jsx";
import Unauthorized from "../Components/Unauthorized.jsx";

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    axios
      .get(`http://${window.location.host}/api/Authorization`, { withCredentials: true })
      .then((res) => {
        const role = String(res?.data?.role || "").trim().toLowerCase();
        setStatus(role === "admin" ? "ok" : "forbidden");
      })
      .catch(() => setStatus("forbidden"));
  }, []);

  if (status === "checking") {
    return <Loading message="Checking access..." />;
  }

  if (status === "forbidden") {
    return <Unauthorized />;
  }

  return children;
}
