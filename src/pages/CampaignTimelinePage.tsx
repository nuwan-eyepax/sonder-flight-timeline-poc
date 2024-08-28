import React, { useCallback, useState } from "react";
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import type { DragEndEvent, Range, ResizeEndEvent } from "dnd-timeline";
import { TimelineContext } from "dnd-timeline";
import Timeline from "../components/CampaignTimeline";
import { generateGroups, isOverlapping, timeAxisMarkers } from "../utils";
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
const initGroups = generateGroups(3, DEFAULT_RANGE);
function CampaignTimelinePage() {
	const [range, setRange] = useState(DEFAULT_RANGE);
	const [groups, setGroups] = useState(initGroups);
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
		const groupId = event.active.data.current.flightGroupId;
		const activeItemType = event.active.data.current.type as string;
		if (updatedSpan && activeItemType === 'BOOKING_ITEM') {
			setGroups((prev) => {
				const groups = [...prev]
				const groupIndex = groups.findIndex((group) => group.id === groupId);
				groups[groupIndex].flights = groups[groupIndex].flights.map((flight) => {
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

				})
				return groups
			});
		}
		setIsItemResizing(false);
	}, []);

	const onDragEnd = useCallback((event: DragEndEvent) => {
		const overedId = event.over?.id as string;
		if (!overedId) return;
		const activeId = event.active.id;
		const activeItemType = event.active.data.current.type as string;
		const groupId = event.active.data.current.flightGroupId;
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
			setGroups((prev) => {
				const groups = [...prev]
				const groupIndex = groups.findIndex((group) => group.id === groupId);
				groups[groupIndex].flights = groups[groupIndex].flights.map((flight) => {
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

				})
				return groups
			});
		}
		if (activeItemType === 'FLIGHT_SIDE_BAR') {
			setGroups((prev) => {
				const groups = [...prev]
				const groupIndex = groups.findIndex((group) => group.id === groupId);
				const oldIndex = groups[groupIndex].flights.findIndex((flight) => flight.id === activeId);
				const newIndex = groups[groupIndex].flights.findIndex((flight) => flight.id === overedId);
				groups[groupIndex].flights = arrayMove(groups[groupIndex].flights, oldIndex, newIndex);
				return groups
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
		setGroups((prev) => {
			const groups = [...prev]
			const groupIndex = groups.findIndex((group) => group.id === groupId);
			const flightIndex = groups[groupIndex].flights.findIndex((flight) => flight.id === flightId);
			const itemIndex = groups[groupIndex].flights[flightIndex].items.findIndex((item) => item.id === id);
			const newItem = {
				flightId: flightId,
				id: id,
				span: span,
				isCreating: false,
				groupId
			}
			if (itemIndex === -1) {
				groups[groupIndex].flights[flightIndex].items.push(newItem)

			} else {
				groups[groupIndex].flights[flightIndex].items[itemIndex] = newItem;
			}
			return groups
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
					groups={groups}
					onCreateBookingItem={onCreateBookingItem}
					handleViewChange={handleViewChange}
					isItemDragging={isItemDragging}
					isItemIsResizing={isItemResizing}
					moveTimeline={moveTimeline}
				/>
			</TimelineGridProvider>


		</TimelineContext>
	);
}

export default CampaignTimelinePage;
