import React from "react";
import { CircleX } from "lucide-react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { TaskItem } from "./TaskItem";

type Item = { id: string; title: string; content?: string | null; createdAt?: string | Date; done?: boolean };
type ColumnType = { name: string; items: Item[] };

interface ColumnProps {
    colId: string;
    col: ColumnType;
    idx: number;
    onRequestDeleteColumn: (colId: string, colName?: string) => void;
    handleDone: (colId: string, itemId: string) => void;
    handleDelete: (colId: string, itemId: string) => void;
    onEdit?: (item: any, colId: string) => void;
}

export function Column({
    colId,
    col,
    idx,
    onRequestDeleteColumn,
    handleDone,
    handleDelete
    , onEdit
}: ColumnProps) {
    return (
        <Draggable draggableId={colId} index={idx}>
            {(provided, snapshot) => {
                const providedStyle = (provided.draggableProps.style as React.CSSProperties) || {};
                const combinedTransform = providedStyle.transform
                    ? `${providedStyle.transform} ${snapshot.isDragging ? " scale(1.03)" : ""}`
                    : snapshot.isDragging
                    ? "scale(1.03)"
                    : undefined;

                const containerStyle: React.CSSProperties = {
                    ...providedStyle,
                    transform: combinedTransform,
                    maxHeight: 400,
                    overflowY: "auto",
                    transition: "transform 180ms cubic-bezier(.2,.9,.2,1), box-shadow 180ms ease",
                    boxShadow: snapshot.isDragging ? "0 12px 30px rgba(59,130,246,0.18)" : undefined,
                    zIndex: snapshot.isDragging ? 999 : undefined
                };

                return (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-neutral-100 rounded-lg shadow min-w-[85vw] sm:min-w-[260px] sm:w-80 w-full p-2 sm:p-4 flex flex-col"
                        style={containerStyle}
                    >
                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <h2
                                className="font-bold text-indigo-800 text-base sm:text-lg cursor-move"
                                {...provided.dragHandleProps}
                            >
                                {col.name}
                            </h2>
                            <button
                                title="Excluir coluna"
                                onClick={() => onRequestDeleteColumn(colId, col.name)}
                                className="p-1 rounded hover:bg-red-200 transition cursor-pointer"
                            >
                                <CircleX className="w-5 h-5 text-red-500" />
                            </button>
                        </div>

                        <Droppable droppableId={colId} type="TASK">
                            {(providedDroppable) => (
                                <div
                                    ref={providedDroppable.innerRef}
                                    {...providedDroppable.droppableProps}
                                    style={{ minHeight: 48 }}
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
                                            onEdit={onEdit}
                                        />
                                    ))}

                                    {providedDroppable.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                );
            }}
        </Draggable>
    );
}