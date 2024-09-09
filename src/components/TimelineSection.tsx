import { ReactNode, useState } from "react";

const TimelineSection = (props: { children: ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const handleCollapse = () => {
        setIsCollapsed((isCollapsed) => (!isCollapsed))
    }

    return (<div style={{ display: 'flex', flexDirection: "column" }} onClick={() => handleCollapse()}>


        {isCollapsed ? null : props.children}
    </div >)
};
export default TimelineSection