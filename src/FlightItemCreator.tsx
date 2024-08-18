import { Span } from "dnd-timeline";
import React, { FC, useState } from "react";
interface FlightItemCreatorProps {
  span: Span;
  children: React.ReactNode;
}
const FlightItemCreator: FC<FlightItemCreatorProps> = (props: FlightItemCreatorProps) => {
  
  const [width, setWidth] = useState(200); // Initial width of the bar
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isResizing) {
      const newWidth = e.clientX - e.currentTarget.getBoundingClientRect().left;
      setWidth(newWidth);
    }
  };

  return (
    <div
      style={{
        display: "inline-block",
        position: "relative",
        height: "20px",
        background: "#3498db",
        width: `${width}px`,
        cursor: "ew-resize",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop resizing when the mouse leaves the bar
    >
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "10px",
          height: "100%",
          background: "#2980b9",
          cursor: "ew-resize",
        }}
      />
    </div>
  );
};

export default FlightItemCreator;
