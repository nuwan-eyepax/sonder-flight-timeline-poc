import React, { useCallback, useState } from "react";
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import type { DragEndEvent, Range, ResizeEndEvent } from "dnd-timeline";
import { TimelineContext } from "dnd-timeline";
import Timeline from "../components/FlightTimeline";
import { generateFlights, generateGroups, isOverlapping, timeAxisMarkers } from "../utils";
import { arrayMove } from "@dnd-kit/sortable";
import { Modifier } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { TimelineGridProvider } from "../components/TimelineGridContext";
import { BookingItemDefinition } from "../components/BookingItem";

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
const initFlights = generateFlights(1, '', DEFAULT_RANGE);
function FlightTimelinePage() {
    const [range, setRange] = useState(DEFAULT_RANGE);
    const [flight, setFlight] = useState(initFlights[0]);
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
            setFlight((flight) => {
                return {
                    ...flight,
                    items: flight.items.map((item) => {
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
            setFlight((flight) => {
                const currentFlightSpans = flight.items.filter(({ id }) => activeId !== id).map(({ span }) => span);
                return {
                    ...flight,
                    items: flight.items.map((item) => {
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

    const onCreateBookingItem = useCallback(({ id, flightId, groupId, span }: BookingItemDefinition) => {
        setFlight((flight) => {
            const itemIndex = flight.items.findIndex((item) => item.id === id);
            const newItem = {
                flightId: flightId,
                id: id,
                span: span,
                isCreating: false,
                groupId
            }
            if (itemIndex === -1) {
                flight.items.push(newItem)

            } else {
                flight.items[itemIndex] = newItem;
            }
            return flight
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
                    flight={flight}
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

export default FlightTimelinePage;
