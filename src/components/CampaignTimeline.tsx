import React, { useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTimelineContext } from "dnd-timeline";
import { useTimelineGridContext } from "./TimelineGridContext";
import { TimelineItemDefinition } from "./TimelineItem";
import { defaultDelta, Group, timeAxisMarkers } from "../utils";
import TimelineRow from "./TimelineRow";
import TimeScaleAxis from "./TimeScaleAxis";
import TimelineRowGroup from "./TimelineRowGroup";

export interface FlightTimelineProps {
  groups: Group[];
  isItemDragging: boolean;
  isItemIsResizing: boolean;
  onCreateTimelineItem: (item: TimelineItemDefinition) => void;
  moveTimeline: (deltaX: number) => void;
  onChangeView: (view: string) => void;
}

function CampaignTimeline(props: FlightTimelineProps) {
  const {
    onCreateTimelineItem,
    isItemDragging,
    isItemIsResizing,
    onChangeView,
    moveTimeline,
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

      <TimeScaleAxis markerDefinitions={timeAxisMarkers[view]} />

      <div ref={setTimelineRef} style={{ ...style }}>
        {props.groups.map((group) => (
          <div key={group.id} style={{ marginBottom: "10px" }}>
            <TimelineRowGroup id={group.id} rows={group.rows}>
              <SortableContext
                items={group.rows.map(({ id }) => id)}
                strategy={verticalListSortingStrategy}
              >
                {group.rows.map((row) => (
                  <TimelineRow
                    id={row.id}
                    key={row.id}
                    groupId={row.groupId}
                    onCreateTimelineItem={onCreateTimelineItem}
                    items={row.items}
                    isUpdating={isItemDragging || isItemIsResizing}
                  />
                ))}
              </SortableContext>
            </TimelineRowGroup>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CampaignTimeline;
