import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

type Task = { id: number | string; title: string; content?: string | null; createdAt?: string; finished?: boolean };

const FinishedTasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [query, setQuery] = useState('');
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useRef<any | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    async function fetchTasks() {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // try to read current user from localStorage (same approach as dashboard)
            const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
            let email: string | null = null;
            try { email = raw ? JSON.parse(raw)?.email : null } catch(e) { email = null }

            let res: Response;
            if (email) {
                // fetch all tasks of the author and keep only finished ones client-side
                res = await fetch(`http://localhost:3000/tasks/author/${encodeURIComponent(email)}`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
            } else {
                // fallback: fetch global finished tasks if no user info
                res = await fetch('http://localhost:3000/tasks/finished', { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
            }

            if (!res.ok) throw new Error('Erro ao buscar tarefas finalizadas');
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            // ensure we display only finished tasks
            const finishedOnly = list.filter((t: any) => t && t.finished === true).map((t: any) => ({ id: t.id, title: t.title, content: t.content ?? null, createdAt: t.createdAt, finished: t.finished }));
            setTasks(finishedOnly);
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: String(err), life: 3000 });
        } finally {
            setLoading(false);
        }
    }

    function confirmReopen(task: Task) {
        confirmDialog({
            message: 'Deseja reabrir esta tarefa? Ela voltará ao seu quadro de tarefas.',
            header: 'Reabrir tarefa',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Reabrir',
            rejectLabel: 'Cancelar',
            accept: () => reopenTask(task.id),
        });
    }

    async function reopenTask(id: number | string) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.current?.show({ severity: 'warn', summary: 'Autenticação', detail: 'Usuário não autenticado', life: 3000 });
                return;
            }
            const res = await fetch(`http://localhost:3000/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ finished: false }),
            });
            if (!res.ok) throw new Error('Falha ao reabrir a tarefa');
            await res.json();
            // remove reopened task from finished list
            setTasks(prev => prev.filter(t => String(t.id) !== String(id)));
            toast.current?.show({ severity: 'success', summary: 'Reaberta', detail: 'Tarefa reaberta com sucesso', life: 3000 });
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: String(err), life: 3000 });
        }
    }

    function applyFilters() {
        let filtered = tasks.slice();
        if (query.trim()) {
            const q = query.toLowerCase();
            filtered = filtered.filter(t => String(t.title).toLowerCase().includes(q));
        }
        if (fromDate) {
            const from = new Date(fromDate).getTime();
            filtered = filtered.filter(t => t.createdAt && new Date(t.createdAt).getTime() >= from);
        }
        if (toDate) {
            const to = new Date(toDate).getTime();
            filtered = filtered.filter(t => t.createdAt && new Date(t.createdAt).getTime() <= to);
        }
        return filtered.sort((a, b) => (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    }

    const results = applyFilters();

    return (
        <div className="p-4 sm:p-8">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => history.back()} className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-indigo-950 cursor-pointer">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Tarefas finalizadas</h1>
                        <div className="text-sm text-gray-500">Visualize e filtre suas tarefas concluídas</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border rounded-lg px-3 py-2 shadow-sm">
                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Pesquisar por título"
                            className="outline-none text-sm text-black"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
                <div className="flex gap-2 w-full sm:w-auto text-white">
                    <label className="flex items-center gap-2 text-sm text-white">
                        De:
                        <input type="date" value={fromDate ?? ''} onChange={e => setFromDate(e.target.value || null)} className="p-2 border rounded-md" />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-white">
                        Até:
                        <input type="date" value={toDate ?? ''} onChange={e => setToDate(e.target.value || null)} className="p-2 border rounded-md" />
                    </label>
                </div>
                <div className="ml-auto flex gap-2">
                    <button onClick={() => { setQuery(''); setFromDate(null); setToDate(null); }} className="px-3 py-2 rounded-md bg-gray-100 text-indigo-950 cursor-pointer hover:bg-neutral-300">Limpar filtros</button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse p-4 bg-white rounded-lg shadow">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                            <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-5/6" />
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {results.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-xl font-semibold">Nenhuma tarefa finalizada encontrada</div>
                            <div className="text-sm text-gray-500 mt-2">Tente ajustar os filtros ou volte ao dashboard</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map(t => (
                                <article key={t.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col gap-3">
                                    <header className="flex items-start justify-between">
                                        <h3 className="text-lg font-semibold text-indigo-900">{t.title}</h3>
                                        <div className="text-xs text-gray-400">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}</div>
                                    </header>
                                    <p className="text-sm text-gray-600 line-clamp-3">{t.content ?? '—'}</p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="text-xs text-gray-500">Concluída</div>
                                        <div className="text-xs text-gray-400">{t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</div>
                                    </div>
                                    <button className='bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 cursor-pointer'
                                        onClick={() => confirmReopen(t)}
                                    >Reabrir</button>
                                </article>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FinishedTasks;

