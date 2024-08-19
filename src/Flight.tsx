import type React from "react";
import { memo, useCallback, useEffect, useState } from "react";
import type { RowDefinition, Span } from "dnd-timeline";
import { useRow, useTimelineContext } from "dnd-timeline";
import { useMarkers } from "./useMarkers";
import { MarkerDefinition } from "./TimeAxis";
import Sidebar from "./Sidebar";
import { FlightItemDefinition } from "./FlightTimeline";
import { nanoid } from "nanoid";
import FlightItem from "./FlightItem";
interface FlightProps extends RowDefinition {
	markers: MarkerDefinition[];
	groupId: string;
	onCreateFlightItem: (item: FlightItemDefinition) => void;
	items: {
		id: string;
		flightId: string;
		span: Span,
		isCreating: boolean
	}[];
	isUpdating: boolean
}

function Flight(props: FlightProps) {
	const { id, items, groupId, markers: markerDefs, onCreateFlightItem, isUpdating } = props;
	const {
		setNodeRef,
		setSidebarRef,
		rowWrapperStyle,
		rowStyle,
		rowSidebarStyle,
	} = useRow({ id });
	const { pixelsToValue, range, sidebarWidth, } = useTimelineContext();
	const { markers, delta } = useMarkers(markerDefs);
	const [currentItem, setCurrentItem] = useState<FlightItemDefinition>();
	const isOverlapping = useCallback((startValue: number) => {
		return items.findIndex(({ span }) => span.start === startValue) > -1
	}, [items])
	const handleMouseOverFlight = useCallback((e: React.MouseEvent<HTMLDivElement>, groupId: string, flightId: string) => {
		if (isUpdating) {
			return
		}
		const { clientX } = e;
		const startDate = pixelsToValue(clientX - sidebarWidth) + range.start;
		const start = Math.floor(startDate / delta) * delta;
		if (!isOverlapping(start)) {
			const flightItem: FlightItemDefinition = {
				id: `item-${nanoid(3)}`,
				span: {
					start: start,
					end: start + delta
				},
				groupId,
				flightId,
			}
			setCurrentItem(flightItem);
		}
	}, [delta, isOverlapping, pixelsToValue, range.start, sidebarWidth, isUpdating]);

	const handleMouseLeaveFlight = useCallback(() => {
		currentItem && setCurrentItem(undefined);
	}, [currentItem]);

	const handleClick = useCallback(() => {
		currentItem && onCreateFlightItem(currentItem);
	}, [currentItem, onCreateFlightItem]);
	const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (currentItem) {
			const { clientX } = e;
			const startDate = pixelsToValue(clientX - sidebarWidth) + range.start;
			const currentStart = Math.floor(startDate / delta) * delta;
			if (currentItem.span.start > currentStart) {
				setCurrentItem(undefined);
			} else {
				if (!isOverlapping(currentStart)) {
					setCurrentItem((prev) => {
						if (prev) {
							return {
								...prev,
								span: {
									start: prev.span.start,
									end: currentStart + delta
								}
							}
						}
					});
				}
			}
		}
	}, [currentItem, delta, isOverlapping, pixelsToValue, range.start, sidebarWidth]);
	useEffect(() => {
		setCurrentItem(undefined);
	}, [isUpdating])
	return (
		<div style={{ ...rowWrapperStyle, minHeight: 20, background: "gray", zIndex: 10, border: "1px solid", marginBottom: "1px" }}>
			<div ref={setSidebarRef} style={{ ...rowSidebarStyle }} >
				<Sidebar row={{ id }} groupId={groupId} />
			</div>
			<div ref={setNodeRef}
				style={{ ...rowStyle }}
			>
				{/* {markers.map((marker, index) => (
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
								zIndex: -1
							}}
						/>

					</div>
				))} */}
				<div
					onMouseLeave={handleMouseLeaveFlight}
					onMouseEnter={(e) => handleMouseOverFlight(e, groupId, id)}
					onMouseMove={handleMouseMove}
					onClick={handleClick}
					style={{ width: '100%', height: "100%" }}
				>	{currentItem && (
					<FlightItem
						id={currentItem.id}
						span={currentItem.span}
						groupId={currentItem.groupId}
						key={currentItem.id}
						isCreating
						delta={delta}
					/>)}
					{items.map((item) => (
						<FlightItem
							id={item.id}
							key={item.id}
							span={item.span}
							groupId={groupId}
							isCreating={item.isCreating}
							delta={delta}
						/>
					))}
				</div>

			</div>
		</div>
	);
}

export default memo(Flight);
