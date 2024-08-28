import React from "react";
import { useTimelineContext } from "dnd-timeline";
import Flight from "./FlightRow";
import TimeAxis from "./TimeAxis";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import FlightGroup from "./FlightGroup";
import { Group } from "../utils";
import { useTimelineGridContext } from "./TimelineGridContext";
import { BookingItemDefinition } from "./BookingItem";


export interface FlightTimelineProps {
	groups: Group[],
	isItemDragging: boolean;
	isItemIsResizing: boolean;
	onCreateBookingItem: (item: BookingItemDefinition) => void;
	moveTimeline: (deltaX: number) => void
	handleViewChange: (view: string) => void
}


function CampaignTimeline(props: FlightTimelineProps) {
	const { onCreateBookingItem, isItemDragging, isItemIsResizing, handleViewChange, moveTimeline } = props;
	const { setTimelineRef, style } = useTimelineContext();
	const { formatPeriod, setFormatPeriod } = useTimelineGridContext();
	return (
		<div>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<div>
					<button onClick={() => handleViewChange('week')}>Week</button>
					<button onClick={() => handleViewChange('month')}>Month</button>
					<button onClick={() => handleViewChange('quarter')}>Quarter</button>
				</div>
				<div>
					<button onClick={() => setFormatPeriod(1)}> 1 Day</button>
					<button onClick={() => setFormatPeriod(0.5)}>0.5 Days</button>
					<button onClick={() => setFormatPeriod(2)}> 2 Days</button>
				</div>
				<div>
					<button onClick={() => moveTimeline(-formatPeriod)}>{`<<`}</button>
					<button onClick={() => moveTimeline(+formatPeriod)}>{`>>`}</button>
				</div>
			</div>

			<TimeAxis />

			<div ref={setTimelineRef} style={{ ...style }}>
				{props.groups.map((group) => (
					<FlightGroup id={group.id} key={group.id} flights={group.flights}>
						<SortableContext items={group.flights.map(({ id }) => id)} strategy={verticalListSortingStrategy}>
							{group.flights.map((flight) => (
								<Flight
									id={flight.id}
									key={flight.id}
									groupId={flight.groupId}
									onCreateBookingItem={onCreateBookingItem}
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

export default CampaignTimeline;
