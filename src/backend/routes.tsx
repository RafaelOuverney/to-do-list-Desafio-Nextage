import {Route, Routes} from "react-router-dom";
import Login from "../frontend/screens/login";
import Register from "../frontend/screens/register";

function BackendRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    );
}

export default BackendRoutes;