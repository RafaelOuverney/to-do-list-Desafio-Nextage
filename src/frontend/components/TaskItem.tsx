import { CheckCircle, Trash2Icon, Edit } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";

type Item = { id: string; title: string; content?: string | null; createdAt?: string | Date; done?: boolean };

interface TaskItemProps {
    item: Item;
    idx: number;
    colId: string;
    handleDone: (colId: string, itemId: string) => void;
    handleDelete: (colId: string, itemId: string) => void;
    onEdit?: (item: Item, colId: string) => void;
}

export function TaskItem({ item, idx, colId, handleDone, handleDelete, onEdit }: TaskItemProps) {
    const created = item.createdAt ? new Date(item.createdAt).toLocaleString() : null;

    return (
        <Draggable draggableId={item.id} index={idx}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`p-3 mb-3 rounded shadow cursor-move text-sm sm:text-base flex flex-col ${
                        item.done ? "bg-gray-700 text-gray-300 line-through" : "bg-white text-black"
                    } ${snapshot.isDragging ? "bg-indigo-100" : ""}`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="font-semibold text-indigo-900 text-base sm:text-lg">{item.title}</div>
                            {item.content ? <div className="text-gray-600 text-sm mt-1">{item.content}</div> : null}
                        </div>
                        <div className="flex flex-col items-end ml-3">
                            {created ? <div className="text-xs text-gray-400">{created}</div> : null}
                            <div className="flex gap-2 mt-2">
                                <button
                                    title={item.done ? "Desmarcar como concluída" : "Concluir"}
                                    onClick={() => handleDone(colId, item.id)}
                                    className="p-1 rounded hover:bg-indigo-200 transition cursor-pointer"
                                >
                                    <CheckCircle className={`w-5 h-5 ${item.done ? "text-green-600" : "text-gray-400"}`} />
                                </button>
                                <button
                                    title="Editar"
                                    onClick={() => onEdit ? onEdit(item, colId) : null}
                                    className="p-1 rounded hover:bg-indigo-200 transition cursor-pointer"
                                >
                                    <Edit className="w-5 h-5 text-gray-600" />
                                </button>
                                <button
                                    title="Excluir"
                                    onClick={() => handleDelete(colId, item.id)}
                                    className="p-1 rounded hover:bg-red-200 transition cursor-pointer"
                                >
                                    <Trash2Icon className="w-5 h-5 text-red-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}