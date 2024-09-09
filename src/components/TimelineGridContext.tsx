import { createContext, ReactNode, useContext, useState } from "react";
import { defaultDelta } from "../utils";

interface TimelineGridContextInterface {
  delta: number;
  setDelta: (value: number) => void;
}

const TimelineGridContext = createContext<
  TimelineGridContextInterface | undefined
>(undefined);

export const useTimelineGridContext = () => {
  const context = useContext(TimelineGridContext);
  if (context === undefined) {
    throw new Error(
      "useTimelineGridContext must be used within a TimelineGridContext"
    );
  }
  return context;
};

export const TimelineGridContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [delta, setDelta] = useState<number>(defaultDelta);
  return (
    <TimelineGridContext.Provider value={{ delta, setDelta }}>
      {children}
    </TimelineGridContext.Provider>
  );
};
