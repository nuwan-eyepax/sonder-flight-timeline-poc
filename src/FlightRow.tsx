import type React from "react";
import { memo, useCallback, useEffect, useState } from "react";
import type { RowDefinition } from "dnd-timeline";
import { useRow, useTimelineContext } from "dnd-timeline";
import Sidebar from "./Sidebar";
import { FlightItemDefinition } from "./FlightTimeline";
import { nanoid } from "nanoid";
import FlightItem from "./BookingItem";
import { useTimelineGridContext } from "./TimelineGridContext";
interface FlightRowProps extends RowDefinition {
	groupId: string;
	onCreateFlightItem: (item: FlightItemDefinition) => void;
	items: FlightItemDefinition[];
	isUpdating: boolean
}

const FlightRow = (props: FlightRowProps) => {
	const { id, items, groupId, onCreateFlightItem, isUpdating } = props;
	const {
		setNodeRef,
		setSidebarRef,
		rowWrapperStyle,
		rowStyle,
		rowSidebarStyle,
	} = useRow({ id });
	const { pixelsToValue, range, sidebarWidth, } = useTimelineContext();
	const { formatPeriod } = useTimelineGridContext();
	const [creatingItem, setCreatingItem] = useState<FlightItemDefinition>();
	const isOverlapping = useCallback((startValue: number) => {
		return items.findIndex(({ span }) => span.start === startValue) > -1
	}, [items])
	const handleMouseOverFlight = useCallback((e: React.MouseEvent<HTMLDivElement>, groupId: string, flightId: string) => {
		if (isUpdating) {
			return
		}
		const { clientX } = e;
		const startDate = pixelsToValue(clientX - sidebarWidth) + range.start;
		const start = Math.floor(startDate / formatPeriod) * formatPeriod;
		if (!isOverlapping(start)) {
			const flightItem: FlightItemDefinition = {
				id: `item-${nanoid(3)}`,
				span: {
					start: start,
					end: start + formatPeriod
				},
				groupId,
				flightId,
			}
			setCreatingItem(flightItem);
		}
	}, [formatPeriod, isOverlapping, pixelsToValue, range.start, sidebarWidth, isUpdating]);

	const handleMouseLeaveFlight = useCallback(() => {
		creatingItem && setCreatingItem(undefined);
	}, [creatingItem]);

	const handleClick = useCallback(() => {
		creatingItem && onCreateFlightItem(creatingItem);
	}, [creatingItem, onCreateFlightItem]);
	const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (creatingItem) {
			const { clientX } = e;
			const startDate = pixelsToValue(clientX - sidebarWidth) + range.start;
			const currentStart = Math.floor(startDate / formatPeriod) * formatPeriod;
			if (creatingItem.span.start > currentStart) {
				setCreatingItem(undefined);
			} else {
				if (!isOverlapping(currentStart)) {
					setCreatingItem((prev) => {
						if (prev) {
							return {
								...prev,
								span: {
									start: prev.span.start,
									end: currentStart + formatPeriod
								}
							}
						}
					});
				}
			}
		}
	}, [creatingItem, formatPeriod, isOverlapping, pixelsToValue, range.start, sidebarWidth]);
	useEffect(() => {
		setCreatingItem(undefined);
	}, [isUpdating]);
	return (
		<div style={{ ...rowWrapperStyle, minHeight: 20, background: "gray", border: "1px solid", marginBottom: "1px" }}>
			<div ref={setSidebarRef} style={{ ...rowSidebarStyle }} >
				<Sidebar flightId={id} flightGroupId={groupId} />
			</div>
			<div ref={setNodeRef} style={{ ...rowStyle, position: 'relative' }}>
				<div
					onMouseLeave={handleMouseLeaveFlight}
					onMouseEnter={(e) => handleMouseOverFlight(e, groupId, id)}
					onMouseMove={handleMouseMove}
					onClick={handleClick}
					style={{ width: '100%', height: "100%", position: 'relative' }}
				>
					{creatingItem && (
						<FlightItem
							id={creatingItem.id}
							span={creatingItem.span}
							flightGroupId={creatingItem.groupId}
							key={creatingItem.id}
							isCreating
							delta={formatPeriod}
							flightId={creatingItem.flightId} />
					)}
					{items.map((item) => (
						<FlightItem
							id={item.id}
							key={item.id}
							span={item.span}
							flightGroupId={groupId}
							delta={formatPeriod}
							flightId={item.flightId}
						/>
					))}
				</div>
			</div>

		</div>
	);
}

export default memo(FlightRow);
