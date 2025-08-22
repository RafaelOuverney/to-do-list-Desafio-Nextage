import { useRef, useEffect } from "react";

interface AddColumnModalProps {
    show: boolean;
    value: string;
    onChange: (v: string) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function AddColumnModal({ show, value, onChange, onClose, onSubmit }: AddColumnModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (show) setTimeout(() => inputRef.current?.focus(), 100);
    }, [show]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 bg-opacity-40 flex items-center justify-center z-50">
            <form
                onSubmit={onSubmit}
                className="bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4 min-w-[300px]"
                style={{ minWidth: 300 }}
            >
                <h3 className="text-lg font-bold text-indigo-800">Nome da nova coluna</h3>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-400 text-black"
                    placeholder="Digite o nome..."
                    required
                />
                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                    >
                        Criar
                    </button>
                </div>
            </form>
        </div>
    );
}