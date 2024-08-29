import { useSortable } from "@dnd-kit/sortable";

export interface TimelineRowSidebarProps {
	rowId: string;
	groupId: string;
	showHandler?: boolean;
}

const TimelineRowSidebar = (props: TimelineRowSidebarProps) => {
	const { groupId, rowId } = props
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id: rowId,
			data: {
				type: 'TIMELINE_ROW_SIDEBAR',
				groupId
			}
		});
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
			{`Flight ${rowId}`}
		</div>
	);
}

export default TimelineRowSidebar;
