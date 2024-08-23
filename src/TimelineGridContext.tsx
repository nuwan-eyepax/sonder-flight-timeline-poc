import { createContext, ReactNode, useContext, useState } from "react";

interface TimelineGridContextInterface {
    delta: number;
    setDelta: (value: number) => void;
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

export const TimelineGridProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [delta, setDelta] = useState<number>(DAY_IN_MS);

    return (
        <TimelineGridContext.Provider value={{ delta, setDelta }}>
            {children}
        </TimelineGridContext.Provider>
    );
};

export default TimelineGridContext;