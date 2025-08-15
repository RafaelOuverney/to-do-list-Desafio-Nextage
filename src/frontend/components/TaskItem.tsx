import { CheckCircle, Trash2Icon } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";

type Item = { id: string; content: string; done?: boolean };

interface TaskItemProps {
    item: Item;
    idx: number;
    colId: string;
    handleDone: (colId: string, itemId: string) => void;
    handleDelete: (colId: string, itemId: string) => void;
}

export function TaskItem({ item, idx, colId, handleDone, handleDelete }: TaskItemProps) {
    return (
        <Draggable draggableId={item.id} index={idx}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`p-2 sm:p-3 mb-2 sm:mb-3 rounded shadow cursor-move text-sm sm:text-base flex items-center justify-between ${
                        item.done
                            ? "bg-gray-700 text-gray-300 line-through"
                            : "bg-white text-black"
                    } ${snapshot.isDragging ? "bg-indigo-100" : ""}`}
                >
                    <span className="flex-1">{item.content}</span>
                    <div className="flex gap-2 ml-2">
                        <button
                            title={item.done ? "Desmarcar como concluída" : "Concluir"}
                            onClick={() => handleDone(colId, item.id)}
                            className="p-1 rounded hover:bg-indigo-200 transition"
                        >
                            <CheckCircle className={`w-5 h-5 ${item.done ? "text-green-600" : "text-gray-400"}`} />
                        </button>
                        <button
                            title="Excluir"
                            onClick={() => handleDelete(colId, item.id)}
                            className="p-1 rounded hover:bg-red-200 transition"
                        >
                            <Trash2Icon className="w-5 h-5 text-red-500" />
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
}