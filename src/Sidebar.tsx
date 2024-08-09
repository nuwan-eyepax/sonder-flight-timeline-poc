import { useSortable } from "@dnd-kit/sortable";
import type { RowDefinition } from "dnd-timeline";

import { ItemType } from "./utils";

interface SidebarProps {
	row: RowDefinition;
}

function Sidebar(props: SidebarProps) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: props.row.id, data: { type: ItemType.SidebarItem } });

	const style = {
		transition,
		width: "200px",
		border: "1px solid",
		cursor: "grab",
		...(transform && {
			transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
		}),
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			{`Row ${props.row.id}`}
		</div>
	);
}

export default Sidebar;
