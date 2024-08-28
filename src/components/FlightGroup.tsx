import React, { memo, useEffect, useState } from "react";
import { useTimelineGridContext } from "./TimelineGridContext";
import { Span, useTimelineContext } from "dnd-timeline";
import BookingItem, { BookingItemDefinition } from "./BookingItem";

type GroupItemDefinition = Omit<BookingItemDefinition, 'flightId'>;
export interface FlightGroupRowProps {
	children: React.ReactNode;
	id: string;
	flights: {
		id: string;
		groupId: string;
		items: BookingItemDefinition[]
	}[]
}
const FlightGroupRow = (props: FlightGroupRowProps) => {
	const [groupItem, setGroupItem] = useState<GroupItemDefinition>();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const { formatPeriod } = useTimelineGridContext();
	const { sidebarWidth, range, pixelsToValue } = useTimelineContext();
	const handleCollapse = () => {
		setIsCollapsed((isCollapsed) => (!isCollapsed))
	}
	useEffect(() => {
		let aggregatedSpan: Span = {
			start: 0,
			end: 0
		};
		for (let i = 0; i < props.flights.length; i++) {
			let flight = props.flights[i];

			for (let j = 0; j < flight.items.length; j++) {
				let item = flight.items[j];
				let { start, end } = item.span;
				if (aggregatedSpan.start === 0 || start < aggregatedSpan.start) {
					aggregatedSpan.start = start;
				}
				if (aggregatedSpan.end === 0 || end > aggregatedSpan.end) {
					aggregatedSpan.end = end;
				}
			}
		}
		setGroupItem({
			groupId: props.id,
			span: {
				start: aggregatedSpan.start + pixelsToValue(sidebarWidth),
				end: aggregatedSpan.end + pixelsToValue(sidebarWidth)

			},
			id: `flight-group-${props.id}`
		})
	}, [pixelsToValue, props.flights, props.id, range, sidebarWidth]);

	return (<div style={{ display: 'flex', flexDirection: "column" }}>
		<div style={{
			display: 'flex',
			flexDirection: "row",
			position: 'relative',
			backgroundColor: 'gray',
			width: '100%',
			height: '40px',
		}}
		>
			<div style={{
				width: sidebarWidth,
				background: 'gray',
				cursor: 'pointer',
				border: "1px solid",
				marginBottom: "1px"
			}}
				onClick={handleCollapse}>
				Flight Group :{props.id}
			</div>
			{groupItem && <BookingItem
				id={groupItem.id}
				span={groupItem.span}
				flightGroupId={groupItem.groupId}
				formatPeriod={formatPeriod}
				disabled
			/>}

		</div>
		{isCollapsed ? null : props.children}
	</div >)
}
export default memo(FlightGroupRow)