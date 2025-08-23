import { useState, useRef } from "react";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VerificationModal from "./modals/verification-modal";
import { Toast } from 'primereact/toast';
import type { Toast as ToastType } from 'primereact/toast';

type TempUser = {
    name: string;
    email: string;
    password: string;
};

const Register = () => {
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [verificationCode, setVerificationCode] = useState<string | null>(null);
    const [tempUser, setTempUser] = useState<TempUser | null>(null);
    const inputDecoration = "focus:outline-none mb-4 p-2 border-b-2 border-neutral-500 text-neutral-700 w-full";
    const navigate = useNavigate();
    const toast = useRef<ToastType | null>(null);

    const createUser = async (user: TempUser) => {
        try {
            const res = await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: user.name,
                    email: user.email,
                    password: user.password,
                }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Erro ao criar usuário");
            }
            const created = await res.json();
            console.log("Usuário criado:", created);
            navigate("/");
        } catch (err: any) {
            console.error("Erro criando usuário:", err?.message ?? err);
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: String(err?.message ?? 'unknown'), life: 5000 });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = (form.querySelector('input[placeholder="Nome"]') as HTMLInputElement)?.value.trim();
        const email = (form.querySelector('input[type="email"]') as HTMLInputElement)?.value.trim();
        const password = (form.querySelector('input[placeholder="Senha"]') as HTMLInputElement)?.value.trim();
        const confirmPassword = (form.querySelector('input[placeholder="Confirme a Senha"]') as HTMLInputElement)?.value.trim();

        if (!name || !email || !password || !confirmPassword) {
            toast.current?.show({ severity: 'warn', summary: 'Campos', detail: 'Por favor, preencha todos os campos obrigatórios.', life: 4000 });
            return;
        }

        if (password !== confirmPassword) {
            toast.current?.show({ severity: 'warn', summary: 'Senha', detail: 'As senhas não coincidem.', life: 4000 });
            return;
        }

        // guarda os dados temporariamente para criar o usuário após verificação
        const userData: TempUser = { name, email, password };
        setTempUser(userData);

        try {
            const response = await fetch("http://localhost:3000/email/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recipients: [email],
                    subject: "Código de Verificação",
                }),
            });
            if (!response.ok) {
                throw new Error("Erro ao enviar email.");
            }
            const data = await response.json();
            setVerificationCode(data.code?.toString() ?? null);
            setOpen(true);
            console.log("Email enviado com sucesso:", data);
            // criação do usuário ocorrerá quando o modal confirmar o código (onVerified)
        } catch (error) {
            console.error("Erro:", error);
            toast.current?.show({ severity: 'error', summary: 'Email', detail: 'Falha ao enviar email. Tente novamente.', life: 4000 });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row items-center lg:mr-52 justify-center min-h-screen sm:flex-col ">
            <div className="flex flex-col items-center justify-center w-1/2 h-1/2 p-8">
                <img src="./src/assets/register-image.png" alt="Login Image" className="min-w-60 lg:w-4/5 " />
            </div>
            <div className="relative flex flex-col items-center justify-center w-4/5 h-4/5 lg:w-1/2 lg:h-1/2 p-8 bg-neutral-200 rounded-lg shadow-lg">
                <button
                    className="absolute top-4 left-4 text-neutral-500 hover:text-neutral-700 flex items-center cursor-pointer"
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
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 cursor-pointer"
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
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 cursor-pointer"
                            onClick={() => setShowConfirmPassword(v => !v)}
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? <Eye className="w-5 h-5 mb-2" /> : <EyeOff className="w-5 h-5 mb-2" />}
                        </button>
                    </div>
                    <div className="flex flex-col lg:flex-row w-full h-full items-center justify-around lg:gap-10 gap-2">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-[#100872] text-white rounded hover:bg-[#4c4ef4] transition duration-200 cursor-pointer"
                        >
                            Enviar
                        </button>
                    </div>
                </form>
                {open && verificationCode && tempUser && (
                    <VerificationModal
                        open={open}
                        onClose={() => setOpen(false)}
                        useremail={tempUser.email}
                        verificationCode={Number(verificationCode)}
                        onVerified={async () => {
                            await createUser(tempUser);
                        }}
                    />
                )}
                <Toast ref={toast} />
            </div>
        </div>
    );
};

export default Register;