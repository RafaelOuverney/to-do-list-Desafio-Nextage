import { BookCheck, Columns, Plus } from "lucide-react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useState } from "react";
import { Column } from "../components/Column";
import { AddColumnModal } from "../components/AddColumnModal";

type Item = { id: string; content: string; done?: boolean };
type ColumnType = { name: string; items: Item[] };
type ColumnsType = Record<string, ColumnType>;

const initialData: { columns: ColumnsType } = {
    columns: {
        "todo": {
            name: "A Fazer",
            items: [
                { id: "1", content: "Estudar React" },
                { id: "2", content: "Fazer compras" }
            ]
        },
        "doing": {
            name: "Em Progresso",
            items: [
                { id: "3", content: "Ler um livro" }
            ]
        },
        "validate": {
            name: "Validação",
            items: []
        }
    }
};

const Dashboard = () => {
    const [columns, setColumns] = useState<ColumnsType>(initialData.columns);
    const [showModal, setShowModal] = useState(false);
    const [newColName, setNewColName] = useState("");

    function handleAddColumn(name: string) {
        const newId = `col-${Date.now()}`;
        setColumns(cols => ({
            ...cols,
            [newId]: {
                name,
                items: []
            }
        }));
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
        setColumns(cols => ({
            ...cols,
            [colId]: {
                ...cols[colId],
                items: cols[colId].items.map(item =>
                    item.id === itemId ? { ...item, done: !item.done } : item
                )
            }
        }));
    }

    function handleDelete(colId: string, itemId: string) {
        setColumns(cols => ({
            ...cols,
            [colId]: {
                ...cols[colId],
                items: cols[colId].items.filter(item => item.id !== itemId)
            }
        }));
    }

    function handleDeleteColumn(colId: string) {
        setColumns(cols => {
            const newCols = { ...cols };
            delete newCols[colId];
            return newCols;
        });
    }

    return (
        <>
            <header className="bg-indigo-800 h-20 flex items-center justify-between space lg:gap-5 gap-1" >
                <h1 className="text-white p-10 font-black font font-(family-name: )">Dashboard</h1>
                <div className="flex justify-between lg:gap-10 gap-5 p-5">
                    <button aria-label="Adicionar Tarefa" className="w-full px-4 py-2 bg-[#100872] text-white rounded-xl hover:bg-[#4c4ef4] transition duration-200 flex items-center lg:gap-2 gap-1 cursor-pointer"
                        
                    >
                        <Plus className="w-8 h-8" />
                        <span className="hidden sm:inline">Adicionar Tarefa</span>
                    </button>
                    <button className="w-full px-4 py-2 bg-[#100872] text-white rounded-xl hover:bg-[#4c4ef4] transition duration-200 flex items-center gap-2 cursor-pointer">
                        <BookCheck className="w-8 h-8" />
                        <span className="hidden sm:inline">
                            Ver tarefas finalizadas
                        </span>
                    </button>
                    <button
                        aria-label="Perfil"
                        title="Perfil"
                        type="button"
                        className="lg:w-40 rounded-full overflow-hidden border-2 border-white/30 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50"
                        onClick={() => {
                            const id = 'right-overlay';
                            const existing = document.getElementById(id);
                            if (existing) { existing.remove(); return; }

                            const container = document.createElement('div');
                            container.id = id;
                            container.style.position = 'fixed';
                            container.style.inset = '0';
                            container.style.zIndex = '9999';
                            container.innerHTML = `
                            <div id="${id}-backdrop" style="position:absolute;inset:0;background:rgba(0,0,0,0.45);"></div>
                            <aside id="${id}-panel" role="dialog" aria-label="Perfil" style="position:absolute;right:0;top:0;bottom:0;width:320px;max-width:85vw;background:#0f172a;color:#fff;padding:20px;box-shadow:-2px 0 12px rgba(0,0,0,0.6);transform:translateX(100%);transition:transform .28s ease;">
                                <button id="${id}-close" aria-label="Fechar painel" style="background:transparent;border:none;color:#fff;font-size:18px;margin-left:auto;display:block;cursor:pointer">✕</button>
                                <div style="display:flex;gap:12px;align-items:center;margin-top:8px">
                                    <img src="https://i.pravatar.cc/100" alt="Foto do usuário" style="width:64px;height:64px;border-radius:8px;object-fit:cover" />
                                    <div>
                                        <strong>Usuário</strong>
                                        <div style="opacity:0.8;font-size:13px">usuario@exemplo.com</div>
                                    </div>
                                </div>
                                <nav style="margin-top:18px;display:flex;flex-direction:column;gap:8px">
                                    <button style="text-align:left;padding:10px;border-radius:8px;background:#111827;color:#fff;border:none;cursor:pointer" hover="background:#4c4ef4">Editar Perfil</button>
                                    <button style="text-align:left;padding:10px;border-radius:8px;background:#111827;color:#fff;border:none;cursor:pointer" hover="background:#4c4ef4">Configurações</button>
                                    <button id="${id}-logout" style="text-align:left;padding:10px;border-radius:8px;background:#7c3aed;color:#fff;border:none;cursor:pointer" hover="background:#a855f7">Sair</button>
                                </nav>
                            </aside>
                        `;
                            document.body.appendChild(container);

                            const panel = document.getElementById(`${id}-panel`);
                            const backdrop = document.getElementById(`${id}-backdrop`);
                            const closeBtn = document.getElementById(`${id}-close`);
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
                                removeOverlay();
                            });
                            document.addEventListener('keydown', onKeyDown);
                        }}
                    >
                        <img
                            src="https://i.pravatar.cc/100"
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
                                        handleDeleteColumn={handleDeleteColumn}
                                        handleDone={handleDone}
                                        handleDelete={handleDelete}
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
                </DragDropContext>
            </main>
        </>

    );
}

export default Dashboard;