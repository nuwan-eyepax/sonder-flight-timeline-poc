import React, { useState } from "react";
import { useTimelineContext } from "dnd-timeline";
import FlightRow from "./TimelineRow";
import TimeAxis from "./TimeScaleAxis";
import { useTimelineGridContext } from "./TimelineGridContext";
import { TimelineItemDefinition } from "./TimelineItem";
import { defaultDelta, timeAxisMarkers } from "../utils";

export interface FlightTimelineProps {
  row: {
    id: string;
    groupId: string;
    items: TimelineItemDefinition[];
  };
  isItemDragging: boolean;
  isItemIsResizing: boolean;
  onCreateTimelineItem: (item: TimelineItemDefinition) => void;
  moveTimeline: (deltaX: number) => void;
  onChangeView: (view: string) => void;
}

function FlightTimeline(props: FlightTimelineProps) {
  const {
    onCreateTimelineItem,
    moveTimeline,
    onChangeView,
    isItemDragging,
    isItemIsResizing,
    row,
  } = props;
  const { setTimelineRef, style } = useTimelineContext();
  const { setDelta, delta } = useTimelineGridContext();
  const [view, setView] = useState("week");
  const handleViewChange = (view: string) => {
    setView(view);
    onChangeView(view);
  };
  const onChangeDelta = (value: number) => {
    setDelta(value * defaultDelta);
  };
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <button onClick={() => handleViewChange("week")}>Week</button>
          <button onClick={() => handleViewChange("month")}>Month</button>
          <button onClick={() => handleViewChange("quarter")}>Quarter</button>
        </div>
        <div>
          <button onClick={() => onChangeDelta(1)}> 1 Day</button>
          <button onClick={() => onChangeDelta(0.5)}>0.5 Days</button>
          <button onClick={() => onChangeDelta(2)}> 2 Days</button>
        </div>
        <div>
          <button onClick={() => moveTimeline(-delta)}>{`<<`}</button>
          <button onClick={() => moveTimeline(+delta)}>{`>>`}</button>
        </div>
      </div>

      <TimeAxis markerDefinitions={timeAxisMarkers[view]} />

      <div ref={setTimelineRef} style={{ ...style }}>
        <FlightRow
          id={row.id}
          key={row.id}
          groupId={"group"}
          onCreateTimelineItem={onCreateTimelineItem}
          items={row.items}
          isUpdating={isItemDragging || isItemIsResizing}
        />
      </div>
    </div>
  );
}

export default FlightTimeline;
