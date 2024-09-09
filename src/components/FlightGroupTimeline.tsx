import React, { useState } from "react";
import { useTimelineContext } from "dnd-timeline";
import { defaultDelta, Group, timeAxisMarkers } from "../utils";
import { useTimelineGridContext } from "./TimelineGridContext";
import { TimelineItemDefinition } from "./TimelineItem";
import TimelineRow from "./TimelineRow";
import TimeAxis from "./TimeScaleAxis";
import TimelineRowGroup from "./TimelineRowGroup";

export interface FlightTimelineProps {
  group: Group;
  isItemDragging: boolean;
  isItemIsResizing: boolean;
  onCreateTimelineItem: (item: TimelineItemDefinition) => void;
  moveTimeline: (deltaX: number) => void;
  onChangeView: (view: string) => void;
}

function FlightGroupTimeline(props: FlightTimelineProps) {
  const {
    onCreateTimelineItem,
    isItemDragging,
    isItemIsResizing,
    onChangeView,
    moveTimeline,
    group,
  } = props;
  const { setTimelineRef, style } = useTimelineContext();
  const { delta, setDelta } = useTimelineGridContext();
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
      <TimelineRowGroup id={group.id} key={group.id} rows={group.rows}>
        <div ref={setTimelineRef} style={{ ...style }}>
          {group.rows?.map((row) => (
            <TimelineRow
              id={row.id}
              key={row.id}
              groupId={row.groupId}
              onCreateTimelineItem={onCreateTimelineItem}
              items={row.items}
              isUpdating={isItemDragging || isItemIsResizing}
            />
          ))}
        </div>
      </TimelineRowGroup>
    </div>
  );
}

export default FlightGroupTimeline;
