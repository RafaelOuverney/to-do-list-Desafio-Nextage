import { CircleX } from "lucide-react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { TaskItem } from "./TaskItem";

type Item = { id: string; content: string; done?: boolean };
type ColumnType = { name: string; items: Item[] };

interface ColumnProps {
    colId: string;
    col: ColumnType;
    idx: number;
    handleDeleteColumn: (colId: string) => void;
    handleDone: (colId: string, itemId: string) => void;
    handleDelete: (colId: string, itemId: string) => void;
}

export function Column({
    colId,
    col,
    idx,
    handleDeleteColumn,
    handleDone,
    handleDelete
}: ColumnProps) {
    return (
        <Draggable draggableId={colId} index={idx}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="bg-neutral-100 rounded-lg shadow min-w-[85vw] sm:min-w-[260px] sm:w-80 w-full p-2 sm:p-4 flex flex-col"
                    style={{
                        maxHeight: 400,
                        overflowY: "auto"
                    }}
                >
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <h2 className="font-bold text-indigo-800 text-base sm:text-lg" {...provided.dragHandleProps}>
                            {col.name}
                        </h2>
                        <button
                            title="Excluir coluna"
                            onClick={() => handleDeleteColumn(colId)}
                            className="p-1 rounded hover:bg-red-200 transition"
                        >
                            <CircleX className="w-5 h-5 text-red-500" />
                        </button>
                    </div>
                    <Droppable droppableId={colId} type="TASK">
                        {(providedDroppable) => (
                            <div
                                ref={providedDroppable.innerRef}
                                {...providedDroppable.droppableProps}
                                style={{ minHeight: 40 }} // Garante área para drop mesmo vazia
                            >
                                {col.items.length === 0 && (
                                    <div className="text-gray-400 text-center py-4">Arraste uma tarefa aqui</div>
                                )}
                                {col.items.map((item, idx) => (
                                    <TaskItem
                                        key={item.id}
                                        item={item}
                                        idx={idx}
                                        colId={colId}
                                        handleDone={handleDone}
                                        handleDelete={handleDelete}
                                    />
                                ))}
                                {providedDroppable.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            )}
        </Draggable>
    );
}