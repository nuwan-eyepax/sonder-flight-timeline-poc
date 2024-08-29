
import React, { memo, useMemo } from "react";
import { useItem } from "dnd-timeline";
import type { ItemDefinition, Span } from "dnd-timeline";

export interface TimelineItemProps {
	id: string; // booking item id, unique id in dnd-timeline context.
	span: Span; // dnd-timeline span object which contains start and end time in epoch.
	formatPeriod: number; // difference between to two spanning positions of the timeline in milliseconds.
	isCreating?: boolean; //if the booking is on creating.
	rowId?: string; // row id, unique id in dnd-timeline context.
	groupId?: string; // group id, unique id in dnd-timeline context.
	disabled?: boolean;
}
export type TimelineItemDefinition = ItemDefinition & { groupId: string };

const TimelineItem = (props: TimelineItemProps) => {
	const { groupId, rowId, isCreating, formatPeriod, disabled } = props
	const { setNodeRef, attributes, listeners, itemStyle, itemContentStyle, } =
		useItem({
			id: props.id,
			span: props.span,
			data: {
				type: 'BOOKING_ITEM',
				groupId,
				rowId,
				formatPeriod
			},
			disabled: disabled || isCreating
		});
	const flightItemStyle = useMemo(() => {
		return {
			opacity: props.isCreating ? 0.9 : 1,
			color: 'white',
			background: props.isCreating ? "rgba(46, 125, 50, 0.5)" : "#1B5E20", // Dark and ghostly when creating
			border: props.isCreating ? '1px dashed #B2FF59' : "1px solid #004D40",
			borderRadius: '5px',
			filter: props.isCreating ? 'blur(0.5px) brightness(1.1)' : 'brightness(1)',
			transition: 'all 0.3s ease',
			width: "100%",
			overflow: "hidden",
			cursor: props.isCreating ? 'pointer' : undefined,
			transform: props.isCreating ? 'scale(1.02)' : 'scale(1)',
			padding: '10px 15px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: '0.7rem',
		};
	}, [props.isCreating]);
	return (
		<div ref={setNodeRef} style={itemStyle} {...listeners} {...attributes}>
			<div style={itemContentStyle}>
				<div
					style={flightItemStyle}
				>
					<span style={{ marginRight: "10px" }}>
						{new Date((props.span).start).toLocaleDateString()}
					</span>
					<span>
						{new Date((props.span).end).toLocaleDateString()}
					</span>
				</div>
			</div>
		</div>
	);
}

export default memo(TimelineItem);