import React, { memo } from "react";

export interface FlightGroupRowProps {
	children: React.ReactNode;
	id: string;
}
const FlightGroupRow = (props: FlightGroupRowProps) => {

	return <div style={{ display: 'flex', flexDirection: "column" }}><div>
		Flight Group :{props.id}</div> {props.children}</div>
}
export default memo(FlightGroupRow)