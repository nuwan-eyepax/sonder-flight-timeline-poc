import React from "react";
import { useTimelineContext } from "dnd-timeline";
import { Group } from "../utils";
import { useTimelineGridContext } from "./TimelineGridContext";
import { TimelineItemDefinition } from "./TimelineItem";
import TimelineRow from "./TimelineRow";
import TimeAxis from "./TimeScaleAxis";
import TimelineRowGroup from "./TimelineRowGroup";

export interface FlightTimelineProps {
	group: Group,
	isItemDragging: boolean;
	isItemIsResizing: boolean;
	onCreateTimelineItem: (item: TimelineItemDefinition) => void;
	moveTimeline: (deltaX: number) => void
	handleViewChange: (view: string) => void
}


function FlightGroupTimeline(props: FlightTimelineProps) {
	const { onCreateTimelineItem, isItemDragging, isItemIsResizing, handleViewChange, moveTimeline, group } = props;
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
			<TimelineRowGroup id={group.id} key={group.id} rows={group.rows}>
				<div ref={setTimelineRef} style={{ ...style }}>
					{group.rows?.map((row) => (
						<TimelineRow
							id={row.id}
							key={row.id}
							groupId={row.groupId}
							onCreateTimelineItem={onCreateTimelineItem}
							items={row.items}
							isUpdating={isItemDragging || isItemIsResizing}
						/>
					))}
				</div>
			</TimelineRowGroup>
		</div>

	);
}

export default FlightGroupTimeline;
