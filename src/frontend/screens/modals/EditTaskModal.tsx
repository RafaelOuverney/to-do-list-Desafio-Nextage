import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (updated: any, columnId: string) => void;
  task: { id: string; title: string; content?: string | null; createdAt?: string | Date; done?: boolean } | null;
  columns: { id: string; name: string }[];
};

const EditTaskModal: React.FC<Props> = ({ open, onClose, onSaved, task, columns }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [columnId, setColumnId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setContent(task.content ?? '');
    }
  }, [task]);

  useEffect(() => {
    if (columns && columns.length && !columnId) setColumnId(columns[0].id);
  }, [columns]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const body: any = { title, content };
      if (columnId) body.columnId = Number(columnId);
      const res = await fetch(`http://localhost:3000/tasks/${encodeURIComponent(task.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erro ao atualizar');
      }
      const updated = await res.json();
      onSaved(updated, String(updated.columnId));
      setLoading(false);
      onClose();
    } catch (err) {
      console.error('Erro salvando tarefa', err);
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !loading && onClose()} />
      <form onSubmit={save} className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[min(720px,96%)] max-h-[90vh] overflow-auto p-0">
        <header className="flex items-center justify-between gap-3 p-4 border-b dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-700 rounded-md p-2"><Edit3 className="w-5 h-5" /></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Editar tarefa</h3>
              <div className="text-xs text-gray-500">Modifique título, descrição ou coluna</div>
            </div>
          </div>
          <button type="button" onClick={() => !loading && onClose()} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={loading}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coluna</label>
            <select value={columnId ?? ''} onChange={e => setColumnId(e.target.value)} disabled={loading}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-800 dark:border-gray-700">
              {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => !loading && onClose()} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200" disabled={loading}>Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditTaskModal;
