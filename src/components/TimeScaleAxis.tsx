import React, { memo } from "react";
import { useTimelineContext } from "dnd-timeline";
import { useTimelineGridContext } from "./TimelineGridContext";
export interface MarkerDefinition {
	value: number; // This represents the time in milliseconds
	maxRangeSize?: number;
	minRangeSize?: number;
	getLabel?: (time: Date) => string;
}

function TimeScaleAxis() {
	const { direction, sidebarWidth } =
		useTimelineContext();
	const side = direction === "rtl" ? "right" : "left";
	const { markers } = useTimelineGridContext();
	return (
		<div
			style={{
				height: "50px",
				position: "relative",
				overflow: "hidden",
				[side === "right" ? "marginRight" : "marginLeft"]: `${sidebarWidth}px`,
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
							[side]: `${marker.sideDelta}px`,
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
