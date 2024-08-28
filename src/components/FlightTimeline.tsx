import React from "react";
import { useTimelineContext } from "dnd-timeline";
import Flight from "./FlightRow";
import TimeAxis from "./TimeAxis";
import { useTimelineGridContext } from "./TimelineGridContext";
import { BookingItemDefinition } from "./BookingItem";


export interface FlightTimelineProps {
	flight: {
		id: string;
		groupId: string;
		items: BookingItemDefinition[];
	},
	isItemDragging: boolean;
	isItemIsResizing: boolean;
	onCreateBookingItem: (item: BookingItemDefinition) => void;
	moveTimeline: (deltaX: number) => void
	handleViewChange: (view: string) => void
}


function FlightTimeline(props: FlightTimelineProps) {
	const { onCreateBookingItem, isItemDragging, isItemIsResizing, handleViewChange, moveTimeline, flight } = props;
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
				<Flight
					id={flight.id}
					key={flight.id}
					groupId={'group'}
					onCreateBookingItem={onCreateBookingItem}
					items={flight.items}
					isUpdating={isItemDragging || isItemIsResizing}
				/>
			</div>
		</div>

	);
}

export default FlightTimeline;
