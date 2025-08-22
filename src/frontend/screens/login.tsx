import { useState } from "react";
import Modal from "./modals/modal-password";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const buttonDecoration = "w-full px-4 py-2 bg-[#100872] text-white rounded hover:bg-[#4c4ef4] transition duration-200 cursor-pointer"

    return (
        <div className="flex flex-col lg:flex-row lg:mr-52 items-center justify-center min-h-screen sm:flex-col" >
            <div className="flex flex-col items-center justify-center w-1/2 h-1/2 p-8">
                <img src="./src/assets/login-image.png" alt="Login Image" className="min-w-60 lg:w-4/5 " />
            </div>
            <div className="flex flex-col items-center justify-center w-4/5 h-4/5 lg:w-1/2 lg:h-1/2  p-8 bg-neutral-200 rounded-lg shadow-lg">
                <h1 className="p-6 text-neutral-700 text-6xl">Bem Vindo!</h1>
                <GoogleLogin shape="circle" onSuccess={(credentialResponse) => {
                    
                    console.log("Google Login Success:", credentialResponse);

                }} onError={() => {
                    console.error("Google Login Error");
                }} />
                <div className="flex items-center w-full max-w-sm my-4">
                    <hr className="flex-grow border-t border-neutral-400" />
                    <span className="mx-4 text-neutral-500 font-medium">ou</span>
                    <hr className="flex-grow border-t border-neutral-400" />
                </div>
                <form className="flex flex-col w-full max-w-sm">
                    <input
                        type="email"
                        className="focus:outline-none mb-4 p-2 border-b-2 border-neutral-500 text-neutral-700"
                        placeholder="E-mail"
                        about="Email input field for user login"
                    />
                    <input
                        type="password"
                        className="focus:outline-none  p-2 border-b-2 border-neutral-500 text-neutral-700"
                        placeholder="Senha"
                        about="Password input field for user login"
                    />
                    <a href="#" className="mb-6 mt-2 text-sm text-blue-500 hover:underline" onClick={() => setOpen(true)}>
                        Esqueci minha senha</a>
                    <Modal open={open} onClose={() => setOpen(false)} />
                    <div className="flex flex-col lg:flex-row w-full h-full items-center justify-around lg:gap-10 gap-2">
                        <button
                            type="submit"
                            className={buttonDecoration}
                            onClick={() => navigate("/dashboard")}
                        >
                            Login
                        </button>
                        <button
                            className={buttonDecoration}
                            onClick={() => navigate("/register")}
                            type="button"
                        >
                            Cadastre-se
                        </button>
                    </div>
                </form>
                <line />
            </div>
        </div>
    );
}

export default Login;