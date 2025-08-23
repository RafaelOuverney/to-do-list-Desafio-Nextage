import { useState, useRef } from "react";
import Modal from "./modals/modal-password";
import { useNavigate } from "react-router-dom";
import { Toast } from 'primereact/toast';

const Login = () => {
    const [open, setOpen] = useState(false);
    const toast = useRef<any>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const buttonDecoration = "w-full px-4 py-2 bg-[#100872] text-white rounded hover:bg-[#4c4ef4] transition duration-200 cursor-pointer"
    const showError = (summary: string, detail?: string) => {
        toast.current?.show({ severity: 'error', summary, detail, life: 3000 });
    };
    const showSuccess = (summary: string, detail?: string) => {
        toast.current?.show({ severity: 'success', summary, detail, life: 2000 });
    };
    return (
        <div className="flex flex-col lg:flex-row lg:mr-52 items-center justify-center min-h-screen sm:flex-col" >
            <div className="flex flex-col items-center justify-center w-1/2 h-1/2 p-8">
                <img src="./src/assets/login-image.png" alt="Login Image" className="min-w-60 lg:w-4/5 " />
            </div>
            <div className="flex flex-col items-center justify-center w-4/5 h-4/5 lg:w-1/2 lg:h-1/2  p-8 bg-neutral-200 rounded-lg shadow-lg">
                <h1 className="p-6 text-neutral-700 text-6xl">Bem Vindo!</h1>
                {/* Google login removed — not used yet */}
                <div className="flex items-center w-full max-w-sm my-4">
                    <hr className="flex-grow border-t border-neutral-400" />
                    <span className="mx-4 text-neutral-500 font-medium">ou</span>
                    <hr className="flex-grow border-t border-neutral-400" />
                </div>
                <form className="flex flex-col w-full max-w-sm" onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    const form = e.target as HTMLFormElement;
                    const email = (form.querySelector('input[type="email"]') as HTMLInputElement).value;
                    const password = (form.querySelector('input[type="password"]') as HTMLInputElement).value;

                    try {
                        const res = await fetch('http://localhost:3000/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password }),
                        });
                        if (!res.ok) {
                            const err = await res.json().catch(() => ({}));
                            showError('Login failed', err?.message || 'Invalid credentials');
                            return;
                        }
                        const data = await res.json();
                        // store user and token in localStorage
                        localStorage.setItem('currentUser', JSON.stringify(data.user));
                        localStorage.setItem('token', data.token);
                        showSuccess('Login successful');
                        navigate('/dashboard');
                    } catch (err) {
                        showError('Network error', 'Unable to reach server');
                        console.error(err);
                    } finally {
                        setLoading(false);
                    }
                }}>
                    <Toast ref={toast} />
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
                            className={buttonDecoration + (loading ? ' opacity-80 cursor-not-allowed' : '')}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                                    Entrando...
                                </span>
                            ) : (
                                'Login'
                            )}
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