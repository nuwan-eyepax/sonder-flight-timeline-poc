import React from "react";
import { useTimelineContext, ItemDefinition } from "dnd-timeline";
import Flight from "./FlightRow";
import TimeAxis, { MarkerDefinition } from "./TimeAxis";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import FlightGroup from "./FlightGroup";
import { Group } from "./utils";
import { useTimelineGridContext } from "./TimelineGridContext";


export interface FlightTimelineProps {
	groups: Group[],
	isItemDragging: boolean;
	isItemIsResizing: boolean;
	markers: MarkerDefinition[];
	onCreateFlightItem: (item: FlightItemDefinition) => void;
	moveTimeline: (deltaX: number) => void
	handleViewChange: (view: string) => void
}

export type FlightItemDefinition = Omit<ItemDefinition, 'rowId'> & { groupId: string, flightId: string };

function FlightTimeline(props: FlightTimelineProps) {
	const { onCreateFlightItem, isItemDragging, isItemIsResizing, markers, handleViewChange, moveTimeline} = props;
	const { setTimelineRef, style } = useTimelineContext();
	const { delta } = useTimelineGridContext();
	return (
		<div>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<div>
					<button onClick={() => handleViewChange('week')}>Week</button>
					<button onClick={() => handleViewChange('month')}>Month</button>
					<button onClick={() => handleViewChange('quarter')}>Quarter</button>
				</div>
				<div>
					<button onClick={() => moveTimeline(-delta)}>{`<<`}</button>
					<button onClick={() => moveTimeline(+delta)}>{`>>`}</button>
				</div>
			</div>

			<TimeAxis markers={markers} />
			
			<div ref={setTimelineRef} style={{...style}}>
				{props.groups.map((group) => (
					<FlightGroup id={group.id} key={group.id}>
						<SortableContext items={group.flights.map(({ id }) => id)} strategy={verticalListSortingStrategy}>
							{group.flights.map((flight) => (
								<Flight
									id={flight.id}
									key={flight.id}
									groupId={flight.groupId}
									markers={markers}
									onCreateFlightItem={onCreateFlightItem}
									items={flight.items}
									isUpdating={isItemDragging || isItemIsResizing}
								/>
							))}
						</SortableContext>

					</FlightGroup>
				))}
			</div>
		</div>

	);
}

export default FlightTimeline;
