import "./index.css";
import { endOfDay, startOfDay } from "date-fns";
import type { DragEndEvent, Range, ResizeEndEvent } from "dnd-timeline";
import { TimelineContext } from "dnd-timeline";
import React, { useCallback, useEffect, useState } from "react";
import Timeline from "./FlightTimeline";
import { generateGroups, isOverlapping, ItemType, roundToNearestDay } from "./utils";
import { arrayMove } from "@dnd-kit/sortable";
import { Modifier } from "@dnd-kit/core";
import { restrictToHorizontalAxis, restrictToVerticalAxis } from "@dnd-kit/modifiers";

const restrictFlightControl: Modifier = ({ active, ...rest }) => {
	const activeItemType = active?.data.current?.type as ItemType;

	// if (activeItemType === ItemType.SidebarItem) {
	// 	return restrictToVerticalAxis({ ...rest, active })
	// }
	if (activeItemType === ItemType.ListItem) {
		return restrictToHorizontalAxis({ ...rest, active })
	}
	return rest.transform
}
const now = new Date()
const DEFAULT_RANGE: Range = {
	start: startOfDay(now).valueOf(),
	end: endOfDay(now.setMonth(now.getMonth() + 3)).valueOf(),
};
export function useDebounce<T>(value: T, delay = 500) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

const initGroups = generateGroups(3, DEFAULT_RANGE);

function App() {
	const [range, setRange] = useState(DEFAULT_RANGE);
	const [groups, setGroups] = useState(initGroups);

	const onResizeEnd = useCallback((event: ResizeEndEvent) => {
		const updatedSpan =
			event.active.data.current.getSpanFromResizeEvent?.(event);
		if (!updatedSpan) return;
		const activeItemId = event.active.id;
		const groupId = event.active.data.current.groupId;
		const activeItemType = event.active.data.current.type as ItemType;
		if (updatedSpan && activeItemType === ItemType.ListItem) {
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
								span: {
									start: roundToNearestDay(updatedSpan.start),
									end: roundToNearestDay(updatedSpan.end)
								},
							};
						})
					}

				})
				return groups
			});
		}
	}, []);

	const onDragEnd = useCallback((event: DragEndEvent) => {
		const overedId = event.over?.id as string;
		if (!overedId) return;
		const activeId = event.active.id;
		const activeItemType = event.active.data.current.type as ItemType;
		const updatedSpan = event.active.data.current.getSpanFromDragEvent?.(event);
		const groupId = event.active.data.current.groupId;
		if (updatedSpan && activeItemType === ItemType.ListItem) {
			setGroups((prev) => {
				const groups = [...prev]
				const groupIndex = groups.findIndex((group) => group.id === groupId);
				groups[groupIndex].flights = groups[groupIndex].flights.map((flight) => {
					const currentFlightSpans = flight.items.map(({ span }) => span);
					return {
						...flight,
						items: flight.items.map((item) => {
							if (item.id !== activeId)
								return item;
							if (item.id === activeId && isOverlapping(updatedSpan, currentFlightSpans))
								return item
							return {
								...item,
								rowId: overedId,
								span: updatedSpan,
							};

						})
					}

				})
				return groups
			});
		} else if (activeItemType === ItemType.SidebarItem) {
			setGroups((prev) => {
				const groups = [...prev]
				const groupIndex = groups.findIndex((group) => group.id === groupId);
				const oldIndex = groups[groupIndex].flights.findIndex((flight) => flight.id === activeId);
				const newIndex = groups[groupIndex].flights.findIndex((flight) => flight.id === overedId);
				groups[groupIndex].flights = arrayMove(groups[groupIndex].flights, oldIndex, newIndex);
				return groups
			});
		}
	}, []);

	const onChangeView = useCallback((view: string) => {
		const start = new Date(range.start);
		// const end = new Date(range.end);

		if (view === 'quarter') {
			setRange({
				start: startOfDay(start).valueOf(),
				end: endOfDay(start.setMonth(start.getMonth() + 3)).valueOf(),
			})
		}
		if (view === 'month') {
			setRange({
				start: startOfDay(start).valueOf(),
				end: endOfDay(start.setMonth(start.getMonth() + 1)).valueOf(),
			})
		}
		if (view === 'week') {
			setRange({
				start: startOfDay(start).valueOf(),
				end: endOfDay(start.setDate(start.getDate() + 7)).valueOf(),
			})
		}
	}, [range])

	return (
		<TimelineContext
			range={range}
			onDragEnd={onDragEnd}
			onResizeEnd={onResizeEnd}
			onRangeChanged={setRange}
			modifiers={[restrictFlightControl]}
		>
			<Timeline groups={groups} onChangeView={onChangeView} />
		</TimelineContext>
	);
}

export default App;
