import { useTimelineContext } from "dnd-timeline";
import { useMemo } from "react";
import { MarkerDefinition } from "./TimeAxis";
import { minutesToMilliseconds } from "date-fns";
export interface Marker {
    label?: string;
    sideDelta: number;
    heightMultiplier: number;
}
export const useMarkers = (markerDefinitions: MarkerDefinition[]) => {
    const { range, valueToPixels, sidebarWidth } =
        useTimelineContext();
    const sortedMarkers = useMemo(() => {
        const sortedMarkers = [...markerDefinitions];
        sortedMarkers.sort((a, b) => b.value - a.value);
        return sortedMarkers;
    }, [markerDefinitions])
    const delta = useMemo(() => {
        return sortedMarkers[sortedMarkers.length - 1].value;
    }, [sortedMarkers])
    const markers = useMemo(() => {
        const rangeSize = range.end - range.start;
        let startTime = Math.floor(range.start / delta) * delta;
        console.log(startTime, range.start)
        const endTime = range.end;

        const timezoneOffset = minutesToMilliseconds(
            new Date().getTimezoneOffset(),
        );
        const markerSideDeltas: Marker[] = [];

        for (let time = startTime; time <= endTime; time += delta) {
            console.log(new Date(time))
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
    }, [range.end, range.start, delta, sortedMarkers, valueToPixels,sidebarWidth]);
    return { markers, delta };
};