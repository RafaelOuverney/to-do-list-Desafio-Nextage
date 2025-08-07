import { useState } from "react";
import Modal from "./modal";

const Login = () => {
    const [open, setOpen] = useState(false);
    return (
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen sm:flex-col " >
            <div className="flex flex-col items-center justify-center w-1/2 h-1/2 p-8">
                <img src="./src/assets/login-image.png" alt="Login Image" className="min-w-60 lg:w-4/5 " />
            </div>
            <div className="flex flex-col items-center justify-center w-4/5 h-4/5 lg:w-1/2 lg:h-1/2  p-8 bg-neutral-200 rounded-lg shadow-lg">
                <h1 className="p-6 text-neutral-700 text-6xl">Bem Vindo!</h1>
                <button className="flex flex-row gap-5 mb-4 px-4 py-2 bg-neutral-900 text-white rounded-2xl hover:bg-blue-700 transition duration-200 " type="button">
                    <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
                    Continue com o Google
                </button>

                <form className="flex flex-col w-full max-w-sm">
                    <input
                        type="email"
                        className="focus:outline-none mb-4 p-2 border-b-2 border-neutral-500 text-neutral-700"
                        placeholder="E-mail"
                        about="Email input field for user login"
                    />
                    <input
                        type="password"
                        className="focus:outline-none mb-4 p-2 border-b-2 border-neutral-500 text-neutral-700"
                        placeholder="Senha"
                        about="Password input field for user login"
                    />
                    <div className="flex flex-col lg:flex-row w-full h-full items-center justify-around lg:gap-10 gap-2">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-600 transition duration-200"
                        >
                            Login
                        </button>
                        <button
                            className="w-full px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-600 transition duration-200"
                        >
                            Cadastre-se
                        </button>
                    </div>
                </form>
                <line />
                <a href="#" className="mt-4 text-sm text-blue-500 hover:underline" onClick={() => setOpen(true)}>
                    Esqueci minha senha</a>
                <Modal open={open} onClose={() => setOpen(false)} />
            </div>
        </div>
    );
}

export default Login;