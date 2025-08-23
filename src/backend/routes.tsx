import React from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../frontend/screens/login";
import Register from "../frontend/screens/register";
import Dashboard from "../frontend/screens/dashboard";
import FinishedTasks from "../frontend/screens/finishedTasks";

function isAuthenticated() {
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (!token) return false;
    try { return !!(raw && JSON.parse(raw)); } catch(e) { return false; }
}

const PublicOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (isAuthenticated()) return <Navigate to="/404" replace />;
    return <>{children}</>;
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isAuthenticated()) return <Navigate to="/" replace />;
    return <>{children}</>;
};

const NotFound = () => (
    <div style={{ padding: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28 }}>404 — Não encontrado</h1>
        <p style={{ color: '#555' }}>A página requisitada não está disponível.</p>
    </div>
);

function BackendRoutes() {
    return (
        <Routes>
            <Route path="/" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/finished" element={<PrivateRoute><FinishedTasks /></PrivateRoute>} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default BackendRoutes;