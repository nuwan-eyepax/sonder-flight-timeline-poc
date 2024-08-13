import type { RowDefinition } from "dnd-timeline";
import { useRow } from "dnd-timeline";
import type React from "react";
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { DndContext } from '@dnd-kit/core';
import { memo } from "react";

interface FlightProps extends RowDefinition {
	children: React.ReactNode;
	sidebar: React.ReactNode;
}

function Flight(props: FlightProps) {
	const {
		setNodeRef,
		setSidebarRef,
		rowWrapperStyle,
		rowStyle,
		rowSidebarStyle,
	} = useRow({ id: props.id });
	return (
		<div style={{ ...rowWrapperStyle, minHeight: 20, background: "gray", border: "1px solid", marginBottom: "2px" }}>
			<div ref={setSidebarRef} style={rowSidebarStyle}>
				{props.sidebar}
			</div>
			<div ref={setNodeRef} style={{ ...rowStyle, }}>
				{props.children}
			</div>
		</div>
	);
}

export default memo(Flight);
