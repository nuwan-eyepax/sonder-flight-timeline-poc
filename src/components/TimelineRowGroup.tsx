import React, { memo, useEffect, useState } from "react";
import { Span, useTimelineContext } from "dnd-timeline";
import { useTimelineGridContext } from "./TimelineGridContext";
import TimelineItem, { TimelineItemDefinition } from "./TimelineItem";

type GroupItemDefinition = Omit<TimelineItemDefinition, 'rowId'>;
export interface FlightGroupRowProps {
	children: React.ReactNode;
	id: string;
	rows: {
		id: string;
		groupId: string;
		items: TimelineItemDefinition[]
	}[]
}
const TimelineRowGroup = (props: FlightGroupRowProps) => {
	const [groupItem, setGroupItem] = useState<GroupItemDefinition>();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const { formatPeriod } = useTimelineGridContext();
	const { sidebarWidth, range, pixelsToValue } = useTimelineContext();
	const handleCollapse = () => {
		setIsCollapsed((isCollapsed) => (!isCollapsed))
	}
	useEffect(() => {
		let aggregatedSpan: Span = {
			start: 0,
			end: 0
		};
		for (let i = 0; i < props.rows.length; i++) {
			let row = props.rows[i];

			for (let j = 0; j < row.items.length; j++) {
				let item = row.items[j];
				let { start, end } = item.span;
				if (aggregatedSpan.start === 0 || start < aggregatedSpan.start) {
					aggregatedSpan.start = start;
				}
				if (aggregatedSpan.end === 0 || end > aggregatedSpan.end) {
					aggregatedSpan.end = end;
				}
			}
		}
		setGroupItem({
			groupId: props.id,
			span: {
				start: aggregatedSpan.start + pixelsToValue(sidebarWidth),
				end: aggregatedSpan.end + pixelsToValue(sidebarWidth)

			},
			id: `row-group-${props.id}`,
		})
	}, [pixelsToValue, props.rows, props.id, range, sidebarWidth]);

	return (<div style={{ display: 'flex', flexDirection: "column" }}>
		<div style={{
			display: 'flex',
			flexDirection: "row",
			position: 'relative',
			backgroundColor: 'gray',
			width: '100%',
			height: '40px',
		}}
		>
			<div style={{
				width: sidebarWidth,
				background: 'gray',
				cursor: 'pointer',
				border: "1px solid",
				marginBottom: "1px"
			}}
				onClick={handleCollapse}>
				Flight Group :{props.id}
			</div>
			{groupItem && <TimelineItem
				id={groupItem.id}
				span={groupItem.span}
				groupId={groupItem.groupId}
				formatPeriod={formatPeriod}
				disabled
			/>}

		</div>
		{isCollapsed ? null : props.children}
	</div >)
}
export default memo(TimelineRowGroup)