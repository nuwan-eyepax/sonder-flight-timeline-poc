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
	onCreateBookingItem: (item: TimelineItemDefinition) => void;
	moveTimeline: (deltaX: number) => void
	handleViewChange: (view: string) => void
}


function FlightGroupTimeline(props: FlightTimelineProps) {
	const { onCreateBookingItem, isItemDragging, isItemIsResizing, handleViewChange, moveTimeline, group } = props;
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
			<TimelineRowGroup id={group.id} key={group.id} rows={group.rows}>
				<div ref={setTimelineRef} style={{ ...style }}>
					{group.rows?.map((row) => (
						<TimelineRow
							id={row.id}
							key={row.id}
							groupId={row.groupId}
							onCreateBookingItem={onCreateBookingItem}
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
