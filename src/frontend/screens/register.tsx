import { useState } from "react";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VerificationModal from "./verification-modal";

const Register = () => {
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const inputDecoration = "focus:outline-none mb-4 p-2 border-b-2 border-neutral-500 text-neutral-700 w-full";
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = (form.querySelector('input[placeholder="Nome"]') as HTMLInputElement)?.value.trim();
        const dob = (form.querySelector('input[type="date"]') as HTMLInputElement)?.value.trim();
        const email = (form.querySelector('input[type="email"]') as HTMLInputElement)?.value.trim();
        const password = (form.querySelector('input[placeholder="Senha"]') as HTMLInputElement)?.value.trim();
        const confirmPassword = (form.querySelector('input[placeholder="Confirme a Senha"]') as HTMLInputElement)?.value.trim();

        if (!name || !dob || !email || !password || !confirmPassword) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        if (password !== confirmPassword) {
            alert("As senhas não coincidem.");
            return;
        }

        setOpen(true);
        console.log("Form submitted with email:", email);
    };

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen sm:flex-col ">
            <div className="flex flex-col items-center justify-center w-1/2 h-1/2 p-8">
                <img src="./src/assets/register-image.png" alt="Login Image" className="min-w-60 lg:w-4/5 " />
            </div>
            <div className="relative flex flex-col items-center justify-center w-4/5 h-4/5 lg:w-1/2 lg:h-1/2 p-8 bg-neutral-200 rounded-lg shadow-lg">
                <button
                    className="absolute top-4 left-4 text-neutral-500 hover:text-neutral-700 flex items-center"
                    onClick={() => navigate(-1)}
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="ml-1">Voltar</span>
                </button>
                <h1 className="text-3xl p-6 text-neutral-700 lg:text-6xl">Registre-se</h1>
                <form className="flex flex-col w-full max-w-sm" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className={inputDecoration}
                        placeholder="Nome"
                        required
                    />
                    <div className="relative w-full">
                        <input
                            type="date"
                            className={inputDecoration}
                            placeholder="Data de Nascimento"
                            required
                        />
                        <input
                            type="text"
                            className={inputDecoration + " absolute top-0 left-0 opacity-0 pointer-events-none"}
                            placeholder="Data de Nascimento"
                            onFocus={(e) => e.target.type = "date"}
                            onBlur={(e) => e.target.type = "text"}
                        />
                    </div>
                    <input
                        type="email"
                        className={inputDecoration}
                        placeholder="E-mail"
                        required
                    />
                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            className={inputDecoration + " pr-10"}
                            placeholder="Senha"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                            onClick={() => setShowPassword(v => !v)}
                            tabIndex={-1}
                        >
                            {showPassword ? <Eye className="w-5 h-5 mb-2" /> : <EyeOff className="w-5 h-5 mb-2" />}
                        </button>
                    </div>
                    <div className="relative w-full">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            className={inputDecoration + " pr-10"}
                            placeholder="Confirme a Senha"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                            onClick={() => setShowConfirmPassword(v => !v)}
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? <Eye className="w-5 h-5 mb-2" /> : <EyeOff className="w-5 h-5 mb-2" />}
                        </button>
                    </div>
                    <div className="flex flex-col lg:flex-row w-full h-full items-center justify-around lg:gap-10 gap-2">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-[#100872] text-white rounded hover:bg-[#4c4ef4] transition duration-200"
                        >
                            Enviar
                        </button>
                    </div>
                </form>
                {open && <VerificationModal open={open} onClose={() => setOpen(false)} useremail={(document.querySelector('input[type="email"]') as HTMLInputElement)?.value} />}
            </div>
        </div>
    );
};

export default Register;