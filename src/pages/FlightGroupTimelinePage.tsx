import React, { useCallback, useState } from "react";
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import type { DragEndEvent, Range, ResizeEndEvent } from "dnd-timeline";
import { TimelineContext } from "dnd-timeline";
import Timeline from "../components/FlightGroupTimeline";
import { generateGroups, isOverlapping, timeAxisMarkers } from "../utils";
import { arrayMove } from "@dnd-kit/sortable";
import { Modifier } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { TimelineGridProvider } from "../components/TimelineGridContext";
import { TimelineItemDefinition } from "../components/TimelineItem";

const restrictFlightControl: Modifier = ({ active, ...rest }) => {
    const activeItemType = active?.data.current?.type as string;

    if (activeItemType === 'BOOKING_ITEM') {
        return restrictToHorizontalAxis({ ...rest, active })
    }
    return rest.transform
}
const now = new Date()
const DEFAULT_RANGE: Range = {
    start: startOfMonth(now).getTime(),
    end: endOfMonth(now).getTime(),
};
const initGroups = generateGroups(1, DEFAULT_RANGE);
function FlightGroupTimelinePage() {
    const [range, setRange] = useState(DEFAULT_RANGE);
    const [group, setGroup] = useState(initGroups[0]);
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
        const formatPeriod = event.active.data.current.formatPeriod as number;
        const modifiedSpan = {
            start: Math.floor(updatedSpan?.start / formatPeriod) * formatPeriod,
            end: Math.ceil(updatedSpan?.end / formatPeriod) * formatPeriod
        }
        const activeItemId = event.active.id;
        const activeItemType = event.active.data.current.type as string;
        if (updatedSpan && activeItemType === 'BOOKING_ITEM') {
            setGroup((group) => {
                group.rows = group.rows.map((row) => {
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

                })
                return group
            });
        }
        setIsItemResizing(false);
    }, []);

    const onDragEnd = useCallback((event: DragEndEvent) => {
        const overedId = event.over?.id as string;
        if (!overedId) return;
        const activeId = event.active.id;
        const activeItemType = event.active.data.current.type as string;
        if (activeItemType === 'BOOKING_ITEM') {
            const formatPeriod = event.active.data.current.formatPeriod as number;
            const updatedSpan = event.active.data.current.getSpanFromDragEvent?.(event);
            if (!updatedSpan) {
                return;
            }
            const modifiedSpan = {
                start: Math.round(updatedSpan.start / formatPeriod) * formatPeriod,
                end: Math.round(updatedSpan.end / formatPeriod) * formatPeriod
            }
            setGroup((group) => {
                group.rows = group.rows.map((row) => {
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

                })
                return group
            });
        }
        if (activeItemType === 'FLIGHT_SIDE_BAR') {
            setGroup((group) => {
                const oldIndex = group.rows.findIndex((row) => row.id === activeId);
                const newIndex = group.rows.findIndex((row) => row.id === overedId);
                group.rows = arrayMove(group.rows, oldIndex, newIndex);
                return group
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

    const onCreateBookingItem = useCallback(({ id, rowId, groupId, span }: TimelineItemDefinition) => {
        setGroup((group) => {
            const rowIndex = group.rows.findIndex((row) => row.id === rowId);
            const itemIndex = group.rows[rowIndex].items.findIndex((item) => item.id === id);
            const newItem = {
                rowId: rowId,
                id: id,
                span: span,
                isCreating: false,
                groupId
            }
            if (itemIndex === -1) {
                group.rows[rowIndex].items.push(newItem)

            } else {
                group.rows[rowIndex].items[itemIndex] = newItem;
            }
            return group
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
                    group={group}
                    isItemDragging={isItemDragging}
                    isItemIsResizing={isItemResizing}
                    onCreateBookingItem={onCreateBookingItem}
                    handleViewChange={handleViewChange}
                    moveTimeline={moveTimeline}
                />
            </TimelineGridProvider>


        </TimelineContext>
    );
}

export default FlightGroupTimelinePage;
