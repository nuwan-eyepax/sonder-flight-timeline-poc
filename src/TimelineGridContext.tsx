import { useTimelineContext } from "dnd-timeline";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { MarkerDefinition } from "./TimeAxis";
export interface Marker {
    label?: string;
    sideDelta: number;
    heightMultiplier: number;
}
interface TimelineGridContextInterface {
    formatPeriod: number;
    delta: number;
    markers: Marker[];
    gridPositions: number[];
    setFormatPeriod: (value: number) => void;
}
const DAY_IN_MS = 1000 * 60 * 60 * 24; // 1 day in milliseconds

const TimelineGridContext = createContext<TimelineGridContextInterface | undefined>(undefined);

export const useTimelineGridContext = () => {
    const context = useContext(TimelineGridContext);
    if (context === undefined) {
        throw new Error("useTimelineGridContext must be used within a TimelineGridContext");
    }
    return context;
};

export const TimelineGridProvider: React.FC<{ children: ReactNode, markerDefinitions: MarkerDefinition[] }> = ({ children, markerDefinitions }) => {
    const [formatPeriod, setFormatPeriod] = useState<number>(DAY_IN_MS);
    const handleFormatPeriod = (value: number) => {
        setFormatPeriod(value * DAY_IN_MS)
    }
    const { range, valueToPixels, sidebarWidth, pixelsToValue } =
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
    const gridPositions = useMemo(() => {
        const markerSideDeltas: number[] = [];
        for (const marker of markers) {
            const startTime = pixelsToValue(marker.sideDelta);
            const endTime = startTime + delta;
            for (let time = startTime; time <= endTime; time += formatPeriod) {
                markerSideDeltas.push(valueToPixels(time));
            }
        }
        return markerSideDeltas;
    }, [delta, formatPeriod, markers, pixelsToValue, valueToPixels]);
    return (
        <TimelineGridContext.Provider value={{ formatPeriod, delta, markers, gridPositions, setFormatPeriod: handleFormatPeriod }}>
            {children}
        </TimelineGridContext.Provider>
    );
};

export default TimelineGridContext;