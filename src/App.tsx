import "./index.css";
import { endOfDay, startOfDay } from "date-fns";
import type { DragEndEvent, Range, ResizeEndEvent } from "dnd-timeline";
import { TimelineContext } from "dnd-timeline";
import React, { useCallback, useState } from "react";
import Timeline from "./FlightTimeline";
import { generateGroups, ItemType } from "./utils";
import { arrayMove } from "@dnd-kit/sortable";

const DEFAULT_RANGE: Range = {
	start: startOfDay(new Date(2024, 1, 1)).getTime(),
	end: endOfDay(new Date(2024, 3, 31)).getTime(),
};

function App() {
	const [range, setRange] = useState(DEFAULT_RANGE);
	const [groups, setGroups] = useState(generateGroups(3, range));

	const onResizeEnd = useCallback((event: ResizeEndEvent) => {
		const updatedSpan =
			event.active.data.current.getSpanFromResizeEvent?.(event);

		if (!updatedSpan) return;

		const activeItemId = event.active.id;
		console.log(event)
		// setItems((prev) =>
		// 	prev.map((item) => {
		// 		if (item.id !== activeItemId) return item;

		// 		return {
		// 			...item,
		// 			span: updatedSpan,
		// 		};
		// 	}),
		// );
	}, []);

	const onDragEnd = useCallback((event: DragEndEvent) => {
		console.log(event)
		const overedId = event.over?.id as string;

		if (!overedId) return;

		const activeId = event.active.id;
		const activeItemType = event.active.data.current.type as ItemType;

		const updatedSpan = event.active.data.current.getSpanFromDragEvent?.(event);

		if (updatedSpan && activeItemType === ItemType.ListItem) {
			// setItems((prev) =>
			// 	prev.map((item) => {
			// 		if (item.id !== activeId) return item;

			// 		return {
			// 			...item,
			// 			rowId: overedId,
			// 			span: updatedSpan,
			// 		};
			// 	}),
			// );
		} else if (activeItemType === ItemType.SidebarItem) {
			const groupId = event.active.data.current.groupId;
			setGroups((prev) => {
				const groups = [...prev]
				const groupIndex = groups.findIndex((group) => group.id === groupId);
				const oldIndex = groups[groupIndex].flights.findIndex((flight) => flight.id === activeId);
				const newIndex = groups[groupIndex].flights.findIndex((flight) => flight.id === overedId);
				console.log('called', oldIndex, newIndex, groups)
				groups[groupIndex].flights = arrayMove(groups[groupIndex].flights, oldIndex, newIndex);
				return groups
			});
		}
	}, []);

	return (
		<TimelineContext
			range={range}
			onDragEnd={onDragEnd}
			onResizeEnd={onResizeEnd}
			onRangeChanged={setRange}
		>
			<Timeline groups={groups} />
		</TimelineContext>
	);
}

export default App;
