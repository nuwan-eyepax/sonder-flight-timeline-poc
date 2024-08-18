import { useItem } from "dnd-timeline";
import type { Span } from "dnd-timeline";
import type React from "react";
import { ItemType } from "./utils";
import { memo } from "react";

interface ItemProps {
	id: string;
	groupId: string;
	span: Span;
	children: React.ReactNode;
	isCreating?: boolean
}

function FlightItem(props: ItemProps) {
	const { setNodeRef, attributes, listeners, itemStyle, itemContentStyle,  } =
		useItem({
			id: props.id,
			span: props.span,
			data: {
				type: ItemType.ListItem,
				groupId: props.groupId
			}
		});
		console.log(itemStyle)
	return (
		<div ref={setNodeRef} style={itemStyle} {...listeners} {...attributes}>
			<div style={itemContentStyle}>
				<div
					style={{
						border: "1px solid white",
						width: "100%",
						overflow: "hidden",
						color: "black",
						background: props.isCreating ? "yellow" : "green",
					}}
				>
					{props.children}
				</div>
			</div>
		</div>
	);
}

export default memo(FlightItem);
