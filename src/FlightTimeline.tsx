import React, { useState } from "react";
import { Span, useTimelineContext, ItemDefinition } from "dnd-timeline";
import FlightItem from "./FlightItem";
import Flight from "./Flight";
import TimeAxis from "./TimeAxis";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import FlightGroup from "./FlightGroup";
import { Group, timeAxisMarkers } from "./utils";


export interface FlightTimelineProps {
	groups: Group[],
	onChangeView: (view: string) => void
	onCreateFlightItem: (item: FlightItemDefinition) => void
	onRemoveFlightItem: (item: FlightItemDefinition) => void
}

export type FlightItemDefinition = Omit<ItemDefinition, 'rowId'> & { groupId: string, flightId: string };

function FlightTimeline(props: FlightTimelineProps) {
	const { onChangeView, onCreateFlightItem, onRemoveFlightItem } = props;
	const { setTimelineRef, style } = useTimelineContext();
	const [view, setView] = useState('week'); // Default to week view
	const handleViewChange = (newView: string) => {
		setView(newView);
		onChangeView(newView)
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
								<Flight
									id={flight.id}
									key={flight.id}
									groupId={flight.groupId}
									markers={timeAxisMarkers[view]}
									onCreateFlightItem={onCreateFlightItem}
									onRemoveFlightItem={onRemoveFlightItem}
								>
									{flight.items.map((item) => (
										<FlightItem id={item.id} key={item.id} span={item.span} groupId={flight.groupId} isCreating={item.isCreating}>
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
