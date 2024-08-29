import React from "react";
import { useTimelineContext } from "dnd-timeline";
import FlightRow from "./TimelineRow";
import TimeAxis from "./TimeScaleAxis";
import { useTimelineGridContext } from "./TimelineGridContext";
import { TimelineItemDefinition } from "./TimelineItem";


export interface FlightTimelineProps {
	row: {
		id: string;
		groupId: string;
		items: TimelineItemDefinition[];
	},
	isItemDragging: boolean;
	isItemIsResizing: boolean;
	onCreateBookingItem: (item: TimelineItemDefinition) => void;
	moveTimeline: (deltaX: number) => void
	handleViewChange: (view: string) => void
}


function FlightTimeline(props: FlightTimelineProps) {
	const { onCreateBookingItem, isItemDragging, isItemIsResizing, handleViewChange, moveTimeline, row } = props;
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
				<FlightRow
					id={row.id}
					key={row.id}
					groupId={'group'}
					onCreateBookingItem={onCreateBookingItem}
					items={row.items}
					isUpdating={isItemDragging || isItemIsResizing}
				/>
			</div>
		</div>

	);
}

export default FlightTimeline;
