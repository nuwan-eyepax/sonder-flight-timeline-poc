import { useSortable } from "@dnd-kit/sortable";

export interface FlightSidebarProps {
	flightId: string;
	flightGroupId: string;
	showHandler?: boolean;
}

const FlightSidebar = (props: FlightSidebarProps) => {
	const { flightGroupId, flightId } = props
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id: flightId,
			data: {
				type: 'FLIGHT_SIDE_BAR',
				flightGroupId
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
			{`Flight ${flightId}`}
		</div>
	);
}

export default FlightSidebar;
