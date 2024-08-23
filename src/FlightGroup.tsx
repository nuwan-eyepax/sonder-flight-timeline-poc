import React, { memo, useEffect, useState } from "react";
import FlightItem from "./BookingItem";
import { FlightItemDefinition } from "./FlightTimeline";
import { useTimelineGridContext } from "./TimelineGridContext";
import { useTimelineContext } from "dnd-timeline";

export interface FlightGroupRowProps {
	children: React.ReactNode;
	id: string;
	flights: {
		id: string;
		groupId: string;
		items: FlightItemDefinition[]
	}[]
}
const FlightGroupRow = (props: FlightGroupRowProps) => {
	const [groupItem, setCreatingItem] = useState<FlightItemDefinition>();
	const { formatPeriod } = useTimelineGridContext();
	const { sidebarWidth } = useTimelineContext()
	useEffect(() => {
		const aggregatedSpan = props.flights.reduce(
			(acc, flight) => {
				flight.items.forEach(item => {
					const { start, end } = item.span;
					if (start < acc.start) acc.start = start;
					if (end > acc.end) acc.end = end;
				});
				return acc;
			},
			{ start: new Date(Infinity).valueOf(), end: new Date(-Infinity).valueOf() }
		);
		setCreatingItem({
			flightId: '',
			groupId: props.id,
			id: '',
			span: aggregatedSpan,
		})
	}, [props.flights, props.id])
	return (<div style={{ display: 'flex', flexDirection: "column" }}>
		Flight Group :{props.id}

		<div style={{ display: 'flex', flexDirection: "row", position: 'relative', paddingLeft: sidebarWidth }}>
			{groupItem && <FlightItem
				id={groupItem.id}
				span={groupItem.span}
				flightGroupId={groupItem.groupId}
				key={groupItem.id}
				isCreating
				delta={formatPeriod}
				flightId={groupItem.flightId} />}
		</div>
		{props.children}
	</div>)
}
export default memo(FlightGroupRow)