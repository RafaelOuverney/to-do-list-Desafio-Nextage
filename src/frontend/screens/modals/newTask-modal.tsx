import React, { useState, useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Plus } from 'lucide-react';

interface ColumnOption { id: string; name: string }
interface Props {
  open: boolean;
  onClose: () => void;
  // onCreated returns the created task object from server and the chosen column id
  onCreated?: (createdTask: any, columnId: string) => void;
  columns?: ColumnOption[];
}

export default function NewTaskModal({ open, onClose, onCreated, columns = [] }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>(columns[0]?.id ?? 'todo');
  const toast = useRef<any | null>(null);

  useEffect(() => {
    if (!open) {
      setTitle('');
      setContent('');
      setLoading(false);
      setSelectedColumn(columns[0]?.id ?? 'todo');
    }
  }, [open, columns]);

  function getCurrentEmail(): string | null {
    try {
      const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.email ?? null;
    } catch (e) {
      return null;
    }
  }

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Título', detail: 'Informe o título da tarefa', life: 3000 });
      return;
    }

    const email = getCurrentEmail();
    if (!email) {
      toast.current?.show({ severity: 'error', summary: 'Usuário', detail: 'Usuário não identificado. Faça login.', life: 4000 });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ title: title.trim(), content: content.trim() || undefined, columnId: Number(selectedColumn) || undefined }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      toast.current?.show({ severity: 'success', summary: 'Criado', detail: 'Tarefa criada com sucesso', life: 3000 });
      onCreated && onCreated(created, selectedColumn);
      onClose();
    } catch (err: any) {
      console.error('Erro criando task', err);
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: String(err?.message ?? err), life: 5000 });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-gradient-to-br from-white/80 to-neutral-100/80 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600"><Plus /></div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-950">Adicionar nova tarefa</h3>
            <p className="text-sm text-neutral-600">Escolha o bloco e adicione os detalhes da tarefa.</p>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" className="text-black col-span-2 p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-200" />
            <select value={selectedColumn} onChange={e => setSelectedColumn(e.target.value)} className="text-black cursor-pointer p-3 border rounded-md shadow-sm">
              {columns.length ? columns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              )) : (
                <>
                </>
              )}
            </select>
          </div>

          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Descrição (opcional)" className="text-blackp-3 border rounded-md h-36 shadow-sm text-black" />

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-neutral-50 border text-black cursor-pointer hover:bg-neutral-200">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-700 cursor-pointer">
              {loading ? 'Criando...' : 'Criar tarefa'}
            </button>
          </div>
        </form>

        <Toast ref={toast} />
      </div>
    </div>
  );
}
