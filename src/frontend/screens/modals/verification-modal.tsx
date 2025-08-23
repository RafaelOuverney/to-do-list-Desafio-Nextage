import React, { useState, useEffect, useRef } from "react";
import { Toast } from 'primereact/toast';
import { X, Mail } from "lucide-react";

interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
  useremail?: string;
  verificationCode?: number;
  onVerified?: () => Promise<void> | void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  open,
  onClose,
  useremail,
  verificationCode,
  onVerified,
}) => {
  const [codeInput, setCodeInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const toast = useRef<any | null>(null);

  useEffect(() => {
    if (!open) {
      setCodeInput("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (!verificationCode) {
      toast.current?.show({ severity: 'warn', summary: 'Código', detail: 'Código não disponível.', life: 3000 });
      return;
    }
    if (Number(codeInput) === verificationCode) {
      try {
        setLoading(true);
        if (onVerified) await onVerified();
        onClose();
      } catch (err) {
        console.error("Erro ao criar usuário após verificação:", err);
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao finalizar cadastro.', life: 4000 });
      } finally {
        setLoading(false);
      }
    } else {
      toast.current?.show({ severity: 'warn', summary: 'Código', detail: 'Código inválido.', life: 3000 });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 to-neutral-100/80 p-6 shadow-2xl backdrop-blur-md transition-all duration-200 ease-out motion-safe:animate-fade-in">
        <button
          aria-label="Fechar"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-neutral-600 hover:bg-neutral-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-800">
              Verificação de e-mail
            </h3>
            <p className="text-sm text-neutral-600">
              Enviamos um código para seu e-mail
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-neutral-700 break-words">
          {useremail ? (
            <>
              Código enviado para{" "}
              <span className="font-medium text-neutral-800">{useremail}</span>.
            </>
          ) : (
            "Verifique seu e-mail para encontrar o código de verificação."
          )}
        </p>

        <div className="mt-5">
          <label className="sr-only">Código de verificação</label>
          <input
            type="text"
            inputMode="numeric"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={8}
            placeholder="Digite o código (ex: 123456)"
            className="text-black w-full rounded-lg border border-neutral-200 bg-white/60 px-4 py-3 text-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Código de verificação"
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 bg-neutral-50 border border-neutral-200 cursor-pointer"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            className={`ml-auto inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } cursor-pointer`}
            disabled={loading}
          >
            {loading ? "Confirmando..." : "Confirmar"}
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-neutral-500">
          <span>Não recebeu o código?</span>{" "}
          <button
            onClick={() => {
              navigator.clipboard.writeText(String(verificationCode ?? ""));
              toast.current?.show({ severity: 'info', summary: 'Copiado', detail: 'Código copiado para a área de transferência (apenas para desenvolvimento).', life: 3000 });
            }}
            className="ml-2 font-medium text-blue-600 hover:underline cursor-pointer"
          >
            Copiar código (dev)
          </button>
        </div>
        <div>
          <Toast ref={toast} />
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;