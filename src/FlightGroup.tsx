import React, { memo } from "react";

export interface FlightGroupProps {
	children: React.ReactNode;
	id: string;
}
const  FlightGroup = (props: FlightGroupProps)=> {
	// const groupedSubrows = useMemo(
	// 	() => groupItemsToSubrows(props.items, range),
	// 	[props.items, range],
	// );
	// const rowIds = useMemo(() => props.rows.map(({ id }) => id), [props.rows]);
	return <div style={{ display: 'flex', flexDirection: "column" }}><div>
		Flight Group :{props.id}</div> {props.children}</div>
}
export default memo(FlightGroup)