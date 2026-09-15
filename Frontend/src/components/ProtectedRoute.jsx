import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const hideNavbar = location.pathname === "/profile";

    return (
        <>
            {!hideNavbar && <Navbar />}

            {children}
        </>
    );
};

export default ProtectedRoute;