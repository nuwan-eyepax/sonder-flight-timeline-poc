import React, { memo, useEffect, useMemo } from "react";
import { useTimelineContext } from "dnd-timeline";
import { useTimelineGridContext } from "./TimelineGridContext";
export interface MarkerDefinition {
	value: number; // This represents the time in milliseconds
	maxRangeSize?: number;
	minRangeSize?: number;
	getLabel?: (time: Date) => string;
}
export interface Marker {
	label?: string;
	sideDelta: number;
	heightMultiplier: number;
}

function TimeScaleAxis({ markerDefinitions }: { markerDefinitions: MarkerDefinition[] }) {
	const { sidebarWidth, range, valueToPixels } = useTimelineContext();
	const { delta } = useTimelineGridContext()
	const sortedMarkers = useMemo(() => {
		const sorted = [...markerDefinitions];
		sorted.sort((a, b) => b.value - a.value);
		return sorted;
	}, [markerDefinitions]);
	const markers = useMemo(() => {
		const rangeSize = range.end - range.start;
		const startTime = Math.floor(range.start / delta) * delta;
		const endTime = range.end;
		const markerSideDeltas: Marker[] = [];
		for (let time = startTime; time <= endTime; time += delta) {
			const multiplierIndex = sortedMarkers.findIndex((marker) => {
				const alignsWithInterval = (time) % marker.value === 0;
				const withinMaxRange = !marker.maxRangeSize || rangeSize <= marker.maxRangeSize;
				const withinMinRange = !marker.minRangeSize || rangeSize >= marker.minRangeSize

				return alignsWithInterval && withinMaxRange && withinMinRange;
			});
			if (multiplierIndex === -1) continue;
			const multiplier = sortedMarkers[multiplierIndex];
			const adjustedTime = new Date(time); // Adjust time from epoch
			const label = multiplier.getLabel?.(adjustedTime);
			markerSideDeltas.push({
				label,
				heightMultiplier: 1 / (multiplierIndex + 1),
				sideDelta: valueToPixels(time - range.start + sidebarWidth),
			});
		}
		return markerSideDeltas;
	}, [range.end, range.start, delta, sortedMarkers, valueToPixels, sidebarWidth]);
	return (
		<div
			style={{
				height: "50px",
				position: "relative",
				overflow: "hidden",
				marginLeft: `${sidebarWidth}px`,
			}}
		>
			<div>
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
							left: `${marker.sideDelta}px`,
						}}
					>
						<div
							style={{
								width: "1px",
								height: `${100 * marker.heightMultiplier}%`,
								backgroundColor: "red", // Vertical line color
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
		</div>
	);
}

export default memo(TimeScaleAxis);
