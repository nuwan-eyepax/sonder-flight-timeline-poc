import type React from "react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { RowDefinition } from "dnd-timeline";
import { useRow, useTimelineContext } from "dnd-timeline";
import TimelineRowSidebar from "./TimelineRowSidebar";
import { nanoid } from "nanoid";
import TimelineItem, { TimelineItemDefinition } from "./TimelineItem";
import { useTimelineGridContext } from "./TimelineGridContext";

interface FlightRowProps extends RowDefinition {
  groupId?: string;
  items: TimelineItemDefinition[];
  isUpdating: boolean;
  onCreateTimelineItem: (item: TimelineItemDefinition) => void;
}

const TimelineRow = (props: FlightRowProps) => {
  const { id, items, groupId, onCreateTimelineItem, isUpdating } = props;
  const {
    setNodeRef,
    setSidebarRef,
    rowWrapperStyle,
    rowStyle,
    rowSidebarStyle,
  } = useRow({ id });
  const { pixelsToValue, valueToPixels, range, sidebarWidth } =
    useTimelineContext();
  const { delta } = useTimelineGridContext();
  const gridPositions = useMemo(() => {
    const markerSideDeltas: number[] = [];
    const startTime = range.start;
    const endTime = range.end;
    for (let time = startTime; time <= endTime; time += delta) {
      markerSideDeltas.push(valueToPixels(time) + sidebarWidth);
    }
    return markerSideDeltas;
  }, [range.start, range.end, delta, valueToPixels, sidebarWidth]);
  const [creatingItem, setCreatingItem] = useState<TimelineItemDefinition>();
  const isOverlapping = useCallback(
    (startValue: number) => {
      return items.findIndex(({ span }) => span.start === startValue) > -1;
    },
    [items]
  );
  const handleMouseOverFlight = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, groupId: string, rowId: string) => {
      if (isUpdating) {
        return;
      }
      const { clientX } = e;
      const startDate = pixelsToValue(clientX - sidebarWidth) + range.start;
      const start = Math.floor(startDate / delta) * delta;
      if (!isOverlapping(start)) {
        const BookingItem: TimelineItemDefinition = {
          id: `item-${nanoid(3)}`,
          span: {
            start: start,
            end: start + delta,
          },
          groupId,
          rowId,
        };
        setCreatingItem(BookingItem);
      }
    },
    [delta, isOverlapping, pixelsToValue, range.start, sidebarWidth, isUpdating]
  );

  const handleMouseLeaveFlight = useCallback(() => {
    creatingItem && setCreatingItem(undefined);
  }, [creatingItem]);

  const handleClick = useCallback(() => {
    creatingItem && onCreateTimelineItem(creatingItem);
  }, [creatingItem, onCreateTimelineItem]);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (creatingItem) {
        const { clientX } = e;
        const startDate = pixelsToValue(clientX - sidebarWidth) + range.start;
        const currentStart = Math.floor(startDate / delta) * delta;
        if (creatingItem.span.start > currentStart) {
          setCreatingItem(undefined);
        } else {
          if (!isOverlapping(currentStart)) {
            setCreatingItem((prev) => {
              if (prev) {
                return {
                  ...prev,
                  span: {
                    start: prev.span.start,
                    end: currentStart + delta,
                  },
                };
              }
            });
          }
        }
      }
    },
    [
      creatingItem,
      delta,
      isOverlapping,
      pixelsToValue,
      range.start,
      sidebarWidth,
    ]
  );
  useEffect(() => {
    setCreatingItem(undefined);
  }, [isUpdating]);
  return (
    <div
      style={{
        ...rowWrapperStyle,
        minHeight: 40,
        background: "gray",
        border: "1px solid",
        marginBottom: "1px",
      }}
    >
      <div ref={setSidebarRef} style={{ ...rowSidebarStyle }}>
        <TimelineRowSidebar rowId={id} groupId={groupId!} />
      </div>
      <div ref={setNodeRef} style={{ ...rowStyle, position: "relative" }}>
        {gridPositions.map((sideDelta, index) => (
          <div
            key={`flight-${sideDelta}-${index}`}
            style={{
              position: "absolute",
              bottom: 0,
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "flex-end",
              height: "100%",
              marginLeft: `${sideDelta}px`,
            }}
          >
            <div
              style={{
                width: "1px",
                height: `100%`,
                backgroundColor: "white", // Vertical line color
              }}
            />
          </div>
        ))}
        <div
          onMouseLeave={handleMouseLeaveFlight}
          onMouseEnter={(e) => handleMouseOverFlight(e, groupId!, id)}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{ width: "100%", height: "100%", position: "relative" }}
        >
          {creatingItem && (
            <TimelineItem
              id={creatingItem.id}
              span={creatingItem.span}
              groupId={creatingItem.groupId}
              key={creatingItem.id}
              isCreating
              delta={delta}
              rowId={creatingItem.rowId}
            />
          )}
          {items.map((item) => (
            <TimelineItem
              id={item.id}
              key={item.id}
              span={item.span}
              groupId={groupId}
              delta={delta}
              rowId={item.rowId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(TimelineRow);
