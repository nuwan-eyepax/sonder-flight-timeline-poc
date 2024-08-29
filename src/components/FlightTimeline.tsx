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
	onCreateTimelineItem: (item: TimelineItemDefinition) => void;
	moveTimeline: (deltaX: number) => void
	handleViewChange: (view: string) => void
}


function FlightTimeline(props: FlightTimelineProps) {
	const { onCreateTimelineItem, isItemDragging, isItemIsResizing, handleViewChange, moveTimeline, row } = props;
	const { setTimelineRef, style } = useTimelineContext();
	const { timelineGridDelta, setTimelineGridDelta } = useTimelineGridContext();
	return (
		<div>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<div>
					<button onClick={() => handleViewChange('week')}>Week</button>
					<button onClick={() => handleViewChange('month')}>Month</button>
					<button onClick={() => handleViewChange('quarter')}>Quarter</button>
				</div>
				<div>
					<button onClick={() => setTimelineGridDelta(1)}> 1 Day</button>
					<button onClick={() => setTimelineGridDelta(0.5)}>0.5 Days</button>
					<button onClick={() => setTimelineGridDelta(2)}> 2 Days</button>
				</div>
				<div>
					<button onClick={() => moveTimeline(-timelineGridDelta)}>{`<<`}</button>
					<button onClick={() => moveTimeline(+timelineGridDelta)}>{`>>`}</button>
				</div>
			</div>

			<TimeAxis />

			<div ref={setTimelineRef} style={{ ...style }}>
				<FlightRow
					id={row.id}
					key={row.id}
					groupId={'group'}
					onCreateTimelineItem={onCreateTimelineItem}
					items={row.items}
					isUpdating={isItemDragging || isItemIsResizing}
				/>
			</div>
		</div>

	);
}

export default FlightTimeline;
