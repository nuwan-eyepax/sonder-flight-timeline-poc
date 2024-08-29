import React, { useCallback, useState } from "react";
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import type { DragEndEvent, Range, ResizeEndEvent } from "dnd-timeline";
import { TimelineContext } from "dnd-timeline";
import Timeline from "../components/FlightTimeline";
import { generateRows, isOverlapping, timeAxisMarkers } from "../utils";
import { Modifier } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { TimelineGridProvider } from "../components/TimelineGridContext";
import { TimelineItemDefinition } from "../components/TimelineItem";

const restrictFlightControl: Modifier = ({ active, ...rest }) => {
    const activeItemType = active?.data.current?.type as string;

    if (activeItemType === 'TIMELINE_ITEM') {
        return restrictToHorizontalAxis({ ...rest, active })
    }
    return rest.transform
}
const now = new Date()
const DEFAULT_RANGE: Range = {
    start: startOfMonth(now).getTime(),
    end: endOfMonth(now).getTime(),
};
const rows = generateRows(1, '');


function FlightTimelinePage() {
    const [range, setRange] = useState(DEFAULT_RANGE);
    const [row, setRow] = useState(rows[0]);
    const [isItemResizing, setIsItemResizing] = useState(false);
    const [isItemDragging, setIsItemDragging] = useState(false);
    const [view, setView] = useState('week');

    const onResizeStart = () => {
        setIsItemResizing(true);
    };

    const onDragStart = () => {
        setIsItemDragging(true)
    }

    const onResizeEnd = useCallback((event: ResizeEndEvent) => {
        const updatedSpan =
            event.active.data.current.getSpanFromResizeEvent?.(event);
        if (!updatedSpan)
            return;
        const timelineGridDelta = event.active.data.current.timelineGridDelta as number;
        const modifiedSpan = {
            start: Math.floor(updatedSpan?.start / timelineGridDelta) * timelineGridDelta,
            end: Math.ceil(updatedSpan?.end / timelineGridDelta) * timelineGridDelta
        }
        const activeItemId = event.active.id;
        const activeItemType = event.active.data.current.type as string;
        if (updatedSpan && activeItemType === 'TIMELINE_ITEM') {
            setRow((row) => {
                return {
                    ...row,
                    items: row.items.map((item) => {
                        if (item.id !== activeItemId) return item;
                        return {
                            ...item,
                            span: modifiedSpan,
                        };
                    })
                }
            });
        }
        setIsItemResizing(false);
    }, []);

    const onDragEnd = useCallback((event: DragEndEvent) => {
        const overedId = event.over?.id as string;
        if (!overedId) return;
        const activeId = event.active.id;
        const activeItemType = event.active.data.current.type as string;
        if (activeItemType === 'TIMELINE_ITEM') {
            const timelineGridDelta = event.active.data.current.timelineGridDelta as number;
            const updatedSpan = event.active.data.current.getSpanFromDragEvent?.(event);
            if (!updatedSpan) {
                return;
            }
            const modifiedSpan = {
                start: Math.round(updatedSpan.start / timelineGridDelta) * timelineGridDelta,
                end: Math.round(updatedSpan.end / timelineGridDelta) * timelineGridDelta
            }
            setRow((row) => {
                const currentFlightSpans = row.items.filter(({ id }) => activeId !== id).map(({ span }) => span);
                return {
                    ...row,
                    items: row.items.map((item) => {
                        if (item.id !== activeId)
                            return item;
                        if (item.id === activeId && isOverlapping(updatedSpan, currentFlightSpans))
                            return item
                        return {
                            ...item,
                            span: modifiedSpan,
                        };

                    })
                }

            });
        }
        setIsItemDragging(false)
    }, []);

    const onChangeView = useCallback((view: string) => {
        const start = new Date(range.start);
        // const end = new Date(range.end);

        if (view === 'quarter') {
            setRange({
                start: startOfDay(start).getTime(),
                end: endOfDay(start.setMonth(start.getMonth() + 3)).getTime(),
            })
        }
        if (view === 'month') {
            setRange({
                start: startOfDay(start).getTime(),
                end: endOfDay(start.setMonth(start.getMonth() + 1)).getTime(),
            })
        }
        if (view === 'week') {
            setRange({
                start: startOfDay(start).getTime(),
                end: endOfDay(start.setDate(start.getDate() + 7)).getTime(),
            })
        }
    }, [range]);

    const onCreateTimelineItem = useCallback(({ id, rowId, groupId, span }: TimelineItemDefinition) => {
        setRow((row) => {
            const itemIndex = row.items.findIndex((item) => item.id === id);
            const newItem = {
                rowId: rowId,
                id: id,
                span: span,
                isCreating: false,
                groupId
            }
            if (itemIndex === -1) {
                row.items.push(newItem)

            } else {
                row.items[itemIndex] = newItem;
            }
            return row
        });
    }, []);

    const handleViewChange = (newView: string) => {
        setView(newView);
        onChangeView(newView)
    };

    const moveTimeline = (deltaX: number) => {
        setRange((prev) => {
            return {
                start: prev.start + deltaX,
                end: prev.end + deltaX
            }
        })
    }
    return (
        <TimelineContext
            range={range}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onResizeEnd={onResizeEnd}
            onResizeStart={onResizeStart}
            onRangeChanged={setRange}
            modifiers={[restrictFlightControl]}
            resizeHandleWidth={20}
            usePanStrategy={undefined} // this is a hack to disable default pan strategy, please revise
            overlayed={false}
        >
            <TimelineGridProvider markerDefinitions={timeAxisMarkers[view]}>
                <Timeline
                    row={row}
                    isItemDragging={isItemDragging}
                    isItemIsResizing={isItemResizing}
                    onCreateTimelineItem={onCreateTimelineItem}
                    handleViewChange={handleViewChange}
                    moveTimeline={moveTimeline}
                />
            </TimelineGridProvider>


        </TimelineContext>
    );
}

export default FlightTimelinePage;
