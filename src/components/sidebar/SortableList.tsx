"use client";

import { useCallback, type CSSProperties, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

interface SortableItem {
  id: string;
}

interface SortableListProps<T extends SortableItem> {
  /** Unique list key — required if multiple SortableLists exist on the page */
  droppableId: string;
  items: T[];
  /** Called after a successful drag-and-drop reorder */
  onReorder: (fromIndex: number, toIndex: number) => void;
  /** Render each item. Receives the item, its index, and DnD binding props. */
  renderItem: (item: T, index: number, provided: { dragHandleProps?: object; isDragging: boolean }) => ReactNode;
  className?: string;
}

/**
 * SortableList — wraps items in @hello-pangea/dnd with framer-motion layout
 * animations so items smoothly slide into position after reorder.
 */
export function SortableList<T extends SortableItem>({
  droppableId,
  items,
  onReorder,
  renderItem,
  className,
}: SortableListProps<T>) {
  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (
        !result.destination ||
        result.source.index === result.destination.index
      ) {
        return;
      }
      onReorder(result.source.index, result.destination.index);
    },
    [onReorder]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "space-y-2 rounded-lg transition-colors duration-200",
              snapshot.isDraggingOver
                ? "bg-primary/5 ring-1 ring-primary/10 ring-inset"
                : "",
              className
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(dragProvided, dragSnapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      style={dragProvided.draggableProps.style as CSSProperties | undefined}
                    >
                      {renderItem(item, index, {
                        dragHandleProps: dragProvided.dragHandleProps ?? undefined,
                        isDragging: dragSnapshot.isDragging,
                      })}
                    </div>
                  )}
                </Draggable>
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
