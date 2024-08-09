import React, { useMemo } from "react";
import { useTimelineContext } from "dnd-timeline";
import FlightItem from "./FlightItem";
import Flight from "./Flight";
import Sidebar from "./Sidebar";
import TimeAxis from "./TimeAxis";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FlightGroup } from "./FlightGroup";
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
	}[]
}


function FlightTimeline(props: FlightTimelineProps) {
	const { setTimelineRef, style, range } = useTimelineContext();

	return (
		<div>
			<TimeAxis markers={timeAxisMarkers} />
			<div ref={setTimelineRef} style={style}>
				{props.groups.map((group) => (
					<FlightGroup id={group.id} key={group.id}>
						<SortableContext items={group.flights.map(({ id }) => id)} strategy={verticalListSortingStrategy}>
							{group.flights.map((flight) => (
								<Flight id={flight.id} key={flight.id} sidebar={<Sidebar row={flight}  groupId={flight.groupId}/>}>

									{flight.items.map((item) => (
										<FlightItem id={item.id} key={item.id} span={item.span} groupId={flight.groupId}>
											{`FlightItem ${item.id}`}
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
