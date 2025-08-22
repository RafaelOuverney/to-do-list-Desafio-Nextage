import React, { useState } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
}

export default function Modal({ open, onClose }: ModalProps) {
    const [email, setEmail] = useState('');

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
                <h2 className="text-lg font-semibold mb-4 text-neutral-700 start-0">Redefinir senha</h2>
                <p className="text-sm text-neutral-600 mb-4">
                    Digite seu e-mail para receber um link de redefinição de senha.</p>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={e => {
                        e.preventDefault();
                        // Aqui você pode adicionar a lógica para enviar o e-mail
                        alert(`E-mail de redefinição enviado para: ${email}`);
                        setEmail('');
                        onClose();
                    }}
                >
                    <input
                        type="email"
                        className="p-2 border-b-2 border-neutral-500 text-neutral-700 focus:outline-none"
                        placeholder="Digite seu e-mail"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-600 transition duration-200 cursor-pointer"
                    >
                        Enviar redefinição
                    </button>
                </form>
            </div>
        </div>
    );
}