import React, { useEffect, useMemo, useState } from "react";
import { groupItemsToRows, groupItemsToSubrows, Span, Range, useTimelineContext } from "dnd-timeline";
import FlightItem from "./FlightItem";
import Flight from "./Flight";
import Sidebar from "./Sidebar";
import TimeAxis from "./TimeAxis";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import FlightGroup from "./FlightGroup";
import { timeAxisMarkers } from "./utils";

interface FlightTimelineProps {
	groups: {
		id: string;
		flights: {
			id: string;
			groupId: string;
			items: {
				id: string;
				flightId: string;
				span: any
			}[]
		}[]
	}[],
	onChangeView: (view: string) => void
}

const findItemSpanWithinRange = (itemSpan: Span, range: Range): Span | null => {
	const { start: itemStart, end: itemEnd } = itemSpan;
	const { start: rangeStart, end: rangeEnd } = range;

	// Check if the item's span is completely outside the range
	if (itemEnd <= rangeStart || itemStart >= rangeEnd) {
		return null; // The item is outside the range
	}

	// Calculate the overlap
	const start = Math.max(itemStart, rangeStart);
	const end = Math.min(itemEnd, rangeEnd);

	return { start, end };
};

function FlightTimeline(props: FlightTimelineProps) {
	const { setTimelineRef, style, range } = useTimelineContext();
	const [view, setView] = useState('quarter'); // Default to week view

	const handleViewChange = (newView: string) => {
		setView(newView);
		props.onChangeView(newView)
	};
	return (
		<div>
			<div>
				<button onClick={() => handleViewChange('week')}>Week</button>
				<button onClick={() => handleViewChange('month')}>Month</button>
				<button onClick={() => handleViewChange('quarter')}>Quarter</button>
			</div>
			<TimeAxis markers={timeAxisMarkers[view]} />
			<div ref={setTimelineRef} style={style}>
				{props.groups.map((group) => (
					<FlightGroup id={group.id} key={group.id}>
						<SortableContext items={group.flights.map(({ id }) => id)} strategy={verticalListSortingStrategy}>
							{group.flights.map((flight) => (
								<Flight id={flight.id} key={flight.id} sidebar={<Sidebar row={flight} groupId={flight.groupId} />}>

									{flight.items.map((item) => (
										<FlightItem id={item.id} key={item.id} span={item.span} groupId={flight.groupId}>
											<div style={{ textAlign: 'center' }}>
												<span style={{ marginRight: "10px" }}>
													{new Date((item.span as Span).start).toLocaleDateString()}
												</span>

												<span>
													{new Date((item.span as Span).end).toLocaleDateString()}
												</span>
											</div>
										</FlightItem>
									))}

								</Flight>
							))}
						</SortableContext>

					</FlightGroup>
				))}
			</div>
		</div>

	);
}

export default FlightTimeline;
