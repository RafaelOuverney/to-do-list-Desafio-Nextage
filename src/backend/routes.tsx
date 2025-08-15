import {Route, Routes} from "react-router-dom";
import Login from "../frontend/screens/login";
import Register from "../frontend/screens/register";
import Dashboard from "../frontend/screens/dashboard";

function BackendRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    );
}

export default BackendRoutes;