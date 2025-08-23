import { BookCheck, Columns, Plus, TriangleAlert } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { Column } from "../components/Column";
import { AddColumnModal } from "../components/AddColumnModal";
import NewTaskModal from "./modals/newTask-modal";
import EditTaskModal from "./modals/EditTaskModal";

type Item = { id: string; title: string; content?: string | null; createdAt?: string | Date; done?: boolean };
type ColumnType = { name: string; items: Item[] };
type ColumnsType = Record<string, ColumnType>;

const defaultColumns: ColumnsType = {

};

const Dashboard = () => {
    const [columns, setColumns] = useState<ColumnsType>({});
    const toast = useRef<any | null>(null);
    const finishTimers = useRef<Record<string, number>>({});
    const shownFinishToasts = useRef<Record<string, boolean>>({});
    const [showModal, setShowModal] = useState(false);
    const [showNewTask, setShowNewTask] = useState(false);
    const navigate = useNavigate();
    const [editingTask, setEditingTask] = useState<any | null>(null);
    const [newColName, setNewColName] = useState("");

    useEffect(() => {
        // load user's columns and tasks
        (async function load() {
            const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
            let email: string | null = null;
            try { email = raw ? JSON.parse(raw)?.email : null } catch(e) { email = null }
            if (!email) {
                // no logged user: show default local columns
                setColumns(defaultColumns);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const colsRes = await fetch(`http://localhost:3000/columns/author`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
                let remoteCols: any[] = [];
                if (colsRes.ok) remoteCols = await colsRes.json();


                const colsMap: any = {};
                if (remoteCols.length) {
                    remoteCols.forEach(c => {
                        colsMap[String(c.id)] = { name: c.title, items: [] };
                    });
                } else {

                    Object.entries(defaultColumns).forEach(([k, v]) => colsMap[k] = v);
                }


                const res = await fetch(`http://localhost:3000/tasks/author/${encodeURIComponent(email)}`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
                if (res.ok) {
                    const tasks = await res.json();
                    tasks.forEach((t: any) => {
                        // only include tasks that are not finished
                        if (t.finished) return;
                        const colId = String(t.columnId ?? 'todo');
                        if (!colsMap[colId]) {
                            colsMap[colId] = { name: t.column?.title ?? 'A Fazer', items: [] };
                        }
                        colsMap[colId].items = colsMap[colId].items || [];
                        colsMap[colId].items.push({ id: String(t.id), title: t.title, content: t.content ?? null, createdAt: t.createdAt, done: t.finished });
                    });
                }

                setColumns(colsMap);
            } catch (err) {
                console.error('Erro carregando columns/tasks do usuário', err);
            }
        })()
    }, []);

    function handleAddColumn(name: string) {
        // create column on server if user logged in
        (async function create() {
            const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
            let email: string | null = null;
            try { email = raw ? JSON.parse(raw)?.email : null } catch(e) { email = null }
            if (!email) {
                // fallback to local
                const newId = `col-${Date.now()}`;
                setColumns(cols => ({
                    ...cols,
                    [newId]: { name, items: [] }
                }));
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:3000/columns', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                    body: JSON.stringify({ title: name }),
                });
                if (!res.ok) throw new Error('Erro criando coluna');
                const created = await res.json();
                const id = String(created.id);
                setColumns(cols => ({ ...cols, [id]: { name: created.title, items: [] } }));
            } catch (err) {
                console.error('Erro criando coluna remota', err);
            }
        })();
    }

    function openModal() {
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setNewColName("");
    }

    function handleModalSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (newColName.trim()) {
            handleAddColumn(newColName.trim());
            closeModal();
        }
    }

    function onDragEnd(result: any) {
        if (!result.destination) return;
        if (result.type === "COLUMN") {
            const colEntries = Object.entries(columns);
            const [removed] = colEntries.splice(result.source.index, 1);
            colEntries.splice(result.destination.index, 0, removed);
            setColumns(Object.fromEntries(colEntries));
        } else {
            const { source, destination } = result;
            const sourceCol = columns[source.droppableId];
            const destCol = columns[destination.droppableId];
            const sourceItems = Array.from(sourceCol.items);
            const [removed] = sourceItems.splice(source.index, 1);

            if (source.droppableId === destination.droppableId) {
                sourceItems.splice(destination.index, 0, removed);
                setColumns({
                    ...columns,
                    [source.droppableId]: {
                        ...sourceCol,
                        items: sourceItems
                    }
                });
            } else {
                const destItems = Array.from(destCol.items);
                destItems.splice(destination.index, 0, removed);
                setColumns({
                    ...columns,
                    [source.droppableId]: {
                        ...sourceCol,
                        items: sourceItems
                    },
                    [destination.droppableId]: {
                        ...destCol,
                        items: destItems
                    }
                });
            }
        }
    }

    function handleDone(colId: string, itemId: string) {
        setColumns(cols => {
            const col = cols[colId];
            if (!col) return cols;
            const item = col.items.find((it: any) => String(it.id) === String(itemId));
            if (!item) return cols;

            const newDone = !item.done;

            const newCols = {
                ...cols,
                [colId]: {
                    ...col,
                    items: col.items.map((it: any) => it.id === itemId ? { ...it, done: newDone } : it)
                }
            };

            (async () => {
                const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
                let email: string | null = null;
                try { email = raw ? JSON.parse(raw)?.email : null } catch(e) { email = null }
                if (!email) return;

                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`http://localhost:3000/tasks/${encodeURIComponent(itemId)}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                        body: JSON.stringify({ finished: newDone })
                    });
                    if (!res.ok) {
                        const txt = await res.text();
                        throw new Error(txt || 'Erro atualizando tarefa');
                    }


                    if (newDone) {
                        const timerId = window.setTimeout(() => {
                            setColumns(prev => {
                                const updated = { ...prev };
                                if (updated[colId]) {
                                    updated[colId] = {
                                        ...updated[colId],
                                        items: updated[colId].items.filter((it: any) => String(it.id) !== String(itemId))
                                    };
                                }
                                return updated;
                            });
                            delete finishTimers.current[itemId];
                        }, 5000);
                        finishTimers.current[itemId] = timerId as unknown as number;

                        if (!shownFinishToasts.current[String(itemId)]) {
                            shownFinishToasts.current[String(itemId)] = true;
                            toast.current?.show({ severity: 'success', summary: 'Concluída', detail: 'Tarefa marcada como finalizada (removida em 5s)', life: 3000 });
                        }
                    } else {

                        const existing = finishTimers.current[itemId];
                        if (existing) {
                            clearTimeout(existing);
                            delete finishTimers.current[itemId];
                        }

                        if (shownFinishToasts.current[String(itemId)]) delete shownFinishToasts.current[String(itemId)];
                    }
                } catch (err) {
                    console.error('Erro ao atualizar finished no servidor', err);
                    toast.current?.show({ severity: 'error', summary: 'Erro', detail: String(err), life: 4000 });

                    setColumns(prev => ({
                        ...prev,
                        [colId]: {
                            ...prev[colId],
                            items: prev[colId].items.map((it: any) => it.id === itemId ? { ...it, done: item.done } : it)
                        }
                    }));
                }
            })();

            return newCols;
        });
    }

    function handleDelete(colId: string, itemId: string) {
        confirmDialog({
            message: (
                <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
                    <TriangleAlert className="text-6xl text-red-500" />
                    <div style={{ textAlign: 'center' }}>
                        <div>Deseja realmente excluir esta tarefa?</div>
                        <div>Esta ação não pode ser desfeita.</div>
                    </div>
                </div>
            ),
            header: 'Excluir Tarefa',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Apagar',
            rejectLabel: 'Cancelar',
            acceptClassName: 'p-button-danger',
            rejectClassName: 'p-button-secondary',
            accept: async () => {
                const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
                let email: string | null = null;
                try { email = raw ? JSON.parse(raw)?.email : null } catch(e) { email = null }

                if (!email) {
                    // local-only deletion
                    setColumns(cols => ({
                        ...cols,
                        [colId]: {
                            ...cols[colId],
                            items: cols[colId].items.filter(item => item.id !== itemId)
                        }
                    }));
                    toast.current?.show({ severity: 'success', summary: 'Apagado', detail: 'Tarefa removida', life: 2500 });
                    return;
                }

                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`http://localhost:3000/tasks/${encodeURIComponent(itemId)}`, {
                        method: 'DELETE',
                        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
                    });
                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(text || 'Erro removendo tarefa');
                    }
                    setColumns(cols => ({
                        ...cols,
                        [colId]: {
                            ...cols[colId],
                            items: cols[colId].items.filter(item => item.id !== itemId)
                        }
                    }));
                    toast.current?.show({ severity: 'success', summary: 'Apagado', detail: 'Tarefa removida com sucesso', life: 2500 });
                } catch (err) {
                    console.error('Erro removendo tarefa remota', err);
                    const errorMsg = err instanceof Error ? err.message : String(err);
                    toast.current?.show({ severity: 'error', summary: 'Erro', detail: errorMsg, life: 4000 });
                }
            },
            reject: () => {}
        });
    }

    function handleDeleteColumn(colId: string) {
        (async function del() {
            const raw = localStorage.getItem('currentUser') || localStorage.getItem('user');
            let email: string | null = null;
            try { email = raw ? JSON.parse(raw)?.email : null } catch(e) { email = null }
            if (!email) {
                setColumns(cols => {
                    const newCols = { ...cols };
                    delete newCols[colId];
                    return newCols;
                });
                return;
            }

                try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:3000/columns/${encodeURIComponent(colId)}`, {
                    method: 'DELETE',
                    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
                });
                if (!res.ok) {
                    const text = await res.text();
                        throw new Error('Erro removendo coluna: ' + text);
                }
                setColumns(cols => {
                    const newCols = { ...cols };
                    delete newCols[colId];
                    return newCols;
                });
                    toast.current?.show({ severity: 'success', summary: 'Apagado', detail: 'Coluna removida com sucesso', life: 3000 });
            } catch (err) {
                console.error('Erro ao remover coluna remota', err);

                setColumns(cols => {
                    const newCols = { ...cols };
                    delete newCols[colId];
                    return newCols;
                });
                const errorMsg = err instanceof Error ? err.message : String(err);
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: errorMsg, life: 4000 });
            }
        })();
    }

    // determine user avatar URL/data for header (prefer server-served avatar when user id present)
    let headerUserAvatar = 'https://i.pravatar.cc/100';
    try {
        const rawUser = localStorage.getItem('currentUser') || localStorage.getItem('user');
        const parsed = rawUser ? JSON.parse(rawUser) : null;
        if (parsed) {
            if (parsed.id) {
                headerUserAvatar = `http://localhost:3000/users/${encodeURIComponent(String(parsed.id))}/avatar`;
            } else if (parsed.avatar) {
                headerUserAvatar = parsed.avatar;
            } else if (parsed.avatarBase64) {
                headerUserAvatar = parsed.avatarBase64;
            }
        }
    } catch (e) {
        // ignore parse errors and keep default avatar
    }

    return (
        <>
            <ConfirmDialog />
            <Toast ref={toast} />
            <header className="bg-indigo-800 h-20 flex items-center justify-between space lg:gap-5 gap-1" >
                <h1 className="text-white p-10 font-black font font-(family-name: )">Dashboard</h1>
                <div className="flex justify-between lg:gap-10 gap-5 p-5">
                    <button aria-label="Adicionar Tarefa" onClick={() => setShowNewTask(true)} className="w-full px-4 py-2 bg-[#100872] text-white rounded-xl hover:bg-[#4c4ef4] transition duration-200 flex items-center lg:gap-2 gap-1 cursor-pointer">
                        <Plus className="w-8 h-8" />
                        <span className="hidden sm:inline">Adicionar Tarefa</span>
                    </button>
                    <button onClick={() => navigate('/finished')} className="w-full px-4 py-2 bg-[#100872] text-white rounded-xl hover:bg-[#4c4ef4] transition duration-200 flex items-center gap-2 cursor-pointer">
                        <BookCheck className="w-8 h-8" />
                        <span className="hidden sm:inline">
                            Ver tarefas finalizadas
                        </span>
                    </button>
                    <button
                        aria-label="Perfil"
                        title="Perfil"
                        type="button"
                        className="lg:w-40 h-15 rounded-full overflow-hidden border-2 border-white/30 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50"
                        onClick={() => {
                            const id = 'right-overlay';
                            const existing = document.getElementById(id);
                            if (existing) { existing.remove(); return; }

                            const container = document.createElement('div');
                            container.id = id;
                            container.style.position = 'fixed';
                            container.style.inset = '0';
                            container.style.zIndex = '9999';
                            const rawUser = localStorage.getItem('currentUser') || localStorage.getItem('user');
                            let userName = 'Usuário';
                            let userEmail = 'usuario@exemplo.com';
                            let userAvatar = 'https://i.pravatar.cc/100';
                            try {
                                const parsed = rawUser ? JSON.parse(rawUser) : null;
                                if (parsed) {
                                    userName = parsed.name || userName;
                                    userEmail = parsed.email || userEmail;
                                    if (parsed.id) {
                                        try {
                                            userAvatar = `http://localhost:3000/users/${encodeURIComponent(String(parsed.id))}/avatar`;
                                        } catch(e) { /* ignore */ }
                                    } else if (parsed.avatar) {
                                        // if avatar is a data URL or base64 string, use it directly
                                        userAvatar = parsed.avatar;
                                    } else if (parsed.avatarBase64) {
                                        userAvatar = parsed.avatarBase64;
                                    }
                                }
                            } catch(e) {}
                            container.innerHTML = `
                            <div id="${id}-backdrop" style="position:absolute;inset:0;background:rgba(0,0,0,0.45);"></div>
                            <aside id="${id}-panel" role="dialog" aria-label="Perfil" style="position:absolute;right:0;top:0;bottom:0;width:320px;max-width:85vw;background:#0f172a;color:#fff;padding:20px;box-shadow:-2px 0 12px rgba(0,0,0,0.6);transform:translateX(100%);transition:transform .28s ease;">
                                <button id="${id}-close" aria-label="Fechar painel" style="background:transparent;border:none;color:#fff;font-size:18px;margin-left:auto;display:block;cursor:pointer">✕</button>
                                <div style="display:flex;gap:12px;align-items:center;margin-top:8px">
                                    <img src="${userAvatar}" alt="Foto do usuário" style="width:64px;height:64px;border-radius:8px;object-fit:cover" />
                                    <div>
                                        <strong>${userName}</strong>
                                        <div style="opacity:0.8;font-size:13px">${userEmail}</div>
                                    </div>
                                </div>
                                <nav style="margin-top:18px;display:flex;flex-direction:column;gap:8px">
                                    <button id="${id}-edit" style="text-align:left;padding:10px;border-radius:8px;background:#111827;color:#fff;border:none;cursor:pointer">Editar Perfil</button>
                                    <button id="${id}-settings" style="text-align:left;padding:10px;border-radius:8px;background:#111827;color:#fff;border:none;cursor:pointer">Configurações</button>
                                    <button id="${id}-logout" style="text-align:left;padding:10px;border-radius:8px;background:#7c3aed;color:#fff;border:none;cursor:pointer">Sair</button>
                                </nav>
                            </aside>
                        `;
                            document.body.appendChild(container);

                            const panel = document.getElementById(`${id}-panel`);
                            const backdrop = document.getElementById(`${id}-backdrop`);
                            const closeBtn = document.getElementById(`${id}-close`);
                            const editBtn = document.getElementById(`${id}-edit`);
                            const logoutBtn = document.getElementById(`${id}-logout`);

                            function removeOverlay() {
                                document.removeEventListener('keydown', onKeyDown);

                                backdrop?.removeEventListener('click', removeOverlay);
                                closeBtn?.removeEventListener('click', removeOverlay);
                                if (logoutBtn) logoutBtn.onclick = null;

                                if (panel) {
                                    panel.style.transition = 'transform .28s ease';
                                    panel.style.transform = 'translateX(100%)';
                                }
                                if (backdrop) {
                                    backdrop.style.transition = 'opacity .28s ease';
                                    backdrop.style.opacity = '0';
                                }

                                container.style.pointerEvents = 'none';

                                setTimeout(() => {
                                    container.remove();
                                }, 300);
                            }
                            function onKeyDown(e: KeyboardEvent) {
                                if (e.key === 'Escape') removeOverlay();
                            }

                            setTimeout(() => {
                                if (panel) panel.style.transform = 'translateX(0)';
                            }, 10);

                            backdrop?.addEventListener('click', removeOverlay);
                            closeBtn?.addEventListener('click', removeOverlay);
                            logoutBtn?.addEventListener('click', () => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('currentUser');
                                localStorage.removeItem('user');
                                removeOverlay();
                                try { navigate('/'); } catch(e) { window.location.href = '/'; }
                            });
                            editBtn?.addEventListener('click', () => {
                                removeOverlay();
                                try { navigate('/profile'); } catch(e) { window.location.href = '/profile'; }
                            });
                            document.addEventListener('keydown', onKeyDown);
                        }}
                    >
                            <img
                                src={headerUserAvatar}
                                alt="Foto do usuário"
                                className="w-full h-full object-cover rounded-full"
                            />
                    </button>

                </div>
            </header>
            <main className="p-2 sm:p-6">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex gap-3 sm:gap-6 overflow-x-auto pb-4"
                                style={{
                                    minHeight: 320,
                                    WebkitOverflowScrolling: "touch"
                                }}
                            >
                                {Object.entries(columns).map(([colId, col], idx) => (
                                    <Column
                                        key={colId}
                                        colId={colId}
                                        col={col}
                                        idx={idx}
                                        onRequestDeleteColumn={(id, name) => {
                                            confirmDialog({
                                                message: `Deseja realmente excluir a coluna "${name || ''}" e todas as tarefas associadas?`,
                                                header: 'Confirmação',
                                                icon: 'pi pi-exclamation-triangle',
                                                acceptLabel: 'Apagar',
                                                rejectLabel: 'Cancelar',
                                                accept: () => handleDeleteColumn(id),
                                                reject: () => {}
                                            });
                                        }}
                                        handleDone={handleDone}
                                            handleDelete={handleDelete}
                                            onEdit={(item, colId) => setEditingTask({ ...item, colId })}
                                    />
                                ))}
                                <div className="flex flex-col justify-center items-center min-w-[85vw] sm:min-w-[260px] sm:w-80 w-full">
                    <button
                        onClick={openModal}
                        className="bg-indigo-200 hover:bg-indigo-400 text-indigo-900 font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center transition cursor-pointer"
                        aria-label="Adicionar nova coluna"
                    >
                        <Columns className="w-8 h-8 mb-1" />
                        <span>Nova Coluna</span>
                    </button>
                                </div>
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <AddColumnModal
                        show={showModal}
                        value={newColName}
                        onChange={setNewColName}
                        onClose={closeModal}
                        onSubmit={handleModalSubmit}
                    />
                    <NewTaskModal
                        open={showNewTask}
                        onClose={() => setShowNewTask(false)}
                        columns={Object.entries(columns).map(([id, c]) => ({ id, name: c.name }))}
                        onCreated={(created, columnId) => {
                            setColumns(cols => ({
                                ...cols,
                                [columnId]: {
                                    ...cols[columnId],
                                    items: [{ id: String(created.id), title: created.title, content: created.content ?? null, createdAt: created.createdAt }, ...(cols[columnId]?.items ?? [])]
                                }
                            }));
                        }}
                    />
                    <EditTaskModal
                        open={!!editingTask}
                        onClose={() => setEditingTask(null)}
                        task={editingTask}
                        columns={Object.entries(columns).map(([id, c]) => ({ id, name: c.name }))}
                        onSaved={(updated, newColumnId) => {
                            setColumns(cols => {
                                // remove from old column
                                const oldColId = editingTask?.colId;
                                const newCols = { ...cols };
                                if (oldColId && newCols[oldColId]) {
                                    newCols[oldColId] = {
                                        ...newCols[oldColId],
                                        items: newCols[oldColId].items.filter((it: any) => String(it.id) !== String(updated.id))
                                    }
                                }
                                const destId = String(newColumnId || updated.columnId || 'todo');
                                newCols[destId] = newCols[destId] || { name: 'A Fazer', items: [] };
                                newCols[destId].items = [{ id: String(updated.id), title: updated.title, content: updated.content ?? null, createdAt: updated.createdAt }, ...(newCols[destId].items ?? [])];
                                return newCols;
                            });
                            toast.current?.show({ severity: 'success', summary: 'Salvo', detail: 'Tarefa atualizada', life: 2500 });
                        }}
                    />
                </DragDropContext>
            </main>
        </>

    );
}

export default Dashboard;