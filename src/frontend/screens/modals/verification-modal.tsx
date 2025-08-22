import React, { useState } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    useremail: string;
    verificationCode: number;
}

function handleVerification(code: string, verificationCode: number) {
    if (parseInt(code) === verificationCode) {
        alert("Código verificado com sucesso!");
    } else {
        alert("Código de verificação inválido.");
    }
}

export default function VerificationModal({ open, onClose, useremail, verificationCode }: ModalProps) {
    const [code, setCode] = useState('');

    if (!open) return null;
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-neutral-800/20 bg-opacity-5 bg-blend-overlay z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-sm"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="bg-white absolute top-1 right-5 text-neutral-400 hover:text-red-500 transition duration-200 text-2xl font-bold rounded-full p-1 cursor-pointer"
                >
                    &times;
                </button>
                <h2 className="text-lg font-semibold mb-4 text-neutral-700 start-0">Verificação de Conta</h2>
                <p className="text-sm text-neutral-600 mb-4">
                    Digite o código de verificação enviado para <span className="font-semibold">{useremail}</span>.
                </p>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={e => {
                        e.preventDefault();
                        handleVerification(code, verificationCode);
                    }}
                >
                    <input
                        type="text"
                        className="p-2 border-b-2 border-neutral-500 text-neutral-700 focus:outline-none"
                        placeholder="Código de verificação"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-600 transition duration-200 cursor-pointer"
                        onClick={() => {
                            handleVerification(code, verificationCode);
                        }}
                    >
                        Verificar
                    </button>
                </form>
            </div>
        </div>
    );
}