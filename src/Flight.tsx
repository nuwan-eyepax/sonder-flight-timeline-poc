import type React from "react";
import { memo, useRef, useState } from "react";
import type { RowDefinition } from "dnd-timeline";
import { useRow, useTimelineContext } from "dnd-timeline";
import { useMarkers } from "./useMarkers";
import { MarkerDefinition } from "./TimeAxis";
import Sidebar from "./Sidebar";
import { FlightItemDefinition } from "./FlightTimeline";
import { nanoid } from "nanoid";
import { endOfDay, startOfDay } from "date-fns";
interface FlightProps extends RowDefinition {
	children: React.ReactNode;
	markers: MarkerDefinition[];
	groupId: string;
	onCreateFlightItem: (item: FlightItemDefinition) => void
	onRemoveFlightItem: (item: FlightItemDefinition) => void
}

function Flight(props: FlightProps) {
	const { id, children, groupId } = props;
	const {
		setNodeRef,
		setSidebarRef,
		rowWrapperStyle,
		rowStyle,
		rowSidebarStyle,
	} = useRow({ id });
	const { pixelsToValue, range, valueToPixels, sidebarWidth, } = useTimelineContext();
	const { markers, delta } = useMarkers(props.markers);
	const [currentItem, setCurrentItem] = useState<FlightItemDefinition>();

	const handleMouseOverFlight = (e: React.MouseEvent<HTMLDivElement>, groupId: string, flightId: string) => {
		const { clientX } = e;
		const deltaPixel = valueToPixels(delta)
		const startDate = pixelsToValue(clientX - sidebarWidth) + range.start;
		console.log(delta)
		const flightItem: FlightItemDefinition = {
			id: `item-${nanoid(3)}`,
			span: {
				start: (Math.floor(startDate / delta) * delta),
				end: (Math.floor(startDate / delta) * delta) + delta
			},
			groupId,
			flightId
		}
		setCurrentItem(flightItem);
		// console.log(flightItem);
		props.onCreateFlightItem(flightItem);


	};
	const handleMouseLeaveFlight = () => {
		currentItem && props.onRemoveFlightItem(currentItem)
	}
	return (
		<div style={{ ...rowWrapperStyle, minHeight: 20, background: "gray", border: "1px solid", marginBottom: "2px" }}>
			<div ref={setSidebarRef} style={{ ...rowSidebarStyle }} >
				<Sidebar row={{ id }} groupId={groupId} />
			</div>
			<div ref={setNodeRef}
				style={{ ...rowStyle }}
			>
				{markers.map((marker, index) => (
					<div
						key={`flight-${marker.sideDelta}-${index}`}
						style={{
							position: "absolute",
							bottom: 0,
							display: "flex",
							flexDirection: "row",
							justifyContent: "flex-start",
							alignItems: "flex-end",
							height: "100%",
							marginLeft: `${marker.sideDelta}px`,
						}}
					>
						<div
							style={{
								width: "1px",
								height: `100%`,
								backgroundColor: "red", // Vertical line color
							}}
						/>

					</div>
				))}
				<div
					onMouseLeave={handleMouseLeaveFlight}
					onMouseOver={(e) => handleMouseOverFlight(e, groupId, id)}
					style={{ width: '100%', height: "100%" }}
				>
					{children}
				</div>

			</div>
		</div>
	);
}

export default memo(Flight);
