import { useItem } from "dnd-timeline";
import type { Span } from "dnd-timeline";
import type React from "react";
import { ItemType } from "./utils";

interface ItemProps {
	id: string;
	groupId: string;
	span: Span;
	children: React.ReactNode;
}

function FlightItem(props: ItemProps) {
	const { setNodeRef, attributes, listeners, itemStyle, itemContentStyle } =
		useItem({
			id: props.id,
			span: props.span,
			data: {
				type: ItemType.ListItem,
				groupId: props.groupId
			}
		});

	return (
		<div ref={setNodeRef} style={itemStyle} {...listeners} {...attributes}>
			<div style={itemContentStyle}>
				<div
					style={{
						border: "1px solid white",
						width: "100%",
						overflow: "hidden",
						color: "black",
						background: "green",
					}}
				>
					{props.children}
				</div>
			</div>
		</div>
	);
}

export default FlightItem;
