import React, { useMemo, memo } from "react";
import { format, startOfWeek, startOfMonth, startOfQuarter, addWeeks, addMonths, addQuarters } from "date-fns";
import { useTimelineContext } from "dnd-timeline";

interface Marker {
	label?: string;
	sideDelta: number;
	heightMultiplier: number;
}

export interface MarkerDefinition {
	value: number; // This represents the time in milliseconds
	maxRangeSize?: number;
	minRangeSize?: number;
	getLabel?: (time: Date) => string;
}

interface TimeAxisProps {
	markers: MarkerDefinition[];
}

function TimeAxis(props: TimeAxisProps) {
	const { range, direction, sidebarWidth, valueToPixels } =
		useTimelineContext();

	const side = direction === "rtl" ? "right" : "left";

	const markers = useMemo(() => {
		const sortedMarkers = [...props.markers];
		sortedMarkers.sort((a, b) => b.value - a.value);
		const delta = sortedMarkers[sortedMarkers.length - 1].value;
		const rangeSize = range.end - range.start;
		let startTime = Math.floor(range.start / delta) * delta;
		const endTime = range.end;
		// const timezoneOffset = new Date().getUTCMinutes() * 60 * 1000;

		const markerSideDeltas: Marker[] = [];

		for (let time = startTime; time <= endTime; time += delta) {
			const multiplierIndex = sortedMarkers.findIndex(
				(marker) =>
					(time) % marker.value === 0 &&
					(!marker.maxRangeSize || rangeSize <= marker.maxRangeSize) &&
					(!marker.minRangeSize || rangeSize >= marker.minRangeSize),
			);
			if (multiplierIndex === -1) continue;

			const multiplier = sortedMarkers[multiplierIndex];
			const adjustedTime = new Date(time); // Adjust time from epoch
			const label = multiplier.getLabel?.(adjustedTime) || format(adjustedTime, "yyyy-MM-dd");

			markerSideDeltas.push({
				label,
				heightMultiplier: 1 / (multiplierIndex + 1),
				sideDelta: valueToPixels(time - range.start),
			});
		}

		return markerSideDeltas;
	}, [range, valueToPixels, props.markers]);
	return (
		<div
			style={{
				height: "20px",
				position: "relative",
				overflow: "hidden",
				[side === "right" ? "marginRight" : "marginLeft"]: `${sidebarWidth}px`,
			}}
		>
			{markers.map((marker, index) => (
				<div
					key={`${marker.sideDelta}-${index}`}
					style={{
						position: "absolute",
						bottom: 0,
						display: "flex",
						flexDirection: "row",
						justifyContent: "flex-start",
						alignItems: "flex-end",
						height: "100%",
						[side]: `${marker.sideDelta}px`,
					}}
				>
					<div
						style={{
							width: "1px",
							height: `${100 * marker.heightMultiplier}%`,
						}}
					/>
					{marker.label ? (
						<div
							style={{
								paddingLeft: "3px",
								alignSelf: "flex-start",
								fontWeight: marker.heightMultiplier * 1000,
							}}
						>
							{marker.label}
						</div>
					) : null}
				</div>
			))}
		</div>
	);
}

export default memo(TimeAxis);
